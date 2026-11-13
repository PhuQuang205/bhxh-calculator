import { CalendarCheck2, CalendarRange } from "lucide-react";

import type { DayRule } from "@/lib/bhxh/types";
import { cn } from "@/lib/utils";

const COPY: Record<DayRule, { title: string }> = {
  working: {
    title: "Tính theo ngày làm việc",
  },
  continuous: {
    title: "Tính theo ngày liên tục",
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
      <span className="text-sm leading-5 font-semibold">{COPY[rule].title}</span>
    </div>
  );
}
