import { format, parseISO } from "date-fns";

import { addDaysISO, isISODate } from "./dateEngine";
import type { RecoveryInput } from "./inputs";
import { buildPeriod, periodProblem, type PeriodContext } from "./period";
import { RECOVERY } from "./rules";
import type { CalcAlert, CalcOutcome, ISODate } from "./types";

export const RECOVERY_CASE_LABEL = {
  sickness: { longterm: "Bệnh dài ngày", surgery: "Có phẫu thuật", other: "Trường hợp khác" },
  maternity: { multiple: "Sinh từ 2 con trở lên", surgery: "Sinh con phải phẫu thuật", other: "Trường hợp khác" },
} as const;

export function recoveryCap(input: RecoveryInput): number {
  if (input.after === "sickness") {
    const key = input.caseKind === "multiple" ? "other" : input.caseKind;
    return RECOVERY.afterSickness[key];
  }
  const key = input.caseKind === "longterm" ? "other" : input.caseKind;
  return RECOVERY.afterMaternity[key];
}

function caseLabel(input: RecoveryInput): string {
  const labels: Record<string, string> = RECOVERY_CASE_LABEL[input.after];
  return labels[input.caseKind] ?? labels.other;
}

const dmy = (iso: ISODate) => format(parseISO(iso), "dd/MM/yyyy");

export function calculateRecovery(input: RecoveryInput, ctx: PeriodContext): CalcOutcome {
  const missing: string[] = [];
  const problem = periodProblem(ctx);
  if (problem) missing.push(problem);
  if (missing.length > 0 || !ctx.start || !ctx.end) return { pending: true, rule: "continuous", missing };

  const citation = input.after === "sickness" ? RECOVERY.citations.sickness : RECOVERY.citations.maternity;
  const period = buildPeriod(ctx.start, ctx.end, "continuous", ctx);
  const alerts: CalcAlert[] = [...period.alerts];
  const limit = recoveryCap(input);
  const benefitDays = Math.min(period.counted, limit);

  if (period.counted > limit) {
    alerts.push({
      level: "danger",
      text: `Vượt mức tối đa ${limit} ngày (${caseLabel(input).toLowerCase()}): chỉ tính ${benefitDays}/${period.counted} ngày.`,
      citation,
    });
  }
  if (isISODate(input.prevEnd)) {
    const returnDate = addDaysISO(input.prevEnd, 1);
    const lastStart = addDaysISO(returnDate, RECOVERY.withinDays - 1);
    if (ctx.start < returnDate) {
      alerts.push({ level: "danger", text: `Ngày bắt đầu nghỉ dưỡng sức phải sau ngày kết thúc đợt nghỉ trước (${dmy(input.prevEnd)}).`, citation });
    } else if (ctx.start > lastStart) {
      alerts.push({
        level: "danger",
        text: `Phải nghỉ dưỡng sức trong ${RECOVERY.withinDays} ngày đầu kể từ ngày trở lại làm việc, tức bắt đầu chậm nhất ${dmy(lastStart)}.`,
        citation,
      });
    }
  } else {
    alerts.push({ level: "info", text: "Nhập ngày kết thúc đợt nghỉ hưởng chế độ trước đó để kiểm tra điều kiện nghỉ trong 30 ngày đầu." });
  }
  alerts.push({
    level: "info",
    text: "Chỉ kê khai số ngày nghỉ thực tế theo quyết định của đơn vị, không mặc nhiên tính mức tối đa.",
  });
  if (!alerts.some((alert) => alert.level === "danger" || alert.level === "warning")) {
    alerts.unshift({ level: "ok", text: "Đủ điều kiện tính hưởng theo số ngày đã nhập.", citation });
  }

  return {
    rule: "continuous",
    calendarDays: period.calendarDays,
    benefitDays,
    paidDays: benefitDays,
    days: period.days,
    deductions: [],
    cap: { label: `Mức tối đa: ${caseLabel(input).toLowerCase()}`, used: period.counted, limit, unit: "ngày" },
    alerts,
    citations: [citation],
  };
}
