import { addDaysISO, countCalendarDays } from "./dateEngine";
import type { ISODate } from "./types";

/**
 * Ngày nghỉ lễ, Tết có sẵn (Bộ luật Lao động Điều 112, nghỉ bù theo Điều 111 khoản 3).
 * - Tết Âm lịch theo lịch nghỉ của cán bộ, công chức (doanh nghiệp có thể chọn phương án khác → sửa trong panel "Lịch nghỉ").
 * - Không đưa các ngày hoán đổi làm bù thứ Bảy (chỉ áp dụng khu vực công).
 * Nguồn: TB 6150/TB-BLĐTBXH (2025), TB 9441/TB-BNV và CV 3383/BNV-CVL (2026), TB 11483/TB-BNV (2027).
 */
interface HolidaySpan {
  from: ISODate;
  to?: ISODate;
  label: string;
}

const NEW_YEAR = "Tết Dương lịch";
const LUNAR_NEW_YEAR = "Tết Nguyên đán";
const HUNG_KINGS = "Giỗ Tổ Hùng Vương";
const REUNIFICATION = "Ngày Chiến thắng 30/4";
const LABOUR = "Quốc tế Lao động 1/5";
const NATIONAL = "Quốc khánh";
const CULTURE = "Ngày Văn hóa Việt Nam";

const BUILT_IN: Record<number, readonly HolidaySpan[]> = {
  2025: [
    { from: "2025-01-01", label: NEW_YEAR },
    { from: "2025-01-25", to: "2025-02-02", label: LUNAR_NEW_YEAR },
    { from: "2025-04-07", label: HUNG_KINGS },
    { from: "2025-04-30", label: REUNIFICATION },
    { from: "2025-05-01", label: LABOUR },
    { from: "2025-09-01", to: "2025-09-02", label: NATIONAL },
  ],
  2026: [
    { from: "2026-01-01", label: NEW_YEAR },
    { from: "2026-02-14", to: "2026-02-22", label: LUNAR_NEW_YEAR },
    { from: "2026-04-26", label: HUNG_KINGS },
    { from: "2026-04-27", label: `Nghỉ bù ${HUNG_KINGS}` },
    { from: "2026-04-30", label: REUNIFICATION },
    { from: "2026-05-01", label: LABOUR },
    { from: "2026-09-01", to: "2026-09-02", label: NATIONAL },
    { from: "2026-11-24", label: CULTURE },
  ],
  2027: [
    { from: "2027-01-01", label: NEW_YEAR },
    { from: "2027-02-04", to: "2027-02-10", label: LUNAR_NEW_YEAR },
    { from: "2027-04-16", label: HUNG_KINGS },
    { from: "2027-04-30", label: REUNIFICATION },
    { from: "2027-05-01", label: LABOUR },
    { from: "2027-05-03", label: `Nghỉ bù ${LABOUR}` },
    { from: "2027-09-02", to: "2027-09-03", label: NATIONAL },
    { from: "2027-11-24", label: CULTURE },
  ],
};

export const BUILT_IN_YEARS = Object.keys(BUILT_IN).map(Number);

function expand(span: HolidaySpan): [ISODate, string][] {
  const length = span.to ? countCalendarDays(span.from, span.to) : 1;
  return Array.from({ length }, (_, i) => [addDaysISO(span.from, i), span.label]);
}

/** Toàn bộ ngày lễ có sẵn → tên, sắp theo ngày. */
export const BUILT_IN_HOLIDAYS: ReadonlyMap<ISODate, string> = new Map(
  Object.values(BUILT_IN)
    .flat()
    .flatMap(expand)
    .sort(([a], [b]) => a.localeCompare(b)),
);

/** Gộp ngày lễ có sẵn với cấu hình của đơn vị: bỏ những ngày đơn vị không nghỉ, thêm ngày nghỉ riêng. */
export function mergeHolidays(custom: Readonly<Record<ISODate, string>>, removed: readonly ISODate[]): Map<ISODate, string> {
  const merged = new Map(BUILT_IN_HOLIDAYS);
  for (const date of removed) merged.delete(date);
  for (const [date, label] of Object.entries(custom)) merged.set(date, label || "Ngày nghỉ của đơn vị");
  return merged;
}
