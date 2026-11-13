"use client";

import { format, parseISO } from "date-fns";

import { DateField } from "@/components/form/DateField";
import { Field } from "@/components/form/Field";
import { FieldSet } from "@/components/form/FieldSet";
import { Input } from "@/components/ui/input";
import { RadioCards } from "@/components/ui/radio-cards";
import type { DayRule, ISODate, WeeklyRest } from "@/lib/bhxh/types";

import type { Action, CalculatorState } from "../state";

interface CommonFieldsProps {
  state: CalculatorState;
  dispatch: React.Dispatch<Action>;
  rule: DayRule;
  holidayDates: Date[];
  /** Sinh con: ngày kết thúc tự tính, ô kết thúc thành tùy chọn. */
  entitledEnd?: ISODate | null;
}

const WEEKLY_REST: { value: WeeklyRest; label: string; description: string }[] = [
  { value: "sun", label: "Chủ nhật", description: "Làm việc Thứ 2 – Thứ 7" },
  { value: "sat-sun", label: "Thứ 7 & Chủ nhật", description: "Làm việc Thứ 2 – Thứ 6" },
];

export function CommonFields({ state, dispatch, rule, holidayDates, entitledEnd }: CommonFieldsProps) {
  const endError = state.start && state.end && state.end < state.start ? "Ngày kết thúc phải sau ngày bắt đầu" : undefined;
  return (
    <>
      <Field label="Họ và tên người lao động (tùy chọn)" htmlFor="full-name">
        <Input
          id="full-name"
          size="lg"
          placeholder="Nhập họ và tên"
          autoComplete="name"
          value={state.fullName}
          onChange={(event) => dispatch({ type: "set", patch: { fullName: event.target.value } })}
        />
      </Field>

      <div className="grid gap-x-3 sm:grid-cols-2">
        <Field label="Ngày bắt đầu nghỉ" htmlFor="start-date">
          <DateField
            id="start-date"
            value={state.start}
            highlighted={holidayDates}
            onValueChange={(start) => dispatch({ type: "set", patch: { start } })}
          />
        </Field>
        <Field
          label={entitledEnd !== undefined ? "Ngày kết thúc (tùy chọn)" : "Ngày kết thúc nghỉ"}
          htmlFor="end-date"
          error={endError}
        >
          <DateField
            id="end-date"
            value={state.end}
            highlighted={holidayDates}
            placeholder={entitledEnd ? format(parseISO(entitledEnd), "dd/MM/yyyy") : undefined}
            aria-invalid={endError ? true : undefined}
            onValueChange={(end) => dispatch({ type: "set", patch: { end } })}
          />
        </Field>
      </div>

      {rule === "working" ? (
        <FieldSet id="weekly-rest" label="Lịch nghỉ hằng tuần của đơn vị">
          {(labelId) => (
            <RadioCards
              aria-labelledby={labelId}
              options={WEEKLY_REST}
              value={state.weeklyRest}
              onValueChange={(weeklyRest) => dispatch({ type: "set", patch: { weeklyRest } })}
            />
          )}
        </FieldSet>
      ) : null}
    </>
  );
}
