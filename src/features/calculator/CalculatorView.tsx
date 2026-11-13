"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { ArrowDown, RotateCcw } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { mergeHolidays } from "@/lib/bhxh/holidays";
import { birthEntitledEnd, calculateMaternity, maternityRule } from "@/lib/bhxh/maternity";
import type { PeriodContext } from "@/lib/bhxh/period";
import { calculateRecovery } from "@/lib/bhxh/recovery";
import { calculateSickness } from "@/lib/bhxh/sickness";
import { isPending, type CalcOutcome, type DayRule } from "@/lib/bhxh/types";

import { Header } from "./Header";
import { CommonFields } from "./input/CommonFields";
import { FormSection } from "./input/FormSection";
import { HolidayPanel } from "./input/HolidayPanel";
import { MaternityFields, MaternityKindField } from "./input/MaternityFields";
import { RecoveryAfterField, RecoveryFields } from "./input/RecoveryFields";
import { SicknessFields, SicknessKindField } from "./input/SicknessFields";
import { PrintSheet } from "./result/PrintSheet";
import { ResultPanel } from "./result/ResultPanel";
import { initialState, reducer, type CalculatorState } from "./state";
import { benefitText, buildCopyText, caseTitle } from "./summary";

function ruleOf(state: CalculatorState): DayRule {
  if (state.mode === "sickness") return "working";
  if (state.mode === "maternity") return maternityRule(state.maternity.kind);
  return "continuous";
}

function calculate(state: CalculatorState, holidays: PeriodContext["holidays"]): CalcOutcome {
  const ctx: PeriodContext = { start: state.start, end: state.end, weeklyRest: state.weeklyRest, holidays };
  switch (state.mode) {
    case "sickness":
      return calculateSickness(state.sickness, ctx);
    case "maternity":
      return calculateMaternity(state.maternity, ctx);
    case "recovery":
      return calculateRecovery(state.recovery, ctx);
  }
}

export function CalculatorView() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [copied, setCopied] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const holidays = React.useMemo(
    () => mergeHolidays(state.customHolidays, state.removedHolidays),
    [state.customHolidays, state.removedHolidays],
  );
  const holidayDates = React.useMemo(() => [...holidays.keys()].map((iso) => parseISO(iso)), [holidays]);
  const outcome = React.useMemo(() => calculate(state, holidays), [state, holidays]);
  const rule = ruleOf(state);
  const title = caseTitle(state);
  const isBirth = state.mode === "maternity" && state.maternity.kind === "birth";

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (isPending(outcome)) return;
    try {
      await navigator.clipboard.writeText(buildCopyText(state, outcome));
      setCopied(true);
    } catch {
      window.alert("Trình duyệt chặn sao chép. Hãy chọn và sao chép thủ công.");
    }
  };

  const holidayButton = <HolidayPanel state={state} dispatch={dispatch} />;

  return (
    <>
      <div className="no-print mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-4 pt-5 pb-28 sm:px-6 lg:gap-8 lg:px-8 lg:pt-8 lg:pb-12">
        <Header mode={state.mode} onModeChange={(mode) => dispatch({ type: "set", patch: { mode } })} holidayButton={holidayButton} />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="flex items-end justify-between gap-4">
              <h1 className="text-[34px] leading-[1.1] tracking-tight sm:text-[44px]">
                <span className="block font-semibold">Tính chế độ</span>
                <span className="block font-light">Bảo hiểm xã hội</span>
              </h1>
              <button
                type="button"
                onClick={() => dispatch({ type: "reset" })}
                className="mb-1 inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground outline-hidden hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
              >
                <RotateCcw aria-hidden className="size-4" /> Làm mới
              </button>
            </div>

            <Card className="flex flex-col gap-1 rounded-2xl p-5 sm:p-6 lg:sticky lg:top-6">
              <FormSection step={1} title="Chế độ & trường hợp">
                {state.mode === "sickness" ? <SicknessKindField value={state.sickness.kind} dispatch={dispatch} /> : null}
                {state.mode === "maternity" ? <MaternityKindField value={state.maternity.kind} dispatch={dispatch} /> : null}
                {state.mode === "recovery" ? <RecoveryAfterField value={state.recovery.after} dispatch={dispatch} /> : null}
              </FormSection>

              <FormSection step={2} title="Thời gian nghỉ">
                <CommonFields
                  state={state}
                  dispatch={dispatch}
                  rule={rule}
                  holidayDates={holidayDates}
                  entitledEnd={isBirth ? (state.start ? birthEntitledEnd(state.start, state.maternity.babies) : null) : undefined}
                />
              </FormSection>

              <FormSection step={3} title="Chi tiết & tiền lương">
                {state.mode === "sickness" ? <SicknessFields input={state.sickness} dispatch={dispatch} /> : null}
                {state.mode === "maternity" ? <MaternityFields input={state.maternity} dispatch={dispatch} /> : null}
                {state.mode === "recovery" ? <RecoveryFields input={state.recovery} dispatch={dispatch} start={state.start} /> : null}
              </FormSection>
            </Card>
          </div>

          <div ref={resultRef} id="ket-qua" className="scroll-mt-4 lg:col-span-7">
            <ResultPanel outcome={outcome} title={title} copied={copied} onCopy={handleCopy} onPrint={() => window.print()} />
          </div>
        </div>

        <footer className="text-center text-xs leading-5 text-muted-foreground">
          Xử lý hoàn toàn trên trình duyệt, không lưu dữ liệu. Kết quả mang tính tham khảo theo Luật BHXH 41/2024/QH15.
        </footer>
      </div>

      {!isPending(outcome) ? (
        <button
          type="button"
          onClick={() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="no-print fixed inset-x-4 bottom-4 z-30 flex h-16 cursor-pointer items-center justify-between rounded-full bg-ink pr-2 pl-6 text-white shadow-soft outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring lg:hidden"
        >
          <span className="flex flex-col items-start">
            <span className="text-xs leading-4 text-white/70">
              {outcome.moneyMissing ? "Số ngày được hưởng" : "Tiền trợ cấp ước tính"}
            </span>
            <span className="text-lg leading-6 font-semibold tabular-nums">
              {outcome.moneyMissing ? benefitText(outcome) : formatMoney(outcome.total)}
            </span>
          </span>
          <span className="grid size-12 place-items-center rounded-full bg-white text-ink">
            <ArrowDown aria-hidden className="size-5" />
          </span>
        </button>
      ) : null}

      {!isPending(outcome) ? <PrintSheet state={state} result={outcome} /> : null}
    </>
  );
}
