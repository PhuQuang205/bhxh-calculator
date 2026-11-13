"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { format, isValid, parse, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { DayPicker, type Matcher } from "react-day-picker";
import { vi } from "react-day-picker/locale";

import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

const DISPLAY_FORMAT = "dd/MM/yyyy";
const ISO_FORMAT = "yyyy-MM-dd";

type DateFieldProps = Omit<InputProps, "value" | "onChange" | "type" | "size"> & {
  /** Ngày dạng ISO `yyyy-MM-dd`, hoặc null khi chưa nhập/không hợp lệ. */
  value: string | null;
  onValueChange: (value: string | null) => void;
  /** Đánh dấu thêm trên lịch, ví dụ ngày lễ. */
  highlighted?: Matcher | Matcher[];
};

function isoToDisplay(iso: string | null): string {
  if (!iso) return "";
  const date = parseISO(iso);
  return isValid(date) ? format(date, DISPLAY_FORMAT) : "";
}

/** Chỉ giữ chữ số và tự chèn "/" sau ngày và tháng: "01052026" → "01/05/2026". */
function maskDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("/");
}

function displayToIso(display: string): string | null {
  if (display.length !== DISPLAY_FORMAT.length) return null;
  const date = parse(display, DISPLAY_FORMAT, new Date());
  if (!isValid(date) || date.getFullYear() < 1900) return null;
  return format(date, ISO_FORMAT);
}

/** Ô ngày gõ được `dd/mm/yyyy` (tự chèn dấu "/") và có nút mở lịch. */
export function DateField({ value, onValueChange, highlighted, className, id, placeholder, ...props }: DateFieldProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const selected = value ? parseISO(value) : undefined;

  const commit = (text: string) => {
    const iso = displayToIso(text);
    if (iso !== value) onValueChange(iso);
  };

  return (
    <>
      <Input
        {...props}
        placeholder={placeholder ?? "dd/mm/yyyy"}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        size="lg"
        value={draft ?? isoToDisplay(value)}
        onFocus={() => setDraft(isoToDisplay(value))}
        onChange={(event) => {
          const next = maskDigits(event.target.value);
          setDraft(next);
          // Đủ 8 số là tính luôn để kết quả cập nhật trực tiếp, không cần rời ô.
          if (next.length === DISPLAY_FORMAT.length || next === "") commit(next);
        }}
        onBlur={(event) => {
          commit(event.target.value);
          setDraft(null);
        }}
        className={cn("pr-14 tabular-nums", className)}
      />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-label="Mở lịch chọn ngày"
          className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground outline-hidden transition-colors duration-100 hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring data-popup-open:bg-card data-popup-open:text-primary motion-reduce:transition-none"
        >
          <CalendarDays aria-hidden className="size-5" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="end" sideOffset={8} className="isolate z-50">
            <Popover.Popup className="rounded-xl bg-popover p-3 text-popover-foreground shadow-soft ring-1 ring-border-subtle outline-hidden">
              <DayPicker
                mode="single"
                locale={vi}
                weekStartsOn={1}
                captionLayout="dropdown"
                startMonth={new Date(2020, 0)}
                endMonth={new Date(2030, 11)}
                selected={selected}
                defaultMonth={selected}
                modifiers={highlighted ? { holiday: highlighted } : undefined}
                modifiersClassNames={{ holiday: "rdp-holiday" }}
                onSelect={(date) => {
                  onValueChange(date ? format(date, ISO_FORMAT) : null);
                  setDraft(null);
                  setOpen(false);
                }}
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
