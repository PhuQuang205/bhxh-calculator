import * as React from "react";

import { cn } from "@/lib/utils";

interface FieldSetProps {
  id: string;
  label: string;
  hint?: React.ReactNode;
  className?: string;
  /** Nhận id của nhãn để gắn `aria-labelledby` cho nhóm điều khiển. */
  children: (labelId: string) => React.ReactNode;
}

/** Nhóm điều khiển không phải ô nhập đơn (radio cards, stepper…): nhãn trên, gợi ý dưới, cùng nhịp với Field. */
export function FieldSet({ id, label, hint, className, children }: FieldSetProps) {
  const labelId = `${id}-label`;
  return (
    <div className={cn("flex flex-col", className)}>
      <span id={labelId} className="text-sm leading-5 font-medium text-foreground">
        {label}
      </span>
      <div className="mt-2">{children(labelId)}</div>
      <p className="min-h-6 pt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}
