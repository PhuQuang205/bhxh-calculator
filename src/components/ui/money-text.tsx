import * as React from "react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

type MoneySize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<MoneySize, string> = {
  sm: "text-sm leading-5",
  md: "text-base leading-6",
  lg: "text-2xl leading-8",
  xl: "text-[32px] leading-10",
};

type MoneyTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: number | null | undefined;
  size?: MoneySize;
};

function MoneyText({ value, size = "md", className, ...props }: MoneyTextProps) {
  return (
    <span
      data-slot="money-text"
      className={cn("font-semibold whitespace-nowrap tabular-nums", SIZE_CLASS[size], className)}
      {...props}
    >
      {formatMoney(value)}
    </span>
  );
}

export { MoneyText };
export type { MoneySize };
