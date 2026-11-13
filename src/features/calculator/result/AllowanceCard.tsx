"use client";

import { ArrowUpRight, Check } from "lucide-react";

import { formatMoney } from "@/lib/format";
import type { MoneyLine } from "@/lib/bhxh/types";

interface AllowanceCardProps {
  total: number;
  lines: readonly MoneyLine[];
  /** Chưa nhập lương: hiện lời nhắc thay cho số tiền. */
  moneyMissing?: string;
  copied: boolean;
  onCopy: () => void;
}

/** Thẻ tối hiển thị tổng tiền và công thức đã thay số (vị trí thẻ "Osteoporosis" của mẫu). */
export function AllowanceCard({ total, lines, moneyMissing, copied, onCopy }: AllowanceCardProps) {
  return (
    <section
      aria-label="Dự toán tiền trợ cấp"
      className="relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-soft lg:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/40 blur-3xl"
      />
      <div className="relative flex items-start justify-between gap-4">
        <span className="inline-flex h-8 items-center rounded-full bg-white/10 px-3 text-xs leading-4 font-medium text-white/80">
          Tiền trợ cấp ước tính
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Đã sao chép kết quả" : "Sao chép kết quả"}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-ink outline-hidden transition-[scale] duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-white active:scale-95 motion-reduce:transition-none"
        >
          {copied ? <Check aria-hidden className="size-5" /> : <ArrowUpRight aria-hidden className="size-5" />}
        </button>
      </div>

      {moneyMissing ? (
        <div aria-live="polite" className="relative flex flex-col gap-2">
          <p className="text-2xl leading-8 font-light">Chưa tính tiền</p>
          <p className="text-sm leading-5 text-white/70">
            Số ngày hưởng đã tính xong. Muốn ước tính tiền trợ cấp thì nhập thêm «{moneyMissing}» (không bắt buộc, bộ phận
            nhân sự/kế toán thường có số này).
          </p>
        </div>
      ) : (
        <p aria-live="polite" className="relative text-4xl leading-tight font-light tracking-tight tabular-nums sm:text-5xl">
          {formatMoney(total)}
        </p>
      )}

      <ul className={moneyMissing ? "hidden" : "relative flex flex-col gap-3 border-t border-white/10 pt-4"}>
        {lines.map((line) => (
          <li key={line.label} className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-3 text-sm leading-5">
              <span className="text-white/80">{line.label}</span>
              <span className="font-semibold whitespace-nowrap tabular-nums">{formatMoney(line.amount)}</span>
            </div>
            <span className="text-xs leading-4 text-white/55 tabular-nums">{line.formula}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
