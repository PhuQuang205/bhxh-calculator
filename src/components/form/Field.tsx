import * as React from "react";

import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  counter?: React.ReactNode;
  hideLabel?: boolean;
  className?: string;
  children: React.ReactElement<{ "aria-describedby"?: string }>;
}

export function getFieldErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

export function getFieldLabelId(fieldId: string): string {
  return `${fieldId}-label`;
}

/** Khối field cố định: nhãn 20 + 8 + ô + khe lỗi 24 luôn render, để lỗi hiện/ẩn không đẩy field khác. */
export function Field({ label, htmlFor, error, counter, hideLabel = false, className, children }: FieldProps) {
  const errorId = getFieldErrorId(htmlFor);
  const ownDescribedBy = children.props["aria-describedby"];
  const describedBy = ownDescribedBy?.split(" ").includes(errorId) ? ownDescribedBy : [ownDescribedBy, errorId].filter(Boolean).join(" ");
  const control = React.cloneElement(children, { "aria-describedby": describedBy });

  return (
    <div data-slot="field" className={cn("flex flex-col", className)}>
      <label
        id={getFieldLabelId(htmlFor)}
        htmlFor={htmlFor}
        className={hideLabel ? "sr-only" : "block text-sm leading-5 font-medium text-foreground"}
      >
        {label}
      </label>
      <div className={cn("relative", !hideLabel && "mt-2")}>{control}</div>
      <div className="flex min-h-6 items-start justify-between gap-3 pt-1">
        <p id={errorId} aria-live="polite" className="min-w-0 text-sm leading-5 text-destructive-strong">
          {error}
        </p>
        {counter ? <span className="shrink-0 text-xs leading-5 text-muted-foreground tabular-nums">{counter}</span> : null}
      </div>
    </div>
  );
}
