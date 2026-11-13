"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

const chipClass =
  "inline-flex h-12 shrink-0 snap-start items-center gap-2 rounded-full border px-5 text-base leading-6 whitespace-nowrap outline-hidden transition-[background-color,color,scale] duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100";

type ChipProps = Omit<React.ComponentProps<"button">, "role" | "aria-checked"> & {
  selected: boolean;
  count?: number;
};

function Chip({ selected, count, className, children, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
      data-slot="chip"
      className={cn(
        chipClass,
        selected
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border-subtle bg-chip text-foreground hover:bg-card",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span className={cn("tabular-nums", selected ? "text-primary-foreground" : "text-muted-foreground")}>
          {formatNumber(count)}
        </span>
      ) : null}
    </button>
  );
}

interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface ChipRowProps<T extends string> {
  "aria-label": string;
  options: readonly ChipOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREV_KEYS = ["ArrowLeft", "ArrowUp"];

function ChipRow<T extends string>({ "aria-label": ariaLabel, options, value, onValueChange, className }: ChipRowProps<T>) {
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const selected = rowRef.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    selected?.scrollIntoView({ block: "nearest", inline: "center" });
    // Chỉ cuộn chip đang chọn vào tầm nhìn lúc mount; đổi chip sau đó là do người dùng bấm, chip đã trong tầm nhìn.
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREV_KEYS.includes(event.key) ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const enabled = options.filter((option) => !option.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((option) => option.value === value);
    const next = enabled[(currentIndex + step + enabled.length) % enabled.length];
    onValueChange(next.value);
    rowRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };

  return (
    <div
      ref={rowRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn("scrollbar-none -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 lg:-mx-6 lg:scroll-px-6 lg:px-6", className)}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Chip
            key={option.value}
            data-value={option.value}
            selected={isSelected}
            count={isSelected ? option.count : undefined}
            disabled={option.disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </Chip>
        );
      })}
    </div>
  );
}

export { Chip, ChipRow };
export type { ChipOption };
