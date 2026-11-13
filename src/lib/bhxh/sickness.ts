import { formatDays, formatMoney, formatPercent } from "../format";

import type { SicknessInput } from "./inputs";
import { buildPeriod, periodProblem, type PeriodContext } from "./period";
import { CONTRIBUTION_LABEL, SICKNESS } from "./rules";
import type { CalcAlert, CalcOutcome, DayRule, MoneyLine } from "./types";

export const SICKNESS_KIND_LABEL: Record<SicknessInput["kind"], string> = {
  self: "Bản thân ốm thông thường",
  child: "Chăm con ốm dưới 7 tuổi",
  longterm: "Bệnh thuộc danh mục bệnh dài ngày",
};

/** Đặc tả mục 2.1: mọi trường hợp ốm đau (kể cả bệnh dài ngày) tính theo ngày làm việc. */
export const SICKNESS_RULE: DayRule = "working";

function annualCap(input: SicknessInput): number {
  if (input.kind === "longterm") return SICKNESS.longTermFirstDays;
  return (input.heavyWork ? SICKNESS.capHeavy : SICKNESS.capNormal)[input.contribution];
}

function capLabel(input: SicknessInput): string {
  if (input.kind === "longterm") return "Giai đoạn 180 ngày đầu hưởng 75%";
  return `Trần ốm đau / năm${input.heavyWork ? " (nặng nhọc, độc hại)" : ""}`;
}

export function calculateSickness(input: SicknessInput, ctx: PeriodContext): CalcOutcome {
  const rule = SICKNESS_RULE;
  const missing: string[] = [];
  const problem = periodProblem(ctx);
  if (problem) missing.push(problem);
  if (!input.salary) missing.push("Tiền lương đóng BHXH tháng liền kề");
  if (missing.length > 0 || !ctx.start || !ctx.end || !input.salary) return { pending: true, rule, missing };

  const period = buildPeriod(ctx.start, ctx.end, rule, ctx);
  const alerts: CalcAlert[] = [...period.alerts];
  const deductions = [...period.deductions];

  // Nửa ngày và trùng phép chỉ áp dụng trong số ngày đang được tính.
  const leaveOverlap = Math.min(input.leaveOverlap, period.counted);
  if (input.leaveOverlap > period.counted) {
    alerts.push({ level: "warning", text: "Số ngày trùng nghỉ phép/không lương lớn hơn số ngày được tính trong đợt." });
  }
  if (leaveOverlap > 0) deductions.push(`Trừ ${formatDays(leaveOverlap)} ngày trùng nghỉ phép, việc riêng, không lương`);

  const remaining = period.counted - leaveOverlap;
  const halfDays = Math.min(input.halfDays, remaining);
  if (input.halfDays > remaining) {
    alerts.push({ level: "warning", text: "Số ngày nghỉ dưới nửa ngày lớn hơn số ngày còn lại trong đợt." });
  }
  if (halfDays > 0) deductions.push(`${formatDays(halfDays)} ngày nghỉ dưới nửa ngày, mỗi ngày tính 0,5 ngày`);

  const benefitDays = remaining - halfDays * 0.5;
  const limit = annualCap(input);
  const used = input.usedDays + benefitDays;
  const dailyBase = input.salary / SICKNESS.daysPerMonth;
  const lines: MoneyLine[] = [];
  let paidDays: number;

  if (input.kind === "longterm") {
    const firstPhase = Math.max(0, Math.min(benefitDays, limit - input.usedDays));
    const secondPhase = benefitDays - firstPhase;
    paidDays = benefitDays;
    if (firstPhase > 0) {
      lines.push({
        label: `Ốm dài ngày, ${formatDays(firstPhase)} ngày đầu (75%)`,
        amount: Math.round(dailyBase * SICKNESS.rate * firstPhase),
        formula: `(${formatMoney(input.salary)} ÷ 24) × 75% × ${formatDays(firstPhase)} ngày`,
      });
    }
    if (secondPhase > 0) {
      const rate = SICKNESS.longTermRateAfter[input.contribution];
      lines.push({
        label: `Sau 180 ngày, ${formatDays(secondPhase)} ngày (${formatPercent(rate)})`,
        amount: Math.round(dailyBase * rate * secondPhase),
        formula: `(${formatMoney(input.salary)} ÷ 24) × ${formatPercent(rate)} × ${formatDays(secondPhase)} ngày`,
      });
      alerts.push({
        level: "info",
        text: `Đã quá 180 ngày: ${formatDays(secondPhase)} ngày hưởng ${formatPercent(rate)} theo thời gian đóng ${CONTRIBUTION_LABEL[input.contribution].toLowerCase()}.`,
        citation: SICKNESS.citations.rate,
      });
    }
  } else {
    paidDays = Math.max(0, Math.min(benefitDays, limit - input.usedDays));
    lines.push({
      label: `${SICKNESS_KIND_LABEL[input.kind]}, ${formatDays(paidDays)} ngày`,
      amount: Math.round(dailyBase * SICKNESS.rate * paidDays),
      formula: `(${formatMoney(input.salary)} ÷ 24) × 75% × ${formatDays(paidDays)} ngày`,
    });
    if (used > limit) {
      alerts.push({
        level: "danger",
        text: `Vượt trần ${limit} ngày/năm: chỉ tính ${formatDays(paidDays)}/${formatDays(benefitDays)} ngày của đợt này.`,
        citation: SICKNESS.citations.cap,
      });
    }
  }

  if (ctx.start.slice(0, 4) !== ctx.end.slice(0, 4)) {
    alerts.push({
      level: "info",
      text: "Đợt nghỉ vắt qua hai năm: trần ngày hưởng tính riêng theo từng năm dương lịch. Nên tách thành hai đợt để đối chiếu.",
    });
  }
  if (!alerts.some((alert) => alert.level === "danger" || alert.level === "warning")) {
    alerts.unshift({ level: "ok", text: "Đủ điều kiện tính hưởng theo số ngày đã nhập.", citation: SICKNESS.citations.cap });
  }

  return {
    rule,
    calendarDays: period.calendarDays,
    benefitDays,
    paidDays,
    days: period.days,
    deductions,
    cap: { label: capLabel(input), used, limit, unit: "ngày" },
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    alerts,
    citations: [SICKNESS.citations.cap, SICKNESS.citations.rate],
  };
}
