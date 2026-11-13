"use client";

import { ArrowUpRight, ClipboardList, Copy, Check, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isPending, type CalcOutcome } from "@/lib/bhxh/types";

import { AlertList } from "./AlertList";
import { CapRing } from "./CapRing";
import { DayBreakdownCard } from "./DayBreakdownCard";
import { RuleBadge } from "./RuleBadge";

interface ResultPanelProps {
  outcome: CalcOutcome;
  title: string;
  copied: boolean;
  onCopy: () => void;
  onPrint: () => void;
}

function EmptyState({ missing }: { missing: string[] }) {
  return (
    <Card className="flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-primary-tint text-primary">
        <ClipboardList aria-hidden className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-lg leading-6 font-semibold">Kết quả sẽ hiện ngay khi đủ thông tin</p>
        <p className="text-sm leading-5 text-muted-foreground">Còn thiếu:</p>
      </div>
      <ul className="flex flex-wrap justify-center gap-2">
        {missing.map((item) => (
          <li key={item} className="rounded-full bg-muted px-3 py-1.5 text-sm leading-5">
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ResultPanel({ outcome, title, copied, onCopy, onPrint }: ResultPanelProps) {
  const ready = !isPending(outcome);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RuleBadge rule={outcome.rule} />
        <Button size="lg" onClick={onPrint} disabled={!ready} className="no-print px-7">
          In phiếu tính <ArrowUpRight aria-hidden />
        </Button>
      </div>

      {isPending(outcome) ? (
        <EmptyState missing={outcome.missing} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <div className={outcome.cap ? "md:col-span-3" : "md:col-span-5"}>
              <DayBreakdownCard result={outcome} />
            </div>
            {outcome.cap ? (
              <div className="md:col-span-2">
                <CapRing cap={outcome.cap} />
              </div>
            ) : null}
          </div>

          <Card className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs leading-4 text-muted-foreground">Trường hợp</span>
                <span className="text-base leading-6 font-semibold">{title}</span>
              </div>
              <ul className="flex flex-col gap-1 text-xs leading-4 text-muted-foreground">
                {outcome.citations.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:w-56">
              <Button variant="secondary" surface="card" onClick={onCopy}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? "Đã sao chép" : "Sao chép kết quả"}
              </Button>
              <Button variant="secondary" surface="card" onClick={onPrint}>
                <Printer aria-hidden /> In / Xuất PDF
              </Button>
            </div>
          </Card>

          <AlertList alerts={outcome.alerts} />
        </>
      )}
    </div>
  );
}
