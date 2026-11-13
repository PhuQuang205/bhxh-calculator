import { addDays, addMonths, format, parseISO } from "date-fns";

import { countCalendarDays, isISODate, toISO } from "./dateEngine";
import type { MaternityInput } from "./inputs";
import { buildPeriod, periodProblem, type PeriodContext } from "./period";
import { MATERNITY } from "./rules";
import type { CalcAlert, CalcOutcome, CalcResult, CapUsage, DayRule, ISODate } from "./types";

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

type BirthFacts = Pick<MaternityInput, "babies" | "secondChild">;

/** Có áp dụng chính sách sinh con thứ hai không: phải là con thứ hai và sinh từ 01/07/2026. */
export function isSecondChildPolicy(input: Pick<MaternityInput, "secondChild">, birthDate: ISODate): boolean {
  return input.secondChild && birthDate >= MATERNITY.birth.secondChildFrom;
}

/** Sinh con: 6 tháng (7 tháng nếu sinh con thứ hai từ 01/07/2026), thêm 1 tháng cho mỗi con từ con thứ hai trong cùng lần sinh. */
export function birthMonths(input: BirthFacts, birthDate: ISODate): number {
  const { birth } = MATERNITY;
  const base = isSecondChildPolicy(input, birthDate) ? birth.secondChildMonths : birth.months;
  return base + Math.max(0, input.babies - 1) * birth.extraMonthsPerExtraBaby;
}

/** Ngày kết thúc thời gian hưởng sinh con, tính liên tục từ ngày bắt đầu nghỉ. */
export function birthEntitledEnd(start: ISODate, input: BirthFacts, birthDate: ISODate): ISODate {
  return toISO(addDays(addMonths(parseISO(start), birthMonths(input, birthDate)), -1));
}

/** Số ngày làm việc lao động nam được nghỉ khi vợ sinh con. */
export function paternityDays(
  input: Pick<MaternityInput, "wifeBirth" | "wifePreterm" | "babies" | "secondChild">,
  birthDate: ISODate,
): number {
  const { paternity } = MATERNITY;
  const twins = input.wifeBirth === "twins" || input.wifeBirth === "twinsCaesarean";
  const extra = twins ? Math.max(0, input.babies - 2) * paternity.extraPerBabyFromThird : 0;
  let days: number;
  if (input.wifeBirth === "twinsCaesarean") days = paternity.twinsCaesarean;
  else if (input.wifeBirth === "twins") days = paternity.twins;
  else if (input.wifeBirth === "caesarean" || input.wifePreterm) days = paternity.caesareanOrPreterm;
  else days = paternity.normal;
  if (isSecondChildPolicy(input, birthDate)) days = Math.max(days, paternity.secondChild);
  return days + extra;
}

/** Ngày sinh dùng để xét chính sách: ngày sinh đã nhập, không có thì lấy ngày bắt đầu nghỉ. */
export function effectiveBirthDate(input: Pick<MaternityInput, "birthDate">, start: ISODate): ISODate {
  return isISODate(input.birthDate) ? input.birthDate : start;
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
  if (missing.length > 0 || !ctx.start) return { pending: true, rule, missing };

  if (input.kind === "birth") return calculateBirth(input, ctx.start, ctx.end, ctx);

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
      const birthDate = effectiveBirthDate(input, ctx.start);
      entitled = paternityDays(input, birthDate);
      label = "Nghỉ khi vợ sinh con";
      citation = MATERNITY.citations.paternity;
      if (isSecondChildPolicy(input, birthDate)) {
        alerts.push({ level: "info", text: "Áp dụng chính sách vợ sinh con thứ hai từ 01/07/2026: nghỉ 10 ngày làm việc.", citation: MATERNITY.citations.secondChild });
      } else if (input.secondChild) {
        alerts.push({ level: "info", text: "Vợ sinh trước 01/07/2026 nên chưa áp dụng chính sách sinh con thứ hai.", citation: MATERNITY.citations.secondChild });
      }
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
    alerts: withOk(alerts, citation),
    citations: [citation],
  };
}

function calculateBirth(input: MaternityInput, start: ISODate, end: ISODate | null, ctx: PeriodContext): CalcResult {
  const citation = MATERNITY.citations.birth;
  const birthDate = effectiveBirthDate(input, start);
  const months = birthMonths(input, birthDate);
  const entitledEnd = birthEntitledEnd(start, input, birthDate);
  const alerts: CalcAlert[] = [];
  const citations: string[] = [citation];

  if (isSecondChildPolicy(input, birthDate)) {
    alerts.push({ level: "info", text: "Áp dụng chính sách sinh con thứ hai từ 01/07/2026: nghỉ 7 tháng.", citation: MATERNITY.citations.secondChild });
    citations.push(MATERNITY.citations.secondChild);
  } else if (input.secondChild) {
    alerts.push({ level: "info", text: "Sinh trước 01/07/2026 nên chưa áp dụng chính sách sinh con thứ hai (vẫn 6 tháng).", citation: MATERNITY.citations.secondChild });
  }
  const earliestStart = toISO(addMonths(parseISO(birthDate), -MATERNITY.birth.maxBeforeBirthMonths));
  if (start < earliestStart) {
    alerts.push({
      level: "warning",
      text: `Nghỉ trước sinh quá ${MATERNITY.birth.maxBeforeBirthMonths} tháng: sinh ngày ${dmy(birthDate)} thì sớm nhất nghỉ từ ${dmy(earliestStart)}.`,
      citation,
    });
  }
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
  const entitledDays = countCalendarDays(start, entitledEnd);

  return {
    rule: "continuous",
    calendarDays: period.calendarDays,
    benefitDays: entitledDays,
    paidDays: entitledDays,
    benefitMonths: months,
    days: period.days,
    deductions: [`Thời gian được hưởng: ${months} tháng liên tục, từ ${dmy(start)} đến hết ${dmy(entitledEnd)}`],
    alerts: withOk([...period.alerts, ...alerts], citation),
    citations,
  };
}
