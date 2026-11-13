import * as React from "react";

import { cn } from "@/lib/utils";

/** Nhóm field có số thứ tự và tiêu đề nhỏ, tách bằng đường mảnh. */
export function FormSection({
  step,
  title,
  children,
  className,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2 border-t border-border-subtle pt-5 first:border-t-0 first:pt-0", className)}>
      <h2 className="mb-2 flex items-center gap-2 text-xs leading-4 font-semibold tracking-wide text-muted-foreground uppercase">
        <span className="grid size-6 place-items-center rounded-full bg-primary-tint text-primary tabular-nums">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
