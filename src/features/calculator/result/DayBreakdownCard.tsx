import { format, parseISO } from "date-fns";

import { Card } from "@/components/ui/card";
import { formatDays } from "@/lib/format";
import type { CalcResult, DayCell } from "@/lib/bhxh/types";
import { cn } from "@/lib/utils";

/** Quá số ngày này thì dải cột quá mảnh: chuyển sang thanh tỉ lệ. */
const MAX_BARS = 62;

function cellTitle(cell: DayCell): string {
  const day = format(parseISO(cell.date), "dd/MM/yyyy");
  return cell.included ? `${day}: được tính` : `${day}: trừ (${cell.label ?? "ngày nghỉ"})`;
}

function DayStrip({ days }: { days: readonly DayCell[] }) {
  if (days.length === 0) return null;
  if (days.length > MAX_BARS) {
    const included = days.filter((cell) => cell.included).length;
    const ratio = included / days.length;
    return (
      <div aria-hidden className="flex h-16 items-end">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-border-subtle">
          <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden className="flex h-16 items-end gap-[3px]">
      {days.map((cell) => (
        <span
          key={cell.date}
          title={cellTitle(cell)}
          className={cn(
            "min-w-[3px] flex-1 rounded-full",
            cell.included ? "h-full bg-primary" : cell.reason === "holiday" ? "h-1/2 bg-status-danger-border" : "h-1/3 bg-border",
          )}
        />
      ))}
    </div>
  );
}

export function DayBreakdownCard({ result }: { result: CalcResult }) {
  const first = result.days[0]?.date;
  const last = result.days.at(-1)?.date;
  return (
    <Card className="flex flex-col gap-5 rounded-2xl p-5 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm leading-5 text-muted-foreground">Số ngày được hưởng</span>
          <span className="text-5xl leading-none font-light tracking-tight tabular-nums">
            {result.benefitMonths !== undefined ? result.benefitMonths : formatDays(result.benefitDays)}
            <span className="ml-1.5 align-top text-base font-medium text-muted-foreground">
              {result.benefitMonths !== undefined ? "tháng" : "ngày"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
          <span className="text-sm leading-5 text-muted-foreground">Tổng theo lịch</span>
          <span className="text-base leading-6 font-semibold tabular-nums">{result.calendarDays} ngày</span>
        </div>
      </div>

      <div className="rounded-xl bg-muted/70 px-4 pt-4 pb-3">
        <DayStrip days={result.days} />
        {first && last ? (
          <div className="mt-2 flex justify-between text-xs leading-4 text-muted-foreground tabular-nums">
            <span>{format(parseISO(first), "dd/MM/yyyy")}</span>
            <span>{format(parseISO(last), "dd/MM/yyyy")}</span>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-4 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> Ngày được tính
          </span>
          {result.rule === "working" ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-border" /> Nghỉ hằng tuần
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-status-danger-border" /> Lễ, Tết
              </span>
            </>
          ) : null}
        </div>
      </div>

      {result.deductions.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm leading-5">
          {result.deductions.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
