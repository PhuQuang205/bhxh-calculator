/**
 * Mọi con số nghiệp vụ BHXH nằm ở file này.
 * NGUỒN CHUẨN: tài liệu đặc tả của khách hàng "Kế hoạch Thiết kế Web App Tính Chế độ BHXH (...).md",
 * mục 2.1–2.2 (căn cứ Luật BHXH 41/2024/QH15). Chỉ sửa số khi bản đặc tả của khách thay đổi.
 */
import type { ISODate } from "./types";

export const LAW = "Luật BHXH 41/2024/QH15";

/* ───────────────────────── Mức tham chiếu ───────────────────────── */

export interface ReferenceLevel {
  /** Áp dụng từ ngày (ISO). */
  from: ISODate;
  /** đồng/tháng */
  amount: number;
  source: string;
}

/** Đặc tả mục 2.2: mức lương cơ sở hiện hành 2.340.000đ/tháng. Giữ dạng bảng để thêm mức mới khi đặc tả cập nhật. */
export const REFERENCE_LEVELS: readonly ReferenceLevel[] = [
  { from: "2024-07-01", amount: 2_340_000, source: "mức lương cơ sở hiện hành" },
];

export function referenceLevelAt(date: ISODate): ReferenceLevel {
  let current = REFERENCE_LEVELS[0];
  for (const level of REFERENCE_LEVELS) {
    if (level.from <= date) current = level;
  }
  return current;
}

/* ───────────────────────── Ốm đau ───────────────────────── */

export type ContributionTier = "lt15" | "15to30" | "gte30";

export const CONTRIBUTION_LABEL: Record<ContributionTier, string> = {
  lt15: "Dưới 15 năm",
  "15to30": "Từ đủ 15 đến dưới 30 năm",
  gte30: "Từ đủ 30 năm trở lên",
};

export const SICKNESS = {
  /** Mức hưởng 1 ngày = tiền lương đóng BHXH tháng liền kề ÷ 24 × 75%. */
  rate: 0.75,
  daysPerMonth: 24,
  /** Trần tối đa/năm, điều kiện bình thường: 30/40/50 ngày. */
  capNormal: { lt15: 30, "15to30": 40, gte30: 50 } satisfies Record<ContributionTier, number>,
  /** Trần tối đa/năm, nghề nặng nhọc, độc hại: 40/50/70 ngày. */
  capHeavy: { lt15: 40, "15to30": 50, gte30: 70 } satisfies Record<ContributionTier, number>,
  /** Ốm đau dài ngày: quá 180 ngày hưởng mức 50% – 65% tùy thời gian đóng BHXH. */
  longTermFirstDays: 180,
  longTermRateAfter: { lt15: 0.5, "15to30": 0.55, gte30: 0.65 } satisfies Record<ContributionTier, number>,
  citations: {
    cap: `Chế độ ốm đau, ${LAW}`,
    rate: `Mức hưởng ốm đau, ${LAW}`,
  },
} as const;

/* ───────────────────────── Thai sản ───────────────────────── */

export const MATERNITY = {
  /** Mức hưởng = 100% bình quân tiền lương đóng BHXH 6 tháng liền kề. */
  rate: 1,
  /** Các trường hợp khác sinh con: (lương BQ ÷ 24) × 100% × số ngày. */
  dayDivisor: 24,
  /** Khám thai: tối đa 05 lần, mỗi lần không quá 02 ngày làm việc. */
  prenatal: { maxVisits: 5, maxDaysPerVisit: 2 },
  /** Sảy thai, phá thai, thai chết lưu — theo tuổi thai (tuần), ngày liên tục. */
  miscarriage: [
    { belowWeeks: 5, days: 10, label: "Thai dưới 5 tuần tuổi" },
    { belowWeeks: 13, days: 20, label: "Thai từ 5 đến dưới 13 tuần tuổi" },
    { belowWeeks: 22, days: 40, label: "Thai từ 13 đến dưới 22 tuần tuổi" },
    { belowWeeks: Number.POSITIVE_INFINITY, days: 50, label: "Thai từ 22 tuần tuổi trở lên" },
  ],
  birth: {
    /** Sinh con: 06 tháng, thêm 01 tháng/con từ con thứ 2 (sinh đôi trở lên). */
    months: 6,
    extraMonthsPerExtraBaby: 1,
  },
  /** Lao động nam nghỉ khi vợ sinh: 05 – 14 ngày làm việc tùy trường hợp. */
  paternity: {
    normal: 5,
    caesareanOrPreterm: 7,
    twins: 10,
    twinsCaesarean: 14,
  },
  citations: {
    prenatal: `Khám thai, ${LAW}`,
    miscarriage: `Sảy thai, phá thai, thai chết lưu, ${LAW}`,
    birth: `Sinh con, ${LAW}`,
    contraception: `Biện pháp tránh thai, ${LAW}`,
    paternity: `Lao động nam nghỉ khi vợ sinh con, ${LAW}`,
    rate: `Mức hưởng thai sản, ${LAW}`,
  },
} as const;

/* ───────────────────────── Dưỡng sức, phục hồi sức khỏe ───────────────────────── */

export const RECOVERY = {
  /** Mức hưởng 1 ngày = mức tham chiếu × 30% (2.340.000 × 30% = 702.000đ). */
  rate: 0.3,
  /** Nghỉ trong vòng 30 ngày đầu kể từ ngày trở lại làm việc. */
  withinDays: 30,
  /** Sau ốm đau: 10 ngày bệnh dài ngày; 07 ngày có phẫu thuật; 05 ngày trường hợp khác. */
  afterSickness: { longterm: 10, surgery: 7, other: 5 },
  /** Sau thai sản: 10 ngày sinh từ 2 con trở lên; 07 ngày sinh phẫu thuật; 05 ngày trường hợp khác. */
  afterMaternity: { multiple: 10, surgery: 7, other: 5 },
  citations: {
    sickness: `Dưỡng sức sau ốm đau, ${LAW}`,
    maternity: `Dưỡng sức sau thai sản, ${LAW}`,
  },
} as const;
