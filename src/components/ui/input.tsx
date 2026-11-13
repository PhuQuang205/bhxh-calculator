import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// text-base: iOS Safari tự phóng to khi chạm ô có chữ dưới 16px.
const textControlClass =
  "w-full min-w-0 appearance-none rounded-lg border-0 bg-muted text-base leading-6 text-foreground caret-primary ring-0 outline-none transition-colors duration-100 placeholder:text-muted-foreground focus:bg-primary-tint focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground aria-invalid:bg-status-danger-bg aria-invalid:focus:bg-status-danger-bg motion-reduce:transition-none";

const inputVariants = cva(cn(textControlClass, "px-4"), {
  variants: {
    size: {
      md: "h-12",
      lg: "h-14",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type InputProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

function Input({ className, size, ...props }: InputProps) {
  return <input data-slot="input" className={cn(inputVariants({ size }), className)} {...props} />;
}

export { Input, inputVariants, textControlClass };
export type { InputProps };
