export const EMPTY_VALUE = "—";

const NBSP = " ";

const integerFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const dayFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const percentFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

type NumberInput = number | null | undefined;

function isNumber(value: NumberInput): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** 1234567 → "1.234.567" */
export function formatNumber(value: NumberInput): string {
  return isNumber(value) ? integerFormatter.format(Math.round(value)) : EMPTY_VALUE;
}

/** 1234567 → "1.234.567 đ" (làm tròn tới đồng) */
export function formatMoney(value: NumberInput): string {
  return isNumber(value) ? `${integerFormatter.format(Math.round(value))}${NBSP}đ` : EMPTY_VALUE;
}

/** 5.5 → "5,5" */
export function formatDays(value: NumberInput): string {
  return isNumber(value) ? dayFormatter.format(value) : EMPTY_VALUE;
}

/** 0.75 → "75%" */
export function formatPercent(ratio: NumberInput): string {
  return isNumber(ratio) ? `${percentFormatter.format(ratio * 100)}%` : EMPTY_VALUE;
}
