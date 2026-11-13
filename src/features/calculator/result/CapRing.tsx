import { Card } from "@/components/ui/card";
import { formatDays } from "@/lib/format";
import type { CapUsage } from "@/lib/bhxh/types";
import { cn } from "@/lib/utils";

const SIZE = 112;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Vòng tiến độ so với mức trần (kiểu vòng "8%" của mẫu ProHealth). */
export function CapRing({ cap }: { cap: CapUsage }) {
  const ratio = cap.limit > 0 ? cap.used / cap.limit : 0;
  const over = ratio > 1;
  const offset = CIRCUMFERENCE * (1 - Math.min(ratio, 1));
  return (
    <Card className="flex h-full flex-col gap-4 rounded-2xl p-5 lg:p-6">
      <span className="text-sm leading-5 font-medium">{cap.label}</span>
      <div className="my-auto flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-muted" />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className={cn(
                "transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none",
                over ? "stroke-status-danger-fg" : "stroke-primary",
              )}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center">
            <span className={cn("text-3xl leading-none font-light tabular-nums", over && "text-status-danger-fg")}>
              {formatDays(cap.used)}
            </span>
          </span>
        </div>
        <div className="flex flex-col text-sm leading-5">
          <span className="text-muted-foreground">Trần tối đa</span>
          <span className="text-2xl leading-8 font-light tabular-nums">
            {formatDays(cap.limit)} <span className="text-sm text-muted-foreground">{cap.unit}</span>
          </span>
          <span className={cn("mt-1 font-medium", over ? "text-status-danger-fg" : "text-status-approved-fg")}>
            {over ? `Vượt ${formatDays(cap.used - cap.limit)} ${cap.unit}` : `Còn ${formatDays(cap.limit - cap.used)} ${cap.unit}`}
          </span>
        </div>
      </div>
    </Card>
  );
}
