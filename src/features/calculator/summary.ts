import { format, parseISO } from "date-fns";

import { formatDays } from "@/lib/format";
import { MATERNITY_KIND_LABEL } from "@/lib/bhxh/maternity";
import { RECOVERY_CASE_LABEL } from "@/lib/bhxh/recovery";
import { SICKNESS_KIND_LABEL } from "@/lib/bhxh/sickness";
import type { CalcResult } from "@/lib/bhxh/types";

import type { CalculatorState } from "./state";

const dmy = (iso: string) => format(parseISO(iso), "dd/MM/yyyy");

/** Tên chế độ + trường hợp, ví dụ "Thai sản – Sinh con". */
export function caseTitle(state: CalculatorState): string {
  switch (state.mode) {
    case "sickness":
      return `Ốm đau – ${SICKNESS_KIND_LABEL[state.sickness.kind]}`;
    case "maternity":
      return `Thai sản – ${MATERNITY_KIND_LABEL[state.maternity.kind]}`;
    case "recovery": {
      const labels: Record<string, string> = RECOVERY_CASE_LABEL[state.recovery.after];
      return `Dưỡng sức sau ${state.recovery.after === "sickness" ? "ốm đau" : "thai sản"} – ${labels[state.recovery.caseKind] ?? labels.other}`;
    }
  }
}

export function periodText(result: CalcResult): string {
  const first = result.days[0]?.date;
  const last = result.days.at(-1)?.date;
  return first && last ? `${dmy(first)} – ${dmy(last)}` : "";
}

export function benefitText(result: CalcResult): string {
  return result.benefitMonths !== undefined ? `${result.benefitMonths} tháng` : `${formatDays(result.benefitDays)} ngày`;
}

/** Văn bản gọn để dán Zalo/Email. */
export function buildCopyText(state: CalculatorState, result: CalcResult): string {
  const rule = result.rule === "working" ? "ngày làm việc (trừ nghỉ tuần, lễ, Tết)" : "ngày liên tục (tính cả T7, CN, lễ, Tết)";
  const lines = [
    "PHIẾU TÍNH CHẾ ĐỘ BHXH",
    state.fullName.trim() ? `Người lao động: ${state.fullName.trim()}` : null,
    `Chế độ: ${caseTitle(state)}`,
    `Thời gian nghỉ: ${periodText(result)} (${result.calendarDays} ngày theo lịch)`,
    `Cách tính: ${rule}`,
    ...result.deductions.map((line) => `  • ${line}`),
    `SỐ NGÀY ĐƯỢC HƯỞNG: ${benefitText(result)}`,
    "",
    ...result.alerts.filter((a) => a.level !== "ok").map((a) => `⚠ ${a.text}`),
    "Căn cứ: Luật BHXH 41/2024/QH15. Số liệu chỉ để tham khảo.",
  ];
  return lines.filter((line) => line !== null).join("\n");
}
