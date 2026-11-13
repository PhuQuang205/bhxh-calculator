import * as React from "react";

import { cn } from "@/lib/utils";

type StatusTone = "pending" | "approved" | "danger" | "warning" | "info" | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  pending: "border-status-pending-border bg-status-pending-bg text-status-pending-fg",
  approved: "border-status-approved-border bg-status-approved-bg text-status-approved-fg",
  danger: "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
  warning: "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  info: "border-status-info-border bg-status-info-bg text-status-info-fg",
  neutral: "border-border-subtle bg-muted text-muted-foreground",
};

// Chữ theo tông: dùng cho badge trên nền xanh và trạng thái hiển thị dạng chữ (danh sách, chi tiết đơn).
const STATUS_TONE_TEXT_CLASS: Record<StatusTone, string> = {
  pending: "text-status-pending-fg",
  approved: "text-status-approved-fg",
  danger: "text-status-danger-fg",
  warning: "text-status-warning-fg",
  info: "text-status-info-fg",
  neutral: "text-muted-foreground",
};

type StatusBadgeProps = React.ComponentProps<"span"> & {
  tone: StatusTone;
  onPrimary?: boolean;
  icon?: React.ReactNode;
};

function StatusBadge({ tone, onPrimary = false, icon, className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0",
        onPrimary
          ? cn("h-8 bg-card px-3 text-sm leading-5", STATUS_TONE_TEXT_CLASS[tone])
          : cn("h-7 border px-3 text-xs leading-4", TONE_CLASS[tone]),
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

export { StatusBadge, STATUS_TONE_TEXT_CLASS };
export type { StatusTone };
