"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const MUTATION_OPTIONS: MutationObserverInit = {
  attributes: true,
  attributeFilter: ["data-state"],
  childList: true,
  characterData: true,
  subtree: true,
};

type TabsListVariant = "chips" | "segmented";

interface IndicatorRect {
  x: number;
  width: number;
  animate: boolean;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col", className)} {...props} />;
}

/**
 * Hàng nút rời (U-D-28, U-D-29): nút rộng theo chữ có đệm thoáng, thiếu chỗ thì vuốt ngang. Nút chưa chọn nền trắng viền mảnh,
 * nút đang chọn nền xanh — lớp xanh trượt sang nút mới (như pill BottomNav), nằm trên nền trắng của các nút nhưng dưới chữ;
 * tắt chuyển động khi `prefers-reduced-motion`. Khối cao 44 (nút 36 + đệm dọc) để vùng chạm không bị cắt bởi vùng cuộn.
 * `variant="segmented"`: các tab nằm chung một khối nền trắng, chia đều bề ngang, bo góc vừa.
 */
function TabsList({
  variant = "chips",
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: TabsListVariant }) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const activeIdRef = React.useRef<string | null>(null);
  const [indicator, setIndicator] = React.useState<IndicatorRect | null>(null);

  const measure = React.useCallback(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) {
      setIndicator(null);
      return;
    }
    const x = active.offsetLeft;
    const width = active.offsetWidth;
    // Chỉ cuộn NGANG chính hàng tab (không dùng scrollIntoView vì nó cuộn cả trang), và chỉ khi đổi nút đang chọn.
    const list = listRef.current;
    if (list && activeIdRef.current !== active.id) {
      const isFirstMeasure = activeIdRef.current === null;
      activeIdRef.current = active.id;
      const style = window.getComputedStyle(list);
      const padStart = Number.parseFloat(style.scrollPaddingLeft) || 0;
      const padEnd = Number.parseFloat(style.scrollPaddingRight) || 0;
      const minLeft = x + width + padEnd - list.clientWidth;
      const maxLeft = x - padStart;
      const target = list.scrollLeft > maxLeft ? maxLeft : list.scrollLeft < minLeft ? minLeft : null;
      if (target !== null) {
        list.scrollTo({ left: target, behavior: isFirstMeasure || prefersReducedMotion() ? "auto" : "smooth" });
      }
    }
    setIndicator((previous) =>
      previous && previous.x === x && previous.width === width ? previous : { x, width, animate: previous !== null },
    );
  }, []);

  // Observer tạo một lần: đổi tab và đổi nội dung tab đều đi qua MutationObserver, đổi bề rộng khối qua ResizeObserver.
  React.useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return;
    const mutations = new MutationObserver(measure);
    mutations.observe(list, MUTATION_OPTIONS);
    // Theo dõi cả từng nút: bề rộng nút đổi khi font web tải xong mà khối thì không đổi.
    const resizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizes?.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => resizes?.observe(tab));
    void document.fonts?.ready.then(measure);
    return () => {
      mutations.disconnect();
      resizes?.disconnect();
    };
  }, [measure]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-indicator={indicator ? "on" : "off"}
      data-variant={variant}
      className={cn(
        "group/tabs scrollbar-none relative isolate flex h-11 w-full snap-x items-center gap-2 overflow-x-auto py-1",
        variant === "segmented" && "gap-1 rounded-lg bg-card p-1 shadow-soft",
        className,
      )}
      {...props}
    >
      {indicator ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1 left-0 -z-10 h-9 bg-primary",
            variant === "segmented" ? "rounded-md" : "rounded-full",
            indicator.animate && "transition-[transform,width] duration-260 ease-out motion-reduce:transition-none",
          )}
          style={{ width: indicator.width, transform: `translateX(${indicator.x}px)` }}
        />
      ) : null}
      {children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-9 shrink-0 snap-start items-center justify-center gap-1 rounded-full px-4 text-center text-sm leading-5 font-semibold whitespace-nowrap text-muted-foreground outline-hidden transition-colors duration-200 select-none",
        // Nền trắng của nút vẽ ở ::before (z âm trong stacking của list) để lớp xanh trượt lên trên nền nhưng dưới chữ.
        "before:absolute before:inset-0 before:-z-20 before:rounded-full before:border before:border-border-subtle before:bg-card before:content-['']",
        // Vùng chạm 44px (nút cao 36).
        "after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
        // Nút đang chọn tự tô xanh ngay (chữ trắng không bao giờ nằm trên nền trắng); lớp xanh trượt chỉ là hiệu ứng chuyển.
        "hover:text-foreground data-[state=active]:text-primary-foreground data-[state=active]:transition-none data-[state=active]:hover:text-primary-foreground",
        "data-[state=active]:before:border-transparent data-[state=active]:before:bg-primary",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
        // Khối cha đã có nền trắng: tab chưa chọn trong suốt, không viền.
        "group-data-[variant=segmented]/tabs:flex-1 group-data-[variant=segmented]/tabs:rounded-md group-data-[variant=segmented]/tabs:before:rounded-md group-data-[variant=segmented]/tabs:before:border-0 group-data-[variant=segmented]/tabs:data-[state=inactive]:before:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
