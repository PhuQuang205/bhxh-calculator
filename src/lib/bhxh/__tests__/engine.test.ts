import { describe, expect, it } from "vitest";

import { classifyDays, countCalendarDays, describeExclusions } from "../dateEngine";
import { birthEntitledEnd, birthMonths, calculateMaternity, miscarriageTier, paternityDays } from "../maternity";
import type { PeriodContext } from "../period";
import { calculateRecovery } from "../recovery";
import { calculateSickness } from "../sickness";
import type { MaternityInput, RecoveryInput, SicknessInput } from "../inputs";
import { isPending, type CalcOutcome, type CalcResult } from "../types";

const HOLIDAYS = new Map([
  ["2026-04-30", "Ngày Chiến thắng"],
  ["2026-05-01", "Quốc tế Lao động"],
]);

function ctx(start: string | null, end: string | null, weeklyRest: PeriodContext["weeklyRest"] = [0]): PeriodContext {
  return { start, end, weeklyRest, holidays: HOLIDAYS };
}

function done(outcome: CalcOutcome): CalcResult {
  if (isPending(outcome)) throw new Error(`pending: ${outcome.missing.join(", ")}`);
  return outcome;
}

const sickness: SicknessInput = {
  kind: "self",
  contribution: "lt15",
  heavyWork: false,
  halfDays: 0,
  leaveOverlap: 0,
  usedDays: 0,
  salary: 7_200_000,
};

const maternity: MaternityInput = {
  kind: "birth",
  visitNo: 1,
  gestationWeeks: 8,
  babies: 1,
  secondChild: false,
  birthDate: null,
  wifeBirth: "normal",
  wifePreterm: false,
  avgSalary: 9_600_000,
};

describe("dateEngine", () => {
  it("đếm ngày lịch tính cả ngày đầu và ngày cuối", () => {
    expect(countCalendarDays("2026-04-27", "2026-05-08")).toBe(12);
    expect(countCalendarDays("2026-05-08", "2026-04-27")).toBe(0);
  });

  it("ngày làm việc trừ Chủ nhật và lễ (lịch nghỉ CN)", () => {
    const cells = classifyDays("2026-04-27", "2026-05-08", { rule: "working", weeklyRest: [0], holidays: HOLIDAYS });
    expect(cells.filter((c) => c.included)).toHaveLength(9);
    expect(describeExclusions(cells)).toEqual([
      "Trừ Ngày Chiến thắng (30/04)",
      "Trừ Quốc tế Lao động (01/05)",
      "Trừ Chủ nhật (03/05)",
    ]);
  });

  it("lịch nghỉ T7 + CN trừ thêm Thứ bảy", () => {
    const cells = classifyDays("2026-04-27", "2026-05-08", { rule: "working", weeklyRest: [6, 0], holidays: HOLIDAYS });
    expect(cells.filter((c) => c.included)).toHaveLength(8);
  });

  it("lịch nghỉ tuần tùy chọn: đơn vị nghỉ Thứ tư", () => {
    const cells = classifyDays("2026-04-27", "2026-05-08", { rule: "working", weeklyRest: [3], holidays: HOLIDAYS });
    // 12 ngày − 2 Thứ tư (29/04, 06/05) − 2 ngày lễ = 8
    expect(cells.filter((c) => c.included)).toHaveLength(8);
    expect(describeExclusions(cells)).toContain("Trừ 2 Thứ tư (29/04, 06/05)");
  });

  it("ngày liên tục tính mọi ngày", () => {
    const cells = classifyDays("2026-04-27", "2026-05-08", { rule: "continuous", weeklyRest: [6, 0], holidays: HOLIDAYS });
    expect(cells.every((c) => c.included)).toBe(true);
  });
});

