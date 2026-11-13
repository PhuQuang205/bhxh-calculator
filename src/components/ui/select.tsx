"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Theo shadcn `select` (Base UI), viết lại bằng token portal: CLI sẽ ghi đè button/input đã custom theo template.
// Ô lọc thấp 40 chữ 14 trên mobile cho gọn hàng lọc, desktop cao 48 (người dùng chốt 20/10, U-D-36).
const Select = SelectPrimitive.Root;

function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 min-w-0 cursor-pointer items-center justify-between gap-2 rounded-full border border-border-subtle bg-card pr-2.5 pl-3.5 text-sm leading-5 font-medium lg:h-12 lg:pr-3 lg:pl-4 lg:text-base lg:leading-6 text-foreground outline-hidden transition-colors duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring data-disabled:cursor-not-allowed data-disabled:text-muted-foreground data-popup-open:bg-primary-tint motion-reduce:transition-none [&[data-popup-open]_[data-slot=select-icon]]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="flex shrink-0 text-muted-foreground transition-transform duration-100 motion-reduce:transition-none"
      >
        <ChevronDown aria-hidden className="size-4 lg:size-5" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("min-w-0 truncate", className)} {...props} />;
}

function SelectContent({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "end",
  ...props
}: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <SelectPrimitive.Portal>
      {/* Danh sách thả xuống dưới ô, không đè lên ô như kiểu macOS (alignItemWithTrigger mặc định). */}
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignItemWithTrigger={false}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto overscroll-contain rounded-xl bg-popover p-1 text-popover-foreground shadow-soft ring-1 ring-border-subtle outline-hidden",
            className,
          )}
          {...props}
        />
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

// Vùng chạm 44px (ui-metrics); dấu tích ở mục đang chọn.
function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-11 w-full cursor-pointer items-center rounded-lg pr-10 pl-3 text-base leading-6 whitespace-nowrap text-foreground outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-primary-tint",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="pointer-events-none absolute right-3 flex size-5 items-center justify-center text-primary">
        <Check aria-hidden className="size-5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
