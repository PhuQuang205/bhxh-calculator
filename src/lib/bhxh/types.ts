/** Ngày dạng ISO `yyyy-MM-dd` (ngày lịch, không giờ, không múi giờ). */
export type ISODate = string;

/** Các thứ nghỉ hằng tuần của đơn vị, theo `Date.getDay()`: 0 = Chủ nhật … 6 = Thứ bảy. */
export type WeeklyRest = readonly number[];

/** Hai nhóm cách đếm ngày: A = ngày làm việc, B = ngày liên tục. */
export type DayRule = "working" | "continuous";

export type ExclusionReason = "weekend" | "holiday";

export interface DayCell {
  date: ISODate;
  included: boolean;
  reason?: ExclusionReason;
  /** Tên ngày lễ hoặc "Chủ nhật"/"Thứ bảy". */
  label?: string;
}

export type AlertLevel = "ok" | "info" | "warning" | "danger";

export interface CalcAlert {
  level: AlertLevel;
  text: string;
  citation?: string;
}

export interface CapUsage {
  label: string;
  /** Số ngày (hoặc tháng) đã dùng tính cả lần này. */
  used: number;
  limit: number;
  unit: "ngày" | "tháng";
}

export interface CalcResult {
  rule: DayRule;
  /** Tổng số ngày theo lịch, tính cả ngày đầu và ngày cuối. */
  calendarDays: number;
  /** Số ngày thực tế được hưởng (có thể lẻ 0,5). */
  benefitDays: number;
  /** Số ngày được tính hưởng sau khi chặn theo trần (nếu có). */
  paidDays: number;
  /** Thời gian hưởng tính theo tháng (sinh con). */
  benefitMonths?: number;
  days: DayCell[];
  /** Diễn giải các khoản trừ, ví dụ "Trừ 2 Chủ nhật (03/05, 10/05)". */
  deductions: string[];
  cap?: CapUsage;
  alerts: CalcAlert[];
  citations: string[];
}

/** Kết quả khi dữ liệu chưa đủ để tính: UI hiện trạng thái rỗng kèm lời nhắc. */
export interface CalcPending {
  pending: true;
  rule: DayRule;
  missing: string[];
}

export type CalcOutcome = CalcResult | CalcPending;

export function isPending(outcome: CalcOutcome): outcome is CalcPending {
  return "pending" in outcome;
}
