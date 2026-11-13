import type { ContributionTier } from "./rules";
import type { ISODate } from "./types";

export type { ContributionTier };

export type Mode = "sickness" | "maternity" | "recovery";

export type SicknessKind = "self" | "child" | "longterm";

export type MaternityKind = "prenatal" | "miscarriage" | "birth" | "contraception" | "paternity";
export type WifeBirthKind = "normal" | "caesarean" | "twins" | "twinsCaesarean";

export type RecoveryAfter = "sickness" | "maternity";
export type RecoveryCase = "longterm" | "surgery" | "multiple" | "other";

export interface SicknessInput {
  kind: SicknessKind;
  contribution: ContributionTier;
  /** Làm nghề, công việc nặng nhọc, độc hại. */
  heavyWork: boolean;
  /** Số ngày nghỉ dưới nửa ngày trong đợt (mỗi ngày tính 0,5). */
  halfDays: number;
  /** Số ngày trùng nghỉ phép năm, việc riêng, không lương. */
  leaveOverlap: number;
  /** Số ngày đã hưởng ốm đau trước đó trong năm. */
  usedDays: number;
  salary: number | null;
}

export interface MaternityInput {
  kind: MaternityKind;
  /** Khám thai: lần thứ mấy (1–5). */
  visitNo: number;
  /** Sảy thai, phá thai, thai chết lưu: tuổi thai (tuần). */
  gestationWeeks: number;
  /** Sinh con / nam nghỉ khi vợ sinh: số con sinh ra trong lần sinh này. */
  babies: number;
  /** Sinh con thứ hai: tại thời điểm sinh có một con đẻ còn sống (NĐ 168/2026/NĐ-CP). */
  secondChild: boolean;
  /** Ngày sinh con (để xét chính sách con thứ hai từ 01/07/2026). Bỏ trống thì lấy ngày bắt đầu nghỉ. */
  birthDate: ISODate | null;
  /** Nam nghỉ khi vợ sinh: hình thức vợ sinh. */
  wifeBirth: WifeBirthKind;
  /** Nam nghỉ khi vợ sinh: vợ sinh con dưới 32 tuần tuổi. */
  wifePreterm: boolean;
  avgSalary: number | null;
}

export interface RecoveryInput {
  after: RecoveryAfter;
  caseKind: RecoveryCase;
  /** Ngày kết thúc đợt nghỉ hưởng chế độ trước đó (ngày hôm sau là ngày trở lại làm việc). */
  prevEnd: ISODate | null;
}
