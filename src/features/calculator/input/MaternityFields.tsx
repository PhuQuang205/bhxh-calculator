"use client";

import { DateField } from "@/components/form/DateField";
import { Field } from "@/components/form/Field";
import { FieldSet } from "@/components/form/FieldSet";
import { Stepper } from "@/components/form/Stepper";
import { RadioCards } from "@/components/ui/radio-cards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SwitchField } from "@/components/ui/switch";
import { MATERNITY_KIND_LABEL, birthMonths, effectiveBirthDate, miscarriageTier, paternityDays } from "@/lib/bhxh/maternity";
import { MATERNITY } from "@/lib/bhxh/rules";
import type { MaternityInput, MaternityKind, WifeBirthKind } from "@/lib/bhxh/inputs";

import type { Action } from "../state";

const KINDS = (Object.keys(MATERNITY_KIND_LABEL) as MaternityKind[]).map((value) => ({
  value,
  label: MATERNITY_KIND_LABEL[value],
}));

const WIFE_BIRTH: { value: WifeBirthKind; label: string }[] = [
  { value: "normal", label: "Sinh thường" },
  { value: "caesarean", label: "Sinh mổ" },
  { value: "twins", label: "Sinh đôi trở lên" },
  { value: "twinsCaesarean", label: "Sinh đôi trở lên, phải mổ" },
];

export function MaternityKindField({ value, dispatch }: { value: MaternityKind; dispatch: React.Dispatch<Action> }) {
  return (
    <FieldSet id="maternity-kind" label="Trường hợp">
      {(labelId) => (
        <Select
          items={KINDS}
          value={value}
          onValueChange={(kind) => {
            if (kind) dispatch({ type: "maternity", patch: { kind: kind as MaternityKind } });
          }}
        >
          <SelectTrigger
            aria-labelledby={labelId}
            className="h-14 w-full rounded-lg border-0 bg-muted pr-3 pl-4 text-base lg:h-14"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {KINDS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldSet>
  );
}

interface MaternityFieldsProps {
  input: MaternityInput;
  dispatch: React.Dispatch<Action>;
  start: string | null;
}

/** Sinh con thứ hai + ngày sinh: dùng chung cho "Sinh con" và "Nam nghỉ khi vợ sinh". */
function SecondChildFields({ input, set, father }: { input: MaternityInput; set: (patch: Partial<MaternityInput>) => void; father: boolean }) {
  return (
    <>
      <SwitchField
        id="second-child"
        label={father ? "Vợ sinh con thứ hai" : "Sinh con thứ hai"}
        description={`${father ? "Vợ đang" : "Đang"} có một con đẻ còn sống, sinh từ 01/07/2026`}
        checked={input.secondChild}
        onCheckedChange={(secondChild) => set({ secondChild })}
        className="mb-6"
      />
      <Field label={father ? "Ngày vợ sinh con (tùy chọn)" : "Ngày sinh con (tùy chọn)"} htmlFor="birth-date">
        <DateField id="birth-date" value={input.birthDate} onValueChange={(birthDate) => set({ birthDate })} />
      </Field>
    </>
  );
}

export function MaternityFields({ input, dispatch, start }: MaternityFieldsProps) {
  const set = (patch: Partial<MaternityInput>) => dispatch({ type: "maternity", patch });
  const birthDate = effectiveBirthDate(input, start ?? "9999-12-31");
  const twins = input.wifeBirth === "twins" || input.wifeBirth === "twinsCaesarean";
  return (
    <>
      {input.kind === "prenatal" ? (
        <FieldSet
          id="visit-no"
          label="Lần khám thai thứ"
          hint={`Tối đa ${MATERNITY.prenatal.maxVisits} lần, mỗi lần không quá ${MATERNITY.prenatal.maxDaysPerVisit} ngày làm việc`}
        >
          {(labelId) => (
            <Stepper itemName="Lần khám thai" min={1} max={9} value={input.visitNo} onValueChange={(visitNo) => set({ visitNo })} aria-describedby={labelId} />
          )}
        </FieldSet>
      ) : null}

      {input.kind === "miscarriage" ? (
        <FieldSet
          id="gestation"
          label="Tuổi thai (tuần)"
          hint={`${miscarriageTier(input.gestationWeeks).label}: tối đa ${miscarriageTier(input.gestationWeeks).days} ngày`}
        >
          {(labelId) => (
            <Stepper itemName="Tuổi thai" min={1} max={42} value={input.gestationWeeks} onValueChange={(gestationWeeks) => set({ gestationWeeks })} aria-describedby={labelId} />
          )}
        </FieldSet>
      ) : null}

      {input.kind === "birth" ? (
        <>
          <SecondChildFields input={input} set={set} father={false} />
          <FieldSet id="babies" label="Số con trong lần sinh" hint={`Được nghỉ ${birthMonths(input, birthDate)} tháng liên tục`}>
            {(labelId) => (
              <Stepper itemName="Số con" min={1} max={6} value={input.babies} onValueChange={(babies) => set({ babies })} aria-describedby={labelId} />
            )}
          </FieldSet>
        </>
      ) : null}

      {input.kind === "paternity" ? (
        <>
          <FieldSet id="wife-birth" label="Hình thức vợ sinh" hint={`Được nghỉ ${paternityDays(input, birthDate)} ngày làm việc`}>
            {(labelId) => (
              <RadioCards aria-labelledby={labelId} options={WIFE_BIRTH} value={input.wifeBirth} onValueChange={(wifeBirth) => set({ wifeBirth })} />
            )}
          </FieldSet>
          {twins ? (
            <FieldSet id="paternity-babies" label="Số con vợ sinh" hint="Sinh ba trở lên: từ con thứ ba mỗi con thêm 3 ngày làm việc">
              {(labelId) => (
                <Stepper itemName="Số con" min={2} max={6} value={Math.max(2, input.babies)} onValueChange={(babies) => set({ babies })} aria-describedby={labelId} />
              )}
            </FieldSet>
          ) : null}
          <SecondChildFields input={input} set={set} father />
          {input.wifeBirth === "normal" ? (
            <SwitchField
              id="wife-preterm"
              label="Vợ sinh con dưới 32 tuần tuổi"
              checked={input.wifePreterm}
              onCheckedChange={(wifePreterm) => set({ wifePreterm })}
              className="mb-6"
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
