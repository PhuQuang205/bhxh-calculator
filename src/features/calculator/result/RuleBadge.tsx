import { CalendarCheck2, CalendarRange } from "lucide-react";

import type { DayRule } from "@/lib/bhxh/types";
import { cn } from "@/lib/utils";

const COPY: Record<DayRule, { title: string; detail: string }> = {
  working: {
    title: "Tính theo ngày làm việc",
    detail: "Không tính ngày nghỉ hằng tuần và ngày nghỉ lễ, Tết",
  },
  continuous: {
    title: "Tính theo ngày liên tục",
    detail: "Tính cả Thứ 7, Chủ nhật và ngày nghỉ lễ, Tết",
  },
};

export function RuleBadge({ rule, className }: { rule: DayRule; className?: string }) {
  const Icon = rule === "working" ? CalendarCheck2 : CalendarRange;
  return (
    <div
      className={cn(
        "inline-flex min-h-12 items-center gap-3 rounded-full border py-2 pr-5 pl-2",
        rule === "working"
          ? "border-status-info-border bg-status-info-bg text-status-info-fg"
          : "border-status-violet-border bg-status-violet-bg text-status-violet-fg",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card">
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm leading-5 font-semibold">{COPY[rule].title}</span>
        <span className="text-xs leading-4 opacity-80">{COPY[rule].detail}</span>
      </span>
    </div>
  );
}
