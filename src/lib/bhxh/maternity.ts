import { addDays, addMonths, format, parseISO } from "date-fns";

import { formatDays, formatMoney } from "../format";

import { countCalendarDays, isISODate, toISO } from "./dateEngine";
import type { MaternityInput } from "./inputs";
import { buildPeriod, periodProblem, type PeriodContext } from "./period";
import { MATERNITY } from "./rules";
import type { CalcAlert, CalcOutcome, CapUsage, DayRule, ISODate, MoneyLine } from "./types";

export const MATERNITY_KIND_LABEL: Record<MaternityInput["kind"], string> = {
  prenatal: "Khám thai",
  miscarriage: "Sảy thai, phá thai, thai chết lưu",
  birth: "Sinh con",
  contraception: "Thực hiện biện pháp tránh thai",
  paternity: "Lao động nam nghỉ khi vợ sinh con",
};

/** Khám thai và nam nghỉ khi vợ sinh tính ngày làm việc; còn lại tính ngày liên tục. */
export function maternityRule(kind: MaternityInput["kind"]): DayRule {
  return kind === "prenatal" || kind === "paternity" ? "working" : "continuous";
}

const dmy = (iso: ISODate) => format(parseISO(iso), "dd/MM/yyyy");

export function miscarriageTier(weeks: number) {
  return MATERNITY.miscarriage.find((tier) => weeks < tier.belowWeeks) ?? MATERNITY.miscarriage[MATERNITY.miscarriage.length - 1];
}

/** Sinh con: 6 tháng, thêm 1 tháng cho mỗi con từ con thứ hai trong cùng lần sinh. */
export function birthMonths(babies: number): number {
  return MATERNITY.birth.months + Math.max(0, babies - 1) * MATERNITY.birth.extraMonthsPerExtraBaby;
}

/** Ngày kết thúc thời gian hưởng sinh con, tính liên tục từ ngày bắt đầu nghỉ. */
export function birthEntitledEnd(start: ISODate, babies: number): ISODate {
  return toISO(addDays(addMonths(parseISO(start), birthMonths(babies)), -1));
}

/** Số ngày làm việc lao động nam được nghỉ khi vợ sinh con (05 – 14 ngày). */
export function paternityDays(input: Pick<MaternityInput, "wifeBirth" | "wifePreterm">): number {
  const { paternity } = MATERNITY;
  if (input.wifeBirth === "twinsCaesarean") return paternity.twinsCaesarean;
  if (input.wifeBirth === "twins") return paternity.twins;
  if (input.wifeBirth === "caesarean" || input.wifePreterm) return paternity.caesareanOrPreterm;
  return paternity.normal;
}

function withOk(alerts: CalcAlert[], citation: string): CalcAlert[] {
  if (alerts.some((alert) => alert.level === "danger" || alert.level === "warning")) return alerts;
  return [{ level: "ok", text: "Đủ điều kiện tính hưởng theo số ngày đã nhập.", citation }, ...alerts];
}

