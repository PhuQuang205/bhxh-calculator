"use client";

import { DateField } from "@/components/form/DateField";
import { Field } from "@/components/form/Field";
import { FieldSet } from "@/components/form/FieldSet";
import { RadioCards } from "@/components/ui/radio-cards";
import { formatMoney } from "@/lib/format";
import { RECOVERY_CASE_LABEL, recoveryCap } from "@/lib/bhxh/recovery";
import { RECOVERY, referenceLevelAt } from "@/lib/bhxh/rules";
import type { RecoveryAfter, RecoveryCase, RecoveryInput } from "@/lib/bhxh/inputs";

import type { Action } from "../state";

const AFTER: { value: RecoveryAfter; label: string }[] = [
  { value: "sickness", label: "Sau ốm đau" },
  { value: "maternity", label: "Sau thai sản" },
];

export function RecoveryAfterField({ value, dispatch }: { value: RecoveryAfter; dispatch: React.Dispatch<Action> }) {
  return (
    <FieldSet id="recovery-after" label="Loại dưỡng sức">
      {(labelId) => (
        <RadioCards
          aria-labelledby={labelId}
          options={AFTER}
          value={value}
          onValueChange={(after) => dispatch({ type: "recovery", patch: { after, caseKind: "other" } })}
        />
      )}
    </FieldSet>
  );
}

export function RecoveryFields({ input, dispatch, start }: { input: RecoveryInput; dispatch: React.Dispatch<Action>; start: string | null }) {
  const set = (patch: Partial<RecoveryInput>) => dispatch({ type: "recovery", patch });
  const labels: Record<string, string> = RECOVERY_CASE_LABEL[input.after];
  const caps: Record<string, number> = input.after === "sickness" ? RECOVERY.afterSickness : RECOVERY.afterMaternity;
  const options = Object.keys(labels).map((value) => ({
    value: value as RecoveryCase,
    label: labels[value],
    description: `Tối đa ${caps[value]} ngày`,
  }));
  const daily = referenceLevelAt(start ?? "9999-12-31").amount * RECOVERY.rate;
  return (
    <>
      <FieldSet id="recovery-case" label="Chi tiết trường hợp" hint={`Mức hưởng ${formatMoney(daily)}/ngày · tối đa ${recoveryCap(input)} ngày`}>
        {(labelId) => (
          <RadioCards aria-labelledby={labelId} columns={1} options={options} value={input.caseKind} onValueChange={(caseKind) => set({ caseKind })} />
        )}
      </FieldSet>
      <Field label="Ngày kết thúc đợt nghỉ hưởng chế độ trước đó" htmlFor="prev-end">
        <DateField id="prev-end" value={input.prevEnd} onValueChange={(prevEnd) => set({ prevEnd })} />
      </Field>
    </>
  );
}
