"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { format, parseISO } from "date-fns";
import { CalendarCog, Plus, RotateCcw, X } from "lucide-react";

import { DateField } from "@/components/form/DateField";
import { Field } from "@/components/form/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUILT_IN_HOLIDAYS } from "@/lib/bhxh/holidays";
import type { ISODate } from "@/lib/bhxh/types";
import { cn } from "@/lib/utils";

import type { Action, CalculatorState } from "../state";

interface HolidayPanelProps {
  state: Pick<CalculatorState, "customHolidays" | "removedHolidays">;
  dispatch: React.Dispatch<Action>;
}

const dmy = (iso: ISODate) => format(parseISO(iso), "dd/MM/yyyy");
const weekday = (iso: ISODate) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][parseISO(iso).getDay()];

export function HolidayPanel({ state, dispatch }: HolidayPanelProps) {
  const [date, setDate] = React.useState<ISODate | null>(null);
  const [label, setLabel] = React.useState("");
  const years = [...new Set([...BUILT_IN_HOLIDAYS.keys()].map((iso) => iso.slice(0, 4)))];
  const [year, setYear] = React.useState(years.includes("2026") ? "2026" : years[0]);
  const changed = Object.keys(state.customHolidays).length + state.removedHolidays.length;

  const toggleBuiltIn = (iso: ISODate) => {
    const removed = state.removedHolidays.includes(iso)
      ? state.removedHolidays.filter((d) => d !== iso)
      : [...state.removedHolidays, iso];
    dispatch({ type: "set", patch: { removedHolidays: removed } });
  };

  const addCustom = () => {
    if (!date) return;
    dispatch({ type: "set", patch: { customHolidays: { ...state.customHolidays, [date]: label.trim() } } });
    setDate(null);
    setLabel("");
  };

  const removeCustom = (iso: ISODate) => {
    const next = { ...state.customHolidays };
    delete next[iso];
    dispatch({ type: "set", patch: { customHolidays: next } });
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger className="relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-card px-4 text-sm leading-5 font-medium shadow-soft outline-hidden transition-colors duration-100 hover:bg-primary-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring motion-reduce:transition-none">
        <CalendarCog aria-hidden className="size-4 text-primary" />
        Lịch nghỉ lễ
        {changed > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground tabular-nums">{changed}</span>
        ) : null}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-card shadow-soft outline-hidden transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full sm:w-[720px] sm:rounded-l-2xl motion-reduce:transition-none">
          <div className="flex items-start justify-between gap-4 p-6 pb-3">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-lg leading-6 font-semibold">Ngày nghỉ lễ, Tết</Dialog.Title>
              <Dialog.Description className="text-sm leading-5 text-muted-foreground">
                Dùng để trừ khi tính theo ngày làm việc. Bỏ chọn ngày đơn vị không nghỉ, thêm ngày nghỉ Tết hoặc nghỉ bù riêng.
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Đóng" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-muted outline-hidden hover:bg-border-subtle focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring">
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
            <div role="radiogroup" aria-label="Năm" className="flex gap-2">
              {years.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={item === year}
                  onClick={() => setYear(item)}
                  className={cn(
                    "h-10 cursor-pointer rounded-full px-4 text-sm font-semibold tabular-nums outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
                    item === year ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-border-subtle",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <ul className="flex flex-col gap-1">
              {[...BUILT_IN_HOLIDAYS.entries()]
                .filter(([iso]) => iso.startsWith(year))
                .map(([iso, name]) => {
                  const active = !state.removedHolidays.includes(iso);
                  return (
                    <li key={iso}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 hover:bg-muted">
                        <input type="checkbox" checked={active} onChange={() => toggleBuiltIn(iso)} className="size-4 accent-primary" />
                        <span className="w-24 shrink-0 text-sm tabular-nums">
                          {weekday(iso)} {format(parseISO(iso), "dd/MM")}
                        </span>
                        <span className={cn("text-sm", !active && "text-muted-foreground line-through")}>{name}</span>
                      </label>
                    </li>
                  );
                })}
            </ul>

            <div className="flex flex-col rounded-xl bg-muted/60 p-4">
              <span className="mb-3 text-sm leading-5 font-semibold">Thêm ngày nghỉ của đơn vị</span>
              <div className="grid gap-x-3 sm:grid-cols-[200px_1fr_auto] sm:items-start">
                <Field label="Ngày" htmlFor="custom-holiday-date">
                  <DateField id="custom-holiday-date" value={date} onValueChange={setDate} className="bg-card" />
                </Field>
                <Field label="Tên ngày nghỉ" htmlFor="custom-holiday-label">
                  <Input id="custom-holiday-label" size="lg" placeholder="Ví dụ: Nghỉ bù Tết" value={label} onChange={(e) => setLabel(e.target.value)} className="bg-card" />
                </Field>
                {/* Căn với ô nhập: chừa chỗ nhãn 20px + 8px phía trên. */}
                <Button size="lg" onClick={addCustom} disabled={!date} className="self-start sm:mt-7">
                  <Plus aria-hidden /> Thêm
                </Button>
              </div>

              {Object.keys(state.customHolidays).length > 0 ? (
                <ul className="mt-4 flex flex-col gap-1">
                  {Object.entries(state.customHolidays)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([iso, name]) => (
                      <li key={iso} className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-card px-3">
                        <span className="text-sm">
                          <span className="tabular-nums">{dmy(iso)}</span> · {name || "Ngày nghỉ của đơn vị"}
                        </span>
                        <button type="button" aria-label={`Xóa ngày ${dmy(iso)}`} onClick={() => removeCustom(iso)} className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-muted">
                          <X aria-hidden className="size-4" />
                        </button>
                      </li>
                    ))}
                </ul>
              ) : null}
            </div>

            {changed > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => dispatch({ type: "set", patch: { customHolidays: {}, removedHolidays: [] } })}
              >
                <RotateCcw aria-hidden /> Khôi phục lịch mặc định
              </Button>
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
