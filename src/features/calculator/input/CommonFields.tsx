"use client";

import { DateField } from "@/components/form/DateField";
import { Field } from "@/components/form/Field";
import { FieldSet } from "@/components/form/FieldSet";
import { OptionSelect } from "@/components/form/OptionSelect";
import { Input } from "@/components/ui/input";
import { WeekdayPicker } from "@/components/ui/weekday-picker";
import type { DayRule, ISODate } from "@/lib/bhxh/types";

import { WEEKLY_REST_PRESETS, type Action, type CalculatorState, type WeeklyRestPreset } from "../state";

const PRESETS: { value: WeeklyRestPreset; label: string }[] = [
  { value: "sun", label: "Chủ nhật" },
  { value: "sat-sun", label: "Thứ 7 & Chủ nhật" },
  { value: "custom", label: "Ngày nghỉ khác" },
];

interface CommonFieldsProps {
  state: CalculatorState;
  dispatch: React.Dispatch<Action>;
  rule: DayRule;
  holidayDates: Date[];
  /** Sinh con: ngày kết thúc tự tính, ô kết thúc thành tùy chọn. */
  entitledEnd?: ISODate | null;
}

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
            aria-invalid={endError ? true : undefined}
            onValueChange={(end) => dispatch({ type: "set", patch: { end } })}
          />
        </Field>
      </div>

      {rule === "working" ? (
        <>
          <FieldSet
            id="weekly-rest"
            label="Lịch nghỉ hằng tuần của đơn vị"
          >
            {(labelId) => (
              <OptionSelect
                labelledBy={labelId}
                items={PRESETS}
                value={state.weeklyRestPreset}
                onValueChange={(preset) =>
                  dispatch({
                    type: "set",
                    patch:
                      preset === "custom"
                        ? { weeklyRestPreset: preset }
                        : { weeklyRestPreset: preset, weeklyRest: WEEKLY_REST_PRESETS[preset] },
                  })
                }
              />
            )}
          </FieldSet>
          {state.weeklyRestPreset === "custom" ? (
            <FieldSet id="weekly-rest-days" label="Chọn các thứ nghỉ">
              {(labelId) => (
                <WeekdayPicker
                  aria-labelledby={labelId}
                  value={state.weeklyRest}
                  onValueChange={(weeklyRest) => dispatch({ type: "set", patch: { weeklyRest } })}
                />
              )}
            </FieldSet>
          ) : null}
        </>
      ) : null}
    </>
  );
}