describe("Ốm đau", () => {
  it("chờ đủ dữ liệu", () => {
    const outcome = calculateSickness({ ...sickness, salary: null }, ctx("2026-04-27", null));
    expect(isPending(outcome)).toBe(true);
  });

  it("nghỉ vắt qua lễ 30/4 – 1/5: (lương ÷ 24) × 75% × ngày", () => {
    const result = done(calculateSickness(sickness, ctx("2026-04-27", "2026-05-08")));
    expect(result.rule).toBe("working");
    expect(result.calendarDays).toBe(12);
    expect(result.benefitDays).toBe(9);
    // 7.200.000 / 24 = 300.000; × 75% = 225.000; × 9 = 2.025.000
    expect(result.total).toBe(2_025_000);
  });

  it("nghỉ dưới nửa ngày tính 0,5 ngày, trừ ngày trùng phép", () => {
    const result = done(calculateSickness({ ...sickness, halfDays: 1, leaveOverlap: 2 }, ctx("2026-04-27", "2026-05-08")));
    expect(result.benefitDays).toBe(6.5);
    expect(result.total).toBe(1_462_500);
  });

  it("vượt trần 30 ngày/năm thì chỉ tính phần còn lại và báo đỏ", () => {
    const result = done(calculateSickness({ ...sickness, usedDays: 25 }, ctx("2026-04-27", "2026-05-08")));
    expect(result.paidDays).toBe(5);
    expect(result.alerts.some((a) => a.level === "danger")).toBe(true);
  });

  it("trần theo đặc tả: 30/40/50 thường, 40/50/70 nặng nhọc", () => {
    const cap = (input: Partial<SicknessInput>) => done(calculateSickness({ ...sickness, ...input }, ctx("2026-04-27", "2026-04-27"))).cap?.limit;
    expect(cap({ contribution: "lt15" })).toBe(30);
    expect(cap({ contribution: "15to30" })).toBe(40);
    expect(cap({ contribution: "gte30" })).toBe(50);
    expect(cap({ contribution: "lt15", heavyWork: true })).toBe(40);
    expect(cap({ contribution: "gte30", heavyWork: true })).toBe(70);
  });

  it("bệnh dài ngày quá 180 ngày chuyển sang tỷ lệ thấp hơn", () => {
    const result = done(calculateSickness({ ...sickness, kind: "longterm", usedDays: 175 }, ctx("2026-04-27", "2026-05-08")));
    expect(result.lines).toHaveLength(2);
    // 5 ngày × 225.000 + 4 ngày × 300.000 × 50%
    expect(result.total).toBe(1_125_000 + 600_000);
  });

  it("chưa nhập lương vẫn ra số ngày, chỉ bỏ phần tiền", () => {
    const result = done(calculateSickness({ ...sickness, salary: null }, ctx("2026-04-27", "2026-05-08")));
    expect(result.benefitDays).toBe(9);
    expect(result.lines).toHaveLength(0);
    expect(result.moneyMissing).toBeTruthy();
  });
});

