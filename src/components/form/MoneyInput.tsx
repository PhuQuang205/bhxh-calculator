"use client";

import * as React from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type MoneyInputProps = Omit<InputProps, "value" | "onChange" | "type"> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
};

const MAX_DIGITS = 13;

/** Ô tiền: gõ số, tự chèn dấu chấm hàng nghìn, hậu tố "đ". Giá trị ra là số nguyên đồng. */
export function MoneyInput({ value, onValueChange, className, ...props }: MoneyInputProps) {
  return (
    <>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === null ? "" : formatNumber(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS);
          onValueChange(digits === "" ? null : Number(digits));
        }}
        className={cn("pr-10 tabular-nums", className)}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-base leading-6 text-muted-foreground"
      >
        đ
      </span>
    </>
  );
}