export function calculateMaternity(input: MaternityInput, ctx: PeriodContext): CalcOutcome {
  const rule = maternityRule(input.kind);
  const missing: string[] = [];
  if (input.kind === "birth") {
    if (!isISODate(ctx.start)) missing.push("Ngày bắt đầu nghỉ");
  } else {
    const problem = periodProblem(ctx);
    if (problem) missing.push(problem);
  }
  if (!input.avgSalary) missing.push("Bình quân tiền lương 6 tháng liền kề");
  if (missing.length > 0 || !ctx.start || !input.avgSalary) return { pending: true, rule, missing };

  if (input.kind === "birth") return calculateBirth(input, input.avgSalary, ctx.start, ctx.end, ctx);

  const avg = input.avgSalary;
  const period = buildPeriod(ctx.start, ctx.end as ISODate, rule, ctx);
  const alerts: CalcAlert[] = [...period.alerts];
  let entitled: number | null;
  let label: string;
  let citation: string;

  switch (input.kind) {
    case "prenatal": {
      const { prenatal } = MATERNITY;
      entitled = prenatal.maxDaysPerVisit;
      label = `Khám thai lần ${input.visitNo}`;
      citation = MATERNITY.citations.prenatal;
      if (input.visitNo > prenatal.maxVisits) {
        alerts.push({ level: "danger", text: `Chỉ được hưởng tối đa ${prenatal.maxVisits} lần khám thai.`, citation });
        entitled = 0;
      }
      break;
    }
    case "miscarriage": {
      const tier = miscarriageTier(input.gestationWeeks);
      entitled = tier.days;
      label = tier.label;
      citation = MATERNITY.citations.miscarriage;
      break;
    }
    case "contraception": {
      // Đặc tả không quy định số ngày tối đa: tính theo số ngày nghỉ thực tế.
      entitled = null;
      label = "Thực hiện biện pháp tránh thai";
      citation = MATERNITY.citations.contraception;
      alerts.push({ level: "info", text: "Số ngày nghỉ theo chỉ định của cơ sở khám bệnh, chữa bệnh." });
      break;
    }
    case "paternity": {
      entitled = paternityDays(input);
      label = "Nghỉ khi vợ sinh con";
      citation = MATERNITY.citations.paternity;
      break;
    }
  }

  const benefitDays = entitled === null ? period.counted : Math.min(period.counted, entitled);
  if (entitled !== null && period.counted > entitled) {
    alerts.push({
      level: "danger",
      text: `Vượt mức tối đa ${entitled} ngày: chỉ tính ${benefitDays}/${period.counted} ngày.`,
      citation,
    });
  }
  const unit = rule === "working" ? "ngày làm việc" : "ngày";
  const divisor = MATERNITY.dayDivisor;
  const lines: MoneyLine[] = [
    {
      label: `${label}, ${formatDays(benefitDays)} ${unit}`,
      amount: Math.round((avg / divisor) * MATERNITY.rate * benefitDays),
      formula: `(${formatMoney(avg)} ÷ ${divisor}) × 100% × ${formatDays(benefitDays)} ngày`,
    },
  ];
  const cap: CapUsage | undefined =
    entitled === null ? undefined : { label: `Mức tối đa: ${label.toLowerCase()}`, used: period.counted, limit: entitled, unit: "ngày" };

  return {
    rule,
    calendarDays: period.calendarDays,
    benefitDays,
    paidDays: benefitDays,
    days: period.days,
    deductions: period.deductions,
    cap,
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    alerts: withOk(alerts, citation),
    citations: [citation, MATERNITY.citations.rate],
  };
}

function calculateBirth(input: MaternityInput, avg: number, start: ISODate, end: ISODate | null, ctx: PeriodContext): CalcOutcome {
  const citation = MATERNITY.citations.birth;
  const months = birthMonths(input.babies);
  const entitledEnd = birthEntitledEnd(start, input.babies);
  const alerts: CalcAlert[] = [];
  const shownEnd = end && end >= start ? end : entitledEnd;

  if (end && end > entitledEnd) {
    alerts.push({ level: "danger", text: `Vượt thời gian hưởng ${months} tháng (đến hết ${dmy(entitledEnd)}).`, citation });
  } else if (end && end < entitledEnd) {
    alerts.push({
      level: "info",
      text: `Ngày kết thúc đã nhập sớm hơn thời gian được hưởng ${months} tháng (đến hết ${dmy(entitledEnd)}).`,
      citation,
    });
  }

  const period = buildPeriod(start, shownEnd, "continuous", ctx);
  const lines: MoneyLine[] = [
    {
      label: `Trợ cấp sinh con, ${months} tháng`,
      amount: Math.round(avg * MATERNITY.rate * months),
      formula: `${formatMoney(avg)} × ${months} tháng`,
    },
  ];
  const entitledDays = countCalendarDays(start, entitledEnd);

  return {
    rule: "continuous",
    calendarDays: period.calendarDays,
    benefitDays: entitledDays,
    paidDays: entitledDays,
    benefitMonths: months,
    days: period.days,
    deductions: [`Thời gian được hưởng: ${months} tháng liên tục, từ ${dmy(start)} đến hết ${dmy(entitledEnd)}`],
    lines,
    total: lines[0].amount,
    alerts: withOk([...period.alerts, ...alerts], citation),
    citations: [citation, MATERNITY.citations.rate],
  };
}
