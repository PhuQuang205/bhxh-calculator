import { CircleAlert, CircleCheck, Info, OctagonAlert } from "lucide-react";

import type { AlertLevel, CalcAlert } from "@/lib/bhxh/types";
import { cn } from "@/lib/utils";

const TONE: Record<AlertLevel, { box: string; Icon: typeof Info }> = {
  ok: { box: "border-status-approved-border bg-status-approved-bg text-status-approved-fg", Icon: CircleCheck },
  info: { box: "border-status-info-border bg-status-info-bg text-status-info-fg", Icon: Info },
  warning: { box: "border-status-pending-border bg-status-pending-bg text-status-pending-fg", Icon: CircleAlert },
  danger: { box: "border-status-danger-border bg-status-danger-bg text-status-danger-fg", Icon: OctagonAlert },
};

export function AlertList({ alerts }: { alerts: readonly CalcAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Kiểm tra điều kiện" className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const { box, Icon } = TONE[alert.level];
        return (
          <li key={alert.text} className={cn("flex gap-3 rounded-xl border p-4", box)}>
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm leading-5 font-medium">{alert.text}</span>
              {alert.citation ? <span className="text-xs leading-4 opacity-80">{alert.citation}</span> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
