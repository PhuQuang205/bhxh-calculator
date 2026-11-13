"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent text-base leading-6 font-semibold whitespace-nowrap select-none outline-hidden transition-[background-color,color,scale] duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:active:scale-100 aria-busy:pointer-events-none motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "border-border-subtle bg-card text-foreground hover:bg-muted",
        hero: "bg-card text-primary hover:bg-primary-tint focus-visible:outline-primary-foreground",
        destructive: "bg-destructive-strong text-primary-foreground hover:brightness-95",
        dangerOutline: "border-border-subtle bg-card text-destructive-strong hover:bg-muted",
      },
      size: {
        sm: "h-11 px-5",
        md: "h-12 px-6",
        lg: "h-14 px-6",
      },
      surface: {
        app: "",
        card: "",
      },
    },
    compoundVariants: [
      { variant: "secondary", surface: "card", className: "border-transparent bg-muted hover:bg-border-subtle" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      surface: "app",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    loadingLabel?: string;
  };

function Button({
  className,
  variant,
  size,
  surface,
  asChild = false,
  loading = false,
  loadingLabel,
  type = "button",
  children,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, surface }), className);

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} onClick={onClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type}
      data-slot="button"
      aria-busy={loading || undefined}
      className={classes}
      onClick={(event) => {
        // Đang tải: giữ nguyên màu (không disabled) nên phải tự chặn bấm lặp, kể cả bằng bàn phím.
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle aria-hidden className="animate-spin motion-reduce:animate-none" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
