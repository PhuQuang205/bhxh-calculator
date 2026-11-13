"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioCardsProps<T extends string> {
  "aria-labelledby"?: string;
  "aria-label"?: string;
  options: readonly RadioCardOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Số cột trên màn rộng (sm+). Mobile luôn 1 cột khi > 2 lựa chọn. */
  columns?: 1 | 2 | 3;
  className?: string;
}

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREV_KEYS = ["ArrowLeft", "ArrowUp"];

/** Nhóm thẻ chọn một (radio cards): nền xám như ô nhập, thẻ đang chọn viền xanh nền xanh nhạt. */
function RadioCards<T extends string>({
  options,
  value,
  onValueChange,
  columns = 2,
  className,
  ...aria
}: RadioCardsProps<T>) {
  const groupRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREV_KEYS.includes(event.key) ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + step + options.length) % options.length];
    onValueChange(next.value);
    groupRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      {...aria}
      onKeyDown={handleKeyDown}
      className={cn(
        "grid gap-2",
        options.length > 2 ? "grid-cols-1" : "grid-cols-2",
        columns === 1 ? "sm:grid-cols-1" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            data-value={option.value}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative flex min-h-14 cursor-pointer flex-col justify-center rounded-lg border-2 px-4 py-2.5 pr-10 text-left outline-hidden transition-colors duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring motion-reduce:transition-none",
              selected ? "border-primary bg-primary-tint" : "border-transparent bg-muted hover:bg-border-subtle",
            )}
          >
            <span className={cn("text-sm leading-5 font-semibold", selected ? "text-primary" : "text-foreground")}>
              {option.label}
            </span>
            {option.description ? (
              <span className="text-xs leading-4 text-muted-foreground">{option.description}</span>
            ) : null}
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 right-3 grid size-5 -translate-y-1/2 place-items-center rounded-full",
                selected ? "bg-primary text-primary-foreground" : "border-2 border-border bg-card",
              )}
            >
              {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { RadioCards };
export type { RadioCardOption };