describe("Thai sản", () => {
  it("sinh con chưa nhập lương vẫn ra thời gian hưởng", () => {
    const result = done(calculateMaternity({ ...maternity, avgSalary: null }, ctx("2026-09-12", null)));
    expect(result.benefitMonths).toBe(6);
    expect(result.calendarDays).toBe(181);
    expect(result.moneyMissing).toBeTruthy();
  });

  it("sảy thai theo mốc tuần tuổi", () => {
    expect(miscarriageTier(4).days).toBe(10);
    expect(miscarriageTier(5).days).toBe(20);
    expect(miscarriageTier(12).days).toBe(20);
    expect(miscarriageTier(13).days).toBe(40);
    expect(miscarriageTier(22).days).toBe(50);
  });

  it("sảy thai tính ngày liên tục, chia 24", () => {
    const result = done(calculateMaternity({ ...maternity, kind: "miscarriage", gestationWeeks: 4 }, ctx("2026-04-27", "2026-05-06")));
    expect(result.rule).toBe("continuous");
    expect(result.benefitDays).toBe(10);
    expect(result.total).toBe(4_000_000);
  });

  it("sảy thai nhập quá mức thì báo vượt", () => {
    const result = done(calculateMaternity({ ...maternity, kind: "miscarriage", gestationWeeks: 4 }, ctx("2026-04-27", "2026-05-08")));
    expect(result.benefitDays).toBe(10);
    expect(result.alerts.some((a) => a.level === "danger")).toBe(true);
  });

  it("khám thai mỗi lần tối đa 2 ngày làm việc", () => {
    const result = done(calculateMaternity({ ...maternity, kind: "prenatal" }, ctx("2026-04-29", "2026-05-04")));
    // 29/04 (T4), 02/05 (T7) là ngày làm việc; 30/04, 01/05 lễ; 03/05 CN; 04/05 (T2) → 3 ngày, chặn còn 2
    expect(result.benefitDays).toBe(2);
    expect(result.alerts.some((a) => a.level === "danger")).toBe(true);
  });

  it("khám thai quá 5 lần thì không được hưởng", () => {
    const result = done(calculateMaternity({ ...maternity, kind: "prenatal", visitNo: 6 }, ctx("2026-04-27", "2026-04-27")));
    expect(result.total).toBe(0);
  });

  it("sinh con 6 tháng, sinh đôi thêm 1 tháng", () => {
    const one = { babies: 1, secondChild: false };
    expect(birthMonths(one, "2026-01-15")).toBe(6);
    expect(birthMonths({ ...one, babies: 2 }, "2026-01-15")).toBe(7);
    expect(birthEntitledEnd("2026-01-15", one, "2026-01-15")).toBe("2026-07-14");
    const result = done(calculateMaternity(maternity, ctx("2026-01-15", null)));
    expect(result.benefitMonths).toBe(6);
    expect(result.total).toBe(57_600_000);
  });

  it("nam nghỉ khi vợ sinh: 5 / 7 / 10 / 14 ngày làm việc", () => {
    const base = { wifePreterm: false, babies: 2, secondChild: false };
    const d = "2026-03-01";
    expect(paternityDays({ ...base, wifeBirth: "normal" }, d)).toBe(5);
    expect(paternityDays({ ...base, wifeBirth: "normal", wifePreterm: true }, d)).toBe(7);
    expect(paternityDays({ ...base, wifeBirth: "caesarean" }, d)).toBe(7);
    expect(paternityDays({ ...base, wifeBirth: "twins" }, d)).toBe(10);
    expect(paternityDays({ ...base, wifeBirth: "twinsCaesarean" }, d)).toBe(14);
    // Sinh ba: từ con thứ ba thêm 3 ngày
    expect(paternityDays({ ...base, wifeBirth: "twins", babies: 3 }, d)).toBe(13);
  });

  it("sinh con thứ hai từ 01/07/2026: 7 tháng", () => {
    const second = { babies: 1, secondChild: true };
    expect(birthMonths(second, "2026-06-30")).toBe(6);
    expect(birthMonths(second, "2026-07-01")).toBe(7);
    expect(birthMonths({ ...second, babies: 2 }, "2026-07-01")).toBe(8);
    const result = done(calculateMaternity({ ...maternity, secondChild: true, avgSalary: null }, ctx("2026-09-12", null)));
    expect(result.benefitMonths).toBe(7);
    expect(result.deductions[0]).toContain("đến hết 11/04/2027");
  });

  it("vợ sinh con thứ hai từ 01/07/2026: nam nghỉ 10 ngày làm việc", () => {
    const base = { wifeBirth: "normal" as const, wifePreterm: false, babies: 1, secondChild: true };
    expect(paternityDays(base, "2026-06-30")).toBe(5);
    expect(paternityDays(base, "2026-07-01")).toBe(10);
    expect(paternityDays({ ...base, wifeBirth: "twinsCaesarean" }, "2026-07-01")).toBe(14);
  });

  it("cảnh báo nghỉ trước sinh quá 2 tháng", () => {
    const result = done(calculateMaternity({ ...maternity, birthDate: "2026-09-12" }, ctx("2026-06-01", null)));
    expect(result.alerts.some((a) => a.level === "warning" && a.text.includes("trước sinh"))).toBe(true);
  });
});

describe("Dưỡng sức", () => {
  const recovery: RecoveryInput = { after: "sickness", caseKind: "surgery", prevEnd: "2026-04-19" };

  it("702.000 đ/ngày, tính ngày liên tục", () => {
    const result = done(calculateRecovery(recovery, ctx("2026-04-27", "2026-05-01")));
    expect(result.rule).toBe("continuous");
    expect(result.benefitDays).toBe(5);
    expect(result.total).toBe(3_510_000);
  });

  it("8 ngày sau phẫu thuật vượt trần 7 ngày", () => {
    const result = done(calculateRecovery(recovery, ctx("2026-04-27", "2026-05-04")));
    expect(result.benefitDays).toBe(7);
    expect(result.alerts.some((a) => a.level === "danger")).toBe(true);
  });

  it("bắt đầu quá 30 ngày sau khi đi làm lại thì báo đỏ", () => {
    const result = done(calculateRecovery({ ...recovery, prevEnd: "2026-02-28" }, ctx("2026-04-27", "2026-04-28")));
    expect(result.alerts.some((a) => a.level === "danger" && a.text.includes("30 ngày"))).toBe(true);
  });
});

describe("Lịch nghỉ lễ", () => {
  it("có sẵn Tết 2026 và nghỉ bù Giỗ Tổ", async () => {
    const { BUILT_IN_HOLIDAYS, mergeHolidays } = await import("../holidays");
    expect(BUILT_IN_HOLIDAYS.get("2026-02-17")).toBe("Tết Nguyên đán");
    expect(BUILT_IN_HOLIDAYS.get("2026-04-27")).toContain("Nghỉ bù");
    const merged = mergeHolidays({ "2026-06-15": "Nghỉ thành lập công ty" }, ["2026-11-24"]);
    expect(merged.has("2026-11-24")).toBe(false);
    expect(merged.get("2026-06-15")).toBe("Nghỉ thành lập công ty");
  });
});
