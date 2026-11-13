"use client";

import { FieldSet } from "@/components/form/FieldSet";
import { OptionSelect } from "@/components/form/OptionSelect";
import { Stepper } from "@/components/form/Stepper";
import { SwitchField } from "@/components/ui/switch";
import { CONTRIBUTION_LABEL, type ContributionTier } from "@/lib/bhxh/rules";
import { SICKNESS_KIND_LABEL } from "@/lib/bhxh/sickness";
import type { SicknessInput, SicknessKind } from "@/lib/bhxh/inputs";

import type { Action } from "../state";

import { LongTermDiseaseLookup } from "./LongTermDiseaseLookup";

const KINDS: { value: SicknessKind; label: string }[] = [
  { value: "self", label: SICKNESS_KIND_LABEL.self },
  { value: "child", label: SICKNESS_KIND_LABEL.child },
  { value: "longterm", label: "Bệnh dài ngày" },
];

const TIERS = (Object.keys(CONTRIBUTION_LABEL) as ContributionTier[]).map((value) => ({
  value,
  label: CONTRIBUTION_LABEL[value],
}));

export function SicknessKindField({ value, dispatch }: { value: SicknessKind; dispatch: React.Dispatch<Action> }) {
  return (
    <FieldSet id="sickness-kind" label="Phân loại">
      {(labelId) => (
        <OptionSelect
          labelledBy={labelId}
          items={KINDS}
          value={value}
          onValueChange={(kind) => dispatch({ type: "sickness", patch: { kind } })}
        />
      )}
    </FieldSet>
  );
}

export function SicknessFields({ input, dispatch }: { input: SicknessInput; dispatch: React.Dispatch<Action> }) {
  const set = (patch: Partial<SicknessInput>) => dispatch({ type: "sickness", patch });
  return (
    <>
      {input.kind === "longterm" ? <LongTermDiseaseLookup /> : null}
      <FieldSet id="contribution" label="Thời gian đã đóng BHXH">
        {(labelId) => (
          <OptionSelect
            labelledBy={labelId}
            items={TIERS}
            value={input.contribution}
            onValueChange={(contribution) => set({ contribution })}
          />
        )}
      </FieldSet>

      <SwitchField
        id="heavy-work"
        label="Nghề, công việc nặng nhọc, độc hại"
        checked={input.heavyWork}
        onCheckedChange={(heavyWork) => set({ heavyWork })}
        className="mb-6"
      />

      <div className="grid gap-x-3 sm:grid-cols-3">
        <FieldSet id="half-days" label="Ngày nghỉ lẻ" hint="Dưới nửa ngày tính 0,5">
          {(labelId) => (
            <Stepper itemName="Số ngày nghỉ dưới nửa ngày" value={input.halfDays} onValueChange={(halfDays) => set({ halfDays })} aria-describedby={labelId} className="w-full justify-between" />
          )}
        </FieldSet>
        <FieldSet id="leave-overlap" label="Trùng phép" hint="Phép, việc riêng, không lương">
          {(labelId) => (
            <Stepper itemName="Số ngày trùng nghỉ phép" value={input.leaveOverlap} onValueChange={(leaveOverlap) => set({ leaveOverlap })} aria-describedby={labelId} className="w-full justify-between" />
          )}
        </FieldSet>
        <FieldSet id="used-days" label="Đã nghỉ trong năm" hint="Ngày đã hưởng trước đợt này">
          {(labelId) => (
            <Stepper itemName="Số ngày đã nghỉ trong năm" step={0.5} value={input.usedDays} onValueChange={(usedDays) => set({ usedDays })} aria-describedby={labelId} className="w-full justify-between" />
          )}
        </FieldSet>
      </div>

    </>
  );
}
