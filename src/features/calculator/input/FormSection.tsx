import * as React from "react";

import { cn } from "@/lib/utils";

/** Nhóm field có số thứ tự và tiêu đề nhỏ, tách bằng đường mảnh. */
export function FormSection({
  step,
  title,
  action,
  children,
  className,
}: {
  step: number;
  title: string;
  /** Nút phụ bên phải tiêu đề, ví dụ "Làm mới". */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2 border-t border-border-subtle pt-5 first:border-t-0 first:pt-0", className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs leading-4 font-semibold tracking-wide text-muted-foreground uppercase">
          <span className="grid size-6 place-items-center rounded-full bg-primary-tint text-primary tabular-nums">{step}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
