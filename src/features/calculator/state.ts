import type { ISODate, WeeklyRest } from "@/lib/bhxh/types";
import type { MaternityInput, Mode, RecoveryInput, SicknessInput } from "@/lib/bhxh/inputs";

export type * from "@/lib/bhxh/inputs";

export interface CalculatorState {
  mode: Mode;
  fullName: string;
  start: ISODate | null;
  end: ISODate | null;
  weeklyRest: WeeklyRest;
  /** Ngày nghỉ tùy chỉnh của đơn vị (thêm) → tên. */
  customHolidays: Record<ISODate, string>;
  /** Ngày lễ có sẵn mà đơn vị không nghỉ (bỏ). */
  removedHolidays: ISODate[];
  sickness: SicknessInput;
  maternity: MaternityInput;
  recovery: RecoveryInput;
}

export const initialState: CalculatorState = {
  mode: "sickness",
  fullName: "",
  start: null,
  end: null,
  weeklyRest: [0],
  customHolidays: {},
  removedHolidays: [],
  sickness: {
    kind: "self",
    contribution: "lt15",
    heavyWork: false,
    halfDays: 0,
    leaveOverlap: 0,
    usedDays: 0,
    salary: null,
  },
  maternity: {
    kind: "birth",
    visitNo: 1,
    gestationWeeks: 8,
    babies: 1,
    wifeBirth: "normal",
    wifePreterm: false,
    avgSalary: null,
  },
  recovery: {
    after: "sickness",
    caseKind: "other",
    prevEnd: null,
  },
};

export type Action =
  | { type: "set"; patch: Partial<Omit<CalculatorState, "sickness" | "maternity" | "recovery">> }
  | { type: "sickness"; patch: Partial<SicknessInput> }
  | { type: "maternity"; patch: Partial<MaternityInput> }
  | { type: "recovery"; patch: Partial<RecoveryInput> }
  | { type: "reset" };

export function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case "set":
      return { ...state, ...action.patch };
    case "sickness":
      return { ...state, sickness: { ...state.sickness, ...action.patch } };
    case "maternity":
      return { ...state, maternity: { ...state.maternity, ...action.patch } };
    case "recovery":
      return { ...state, recovery: { ...state.recovery, ...action.patch } };
    case "reset":
      // Giữ cấu hình lịch nghỉ của đơn vị khi làm phiếu mới.
      return {
        ...initialState,
        mode: state.mode,
        weeklyRest: state.weeklyRest,
        customHolidays: state.customHolidays,
        removedHolidays: state.removedHolidays,
      };
  }
}
