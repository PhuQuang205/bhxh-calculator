"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<"div"> & {
  asChild?: boolean;
  interactive?: boolean;
};

const interactiveClass =
  "block min-h-11 outline-hidden transition-[background-color,scale] duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

function Card({ asChild = false, interactive = false, className, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn("rounded-xl bg-card p-4 text-foreground shadow-soft", interactive && interactiveClass, className)}
      {...props}
    />
  );
}

export { Card };
