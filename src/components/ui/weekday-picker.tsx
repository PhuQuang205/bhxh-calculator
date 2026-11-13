"use client";

import { cn } from "@/lib/utils";

/** Thứ tự hiển thị Thứ 2 → Chủ nhật; giá trị theo `Date.getDay()` (0 = Chủ nhật). */
const DAYS = [
  { value: 1, short: "T2", name: "Thứ hai" },
  { value: 2, short: "T3", name: "Thứ ba" },
  { value: 3, short: "T4", name: "Thứ tư" },
  { value: 4, short: "T5", name: "Thứ năm" },
  { value: 5, short: "T6", name: "Thứ sáu" },
  { value: 6, short: "T7", name: "Thứ bảy" },
  { value: 0, short: "CN", name: "Chủ nhật" },
] as const;

interface WeekdayPickerProps {
  "aria-labelledby"?: string;
  value: readonly number[];
  onValueChange: (value: number[]) => void;
}

/** Chọn nhiều thứ trong tuần (nút bật/tắt). Ngày đang chọn nền xanh. */
export function WeekdayPicker({ value, onValueChange, ...aria }: WeekdayPickerProps) {
  const toggle = (day: number) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onValueChange(next.sort((a, b) => a - b));
  };
  return (
    <div role="group" {...aria} className="grid grid-cols-7 gap-1.5">
      {DAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={active}
            aria-label={day.name}
            onClick={() => toggle(day.value)}
            className={cn(
              "h-12 cursor-pointer rounded-lg text-sm leading-5 font-semibold outline-hidden transition-colors duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring motion-reduce:transition-none",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border-subtle",
            )}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );
}

/** "Nghỉ Thứ tư, Chủ nhật" / "Không có ngày nghỉ hằng tuần". */
export function describeWeeklyRest(value: readonly number[]): string {
  if (value.length === 0) return "Không có ngày nghỉ hằng tuần: mọi ngày đều là ngày làm việc";
  const names = DAYS.filter((day) => value.includes(day.value)).map((day) => day.name);
  return `Nghỉ hằng tuần: ${names.join(", ")}`;
}
