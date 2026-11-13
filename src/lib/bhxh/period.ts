import { MAX_RANGE_DAYS, classifyDays, countCalendarDays, describeExclusions, isISODate } from "./dateEngine";
import type { CalcAlert, DayCell, DayRule, ISODate, WeeklyRest } from "./types";

/** Phần chung mọi chế độ cần: khoảng nghỉ, lịch nghỉ tuần và danh sách ngày lễ đã gộp. */
export interface PeriodContext {
  start: ISODate | null;
  end: ISODate | null;
  weeklyRest: WeeklyRest;
  holidays: ReadonlyMap<ISODate, string>;
}

export interface Period {
  start: ISODate;
  end: ISODate;
  calendarDays: number;
  days: DayCell[];
  /** Số ngày được tính theo nhóm quy tắc (trước khi trừ phép, nửa ngày, trần). */
  counted: number;
  deductions: string[];
  alerts: CalcAlert[];
}

/** Lỗi nhập khoảng ngày, hoặc null nếu hợp lệ. */
export function periodProblem(ctx: Pick<PeriodContext, "start" | "end">): string | null {
  if (!isISODate(ctx.start)) return "Ngày bắt đầu nghỉ";
  if (!isISODate(ctx.end)) return "Ngày kết thúc nghỉ";
  if (ctx.end < ctx.start) return "Ngày kết thúc không được trước ngày bắt đầu";
  return null;
}

export function buildPeriod(start: ISODate, end: ISODate, rule: DayRule, ctx: PeriodContext): Period {
  const calendarDays = countCalendarDays(start, end);
  const days = classifyDays(start, end, { rule, weeklyRest: ctx.weeklyRest, holidays: ctx.holidays });
  const alerts: CalcAlert[] = [];
  if (calendarDays > MAX_RANGE_DAYS) {
    alerts.push({
      level: "warning",
      text: `Khoảng nghỉ dài ${calendarDays} ngày: chỉ tính ${MAX_RANGE_DAYS} ngày đầu. Kiểm tra lại ngày đã nhập.`,
    });
  }
  return {
    start,
    end,
    calendarDays,
    days,
    counted: days.filter((cell) => cell.included).length,
    deductions: rule === "working" ? describeExclusions(days) : [],
    alerts,
  };
}
