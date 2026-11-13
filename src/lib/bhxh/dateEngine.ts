import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

import type { DayCell, DayRule, ISODate, WeeklyRest } from "./types";

const ISO_FORMAT = "yyyy-MM-dd";
/** Giới hạn số ngày dựng từng ô để giao diện không treo khi nhập nhầm năm. */
export const MAX_RANGE_DAYS = 400;

export function toDate(iso: ISODate): Date {
  return parseISO(iso);
}

export function toISO(date: Date): ISODate {
  return format(date, ISO_FORMAT);
}

export function isISODate(value: string | null | undefined): value is ISODate {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));
}

/** Số ngày theo lịch, tính cả ngày đầu và ngày cuối. Trả 0 nếu kết thúc trước bắt đầu. */
export function countCalendarDays(start: ISODate, end: ISODate): number {
  const diff = differenceInCalendarDays(toDate(end), toDate(start));
  return diff < 0 ? 0 : diff + 1;
}

export function addDaysISO(iso: ISODate, amount: number): ISODate {
  return toISO(addDays(toDate(iso), amount));
}

export function isWeeklyRest(date: Date, weeklyRest: WeeklyRest): boolean {
  const day = date.getDay();
  return day === 0 || (weeklyRest === "sat-sun" && day === 6);
}

interface ClassifyOptions {
  rule: DayRule;
  weeklyRest: WeeklyRest;
  /** Ngày nghỉ lễ, Tết (kể cả nghỉ bù) → tên ngày. */
  holidays: ReadonlyMap<ISODate, string>;
}

/**
 * Dựng từng ô ngày trong khoảng [start, end].
 * - Nhóm A (ngày làm việc): loại ngày nghỉ hằng tuần và ngày lễ, Tết.
 * - Nhóm B (ngày liên tục): mọi ngày đều tính.
 * Ngày lễ trùng ngày nghỉ hằng tuần ghi lý do là "holiday" để diễn giải đúng tên ngày lễ.
 */
export function classifyDays(start: ISODate, end: ISODate, { rule, weeklyRest, holidays }: ClassifyOptions): DayCell[] {
  const total = Math.min(countCalendarDays(start, end), MAX_RANGE_DAYS);
  const first = toDate(start);
  const cells: DayCell[] = [];
  for (let i = 0; i < total; i += 1) {
    const date = addDays(first, i);
    const iso = toISO(date);
    if (rule === "continuous") {
      cells.push({ date: iso, included: true });
      continue;
    }
    const holiday = holidays.get(iso);
    if (holiday) {
      cells.push({ date: iso, included: false, reason: "holiday", label: holiday });
    } else if (isWeeklyRest(date, weeklyRest)) {
      cells.push({ date: iso, included: false, reason: "weekend", label: date.getDay() === 0 ? "Chủ nhật" : "Thứ bảy" });
    } else {
      cells.push({ date: iso, included: true });
    }
  }
  return cells;
}

function shortDate(iso: ISODate): string {
  return format(toDate(iso), "dd/MM");
}

/** Diễn giải các ngày bị loại, gom theo loại: "Trừ 2 Chủ nhật (03/05, 10/05)", "Trừ Lễ Quốc khánh (02/09)". */
export function describeExclusions(cells: readonly DayCell[]): string[] {
  const groups = new Map<string, ISODate[]>();
  for (const cell of cells) {
    if (cell.included || !cell.label) continue;
    const list = groups.get(cell.label) ?? [];
    list.push(cell.date);
    groups.set(cell.label, list);
  }
  return [...groups.entries()].map(([label, dates]) => {
    const count = dates.length > 1 ? `${dates.length} ` : "";
    return `Trừ ${count}${label} (${dates.map(shortDate).join(", ")})`;
  });
}
