"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OptionSelectProps<T extends string> {
  items: readonly { value: T; label: string }[];
  value: T;
  onValueChange: (value: T) => void;
  /** id nhãn của FieldSet bao ngoài. */
  labelledBy: string;
}

/** Dropdown chọn một giá trị, cùng kiểu ô nhập h-14 nền muted. */
export function OptionSelect<T extends string>({ items, value, onValueChange, labelledBy }: OptionSelectProps<T>) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
    >
      <SelectTrigger aria-labelledby={labelledBy} className="h-14 w-full rounded-lg border-0 bg-muted pr-3 pl-4 text-base lg:h-14">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
