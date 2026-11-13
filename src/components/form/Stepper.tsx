"use client";

import * as React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDays } from "@/lib/format";

const HOLD_DELAY_MS = 400;
const HOLD_INTERVAL_MS = 100;
const HOLD_MOVE_TOLERANCE_PX = 8;

interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  itemName: string;
  min?: number;
  /** Bước tăng giảm, ví dụ 0.5 cho số ngày lẻ nửa ngày. */
  step?: number;
  max?: number;
  removeAtMin?: boolean;
  /** `sm`: nút hiển thị 36 nhưng vùng chạm vẫn 44 (phủ thêm 4px mỗi phía), ô số rộng để đọc số 7 chữ số. */
  size?: "md" | "sm";
  onRemove?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
  incrementRef?: React.Ref<HTMLButtonElement>;
  decrementRef?: React.Ref<HTMLButtonElement>;
  className?: string;
}

interface HoldState {
  pointerId: number;
  startX: number;
  startY: number;
  timer: number | null;
  repeated: boolean;
}

const stepButtonBase =
  "relative grid shrink-0 place-items-center rounded-full bg-card text-primary outline-hidden transition-[background-color,scale] duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:active:scale-100 motion-reduce:transition-none [&_svg]:size-5";
const stepButtonSize = {
  md: "size-11",
  sm: "size-9 after:absolute after:-inset-1 after:content-['']",
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function Stepper({
  value,
  onValueChange,
  itemName,
  min = 0,
  step = 1,
  max = Number.MAX_SAFE_INTEGER,
  removeAtMin = false,
  size = "md",
  onRemove,
  disabled = false,
  invalid = false,
  "aria-describedby": describedBy,
  incrementRef,
  decrementRef,
  className,
}: StepperProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const valueRef = React.useRef(value);
  const holdRef = React.useRef<HoldState | null>(null);
  const skipClickRef = React.useRef(false);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const clearHoldTimer = React.useCallback(() => {
    const hold = holdRef.current;
    if (hold?.timer == null) return;
    window.clearTimeout(hold.timer);
    window.clearInterval(hold.timer);
    hold.timer = null;
  }, []);

  React.useEffect(() => clearHoldTimer, [clearHoldTimer]);

  const applyStep = (delta: number): boolean => {
    const next = clamp(valueRef.current + delta, min, max);
    if (next === valueRef.current) return false;
    valueRef.current = next;
    onValueChange(next);
    return true;
  };

  const readDelta = (button: HTMLButtonElement) => Number(button.dataset.delta) * step;

  // Không bước ở pointerdown: chạm để cuộn danh sách cũng bắt đầu bằng pointerdown. Chỉ giữ yên đủ 400ms mới lặp.
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0 || event.currentTarget.dataset.delta === undefined) return;
    clearHoldTimer();
    skipClickRef.current = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delta = readDelta(event.currentTarget);
    const hold: HoldState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      timer: null,
      repeated: false,
    };
    hold.timer = window.setTimeout(() => {
      hold.repeated = true;
      if (!applyStep(delta)) {
        clearHoldTimer();
        return;
      }
      hold.timer = window.setInterval(() => {
        if (!applyStep(delta)) clearHoldTimer();
      }, HOLD_INTERVAL_MS);
    }, HOLD_DELAY_MS);
    holdRef.current = hold;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const hold = holdRef.current;
    if (!hold || hold.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - hold.startX, event.clientY - hold.startY);
    if (distance > HOLD_MOVE_TOLERANCE_PX) clearHoldTimer();
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const hold = holdRef.current;
    if (!hold || hold.pointerId !== event.pointerId) return;
    clearHoldTimer();
    // Đã lặp khi giữ thì click cuối lượt nhấn không được cộng thêm, kể cả khi kéo ra ngoài rồi quay lại thả.
    skipClickRef.current = skipClickRef.current || hold.repeated;
    holdRef.current = null;
  };

  const handleStepClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const fromKeyboard = event.detail === 0;
    if (skipClickRef.current && !fromKeyboard) {
      skipClickRef.current = false;
      return;
    }
    if (event.currentTarget.dataset.delta === undefined) {
      onRemove?.();
      return;
    }
    applyStep(readDelta(event.currentTarget));
  };

  const commitDraft = () => {
    if (draft === null) return;
    const parsed = Math.round(Number.parseFloat(draft.replace(",", ".")) / step) * step;
    const next = Number.isNaN(parsed) ? min : clamp(parsed, min, max);
    setDraft(null);
    if (next !== value) onValueChange(next);
  };

  const stepButtonClass = cn(stepButtonBase, stepButtonSize[size]);
  const isAtMin = value <= min;
  const isAtMax = value >= max;
  const showRemove = removeAtMin && isAtMin;

  return (
    <div
      role="group"
      aria-label={itemName}
      className={cn(
        size === "sm" ? "h-10" : "h-12",
        "inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-100 motion-reduce:transition-none",
        // Chỉ tô khi ô số đang focus: chạm nút −/+ trên iOS cũng làm focus-within bật.
        invalid ? "bg-status-danger-bg" : "bg-muted has-[input:focus]:bg-primary-tint",
        disabled && "text-muted-foreground",
        className,
      )}
    >
      <button
        ref={decrementRef}
        type="button"
        data-delta={showRemove ? undefined : -1}
        aria-label={showRemove ? `Xóa ${itemName}` : `Giảm ${itemName}`}
        disabled={disabled || (isAtMin && !showRemove)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleStepClick}
        className={cn(stepButtonClass, showRemove && "text-destructive-strong")}
      >
        {showRemove ? <Trash2 aria-hidden /> : <Minus aria-hidden />}
      </button>
      <input
        inputMode={step < 1 ? "decimal" : "numeric"}
        aria-label={itemName}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        value={draft ?? formatDays(value)}
        onFocus={(event) => {
          setDraft(formatDays(value));
          const input = event.currentTarget;
          window.requestAnimationFrame(() => input.select());
        }}
        onChange={(event) => setDraft(event.target.value.replace(/[^\d,.]/g, ""))}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className={cn(
          size === "sm" ? "w-24" : "w-16",
          "min-w-0 bg-transparent text-center text-base leading-6 font-semibold text-foreground tabular-nums caret-primary outline-none disabled:text-muted-foreground",
        )}
      />
      <button
        ref={incrementRef}
        type="button"
        data-delta={1}
        aria-label={`Tăng ${itemName}`}
        disabled={disabled || isAtMax}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleStepClick}
        className={stepButtonClass}
      >
        <Plus aria-hidden />
      </button>
    </div>
  );
}
