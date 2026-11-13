"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react";

import { cn } from "@/lib/utils";

type SwitchFieldProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

/** Hàng bật/tắt: nhãn + mô tả bên trái, công tắc bên phải. Cả hàng là vùng bấm (≥ 56px). */
function SwitchField({ id, label, description, checked, onCheckedChange, className }: SwitchFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    // Label bọc ngoài: Switch.Root mặc định là <span> để hỗ trợ đúng kiểu gắn nhãn này.
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-lg bg-muted px-4 py-3 transition-colors duration-100 has-data-checked:bg-primary-tint motion-reduce:transition-none",
        className,
      )}
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-sm leading-5 font-medium text-foreground">{label}</span>
        {description ? (
          <span id={descriptionId} className="text-xs leading-4 text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next)}
        aria-describedby={descriptionId}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-border p-0.5 outline-hidden transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring data-checked:bg-primary motion-reduce:transition-none"
      >
        <SwitchPrimitive.Thumb className="size-6 rounded-full bg-card shadow-sm transition-transform duration-150 data-checked:translate-x-5 motion-reduce:transition-none" />
      </SwitchPrimitive.Root>
    </label>
  );
}

export { SwitchField };
