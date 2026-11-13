"use client";

import { Scale } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Mode } from "./state";

const MODES: readonly { value: Mode; label: string }[] = [
  { value: "sickness", label: "Ốm đau" },
  { value: "maternity", label: "Thai sản" },
  { value: "recovery", label: "Dưỡng sức" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg aria-hidden viewBox="0 0 32 32" className="size-8 text-primary">
        <circle cx="16" cy="16" r="5" fill="currentColor" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x="15"
            y="2"
            width="2"
            height="7"
            rx="1"
            fill="currentColor"
            transform={`rotate(${i * 30} 16 16)`}
          />
        ))}
      </svg>
      <span className="text-lg leading-6 font-semibold tracking-tight">BHXH Nhanh</span>
    </div>
  );
}

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  holidayButton: React.ReactNode;
}

export function Header({ mode, onModeChange, holidayButton }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div className="flex items-center justify-between gap-3">
        <Logo />
        <div className="lg:hidden">{holidayButton}</div>
      </div>

      <Tabs value={mode} onValueChange={(value) => onModeChange(value as Mode)}>
        <TabsList
          aria-label="Chọn chế độ"
          variant="segmented"
          className="h-14 rounded-full p-1.5 [&>span]:top-1.5 [&>span]:h-11 [&>span]:rounded-full lg:w-auto"
        >
          {MODES.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="h-11 rounded-full px-6 text-sm lg:flex-none group-data-[variant=segmented]/tabs:rounded-full group-data-[variant=segmented]/tabs:before:rounded-full"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="hidden items-center justify-end gap-2 lg:flex">
        <span className="inline-flex h-11 items-center gap-2 rounded-full bg-card px-4 text-sm leading-5 font-medium shadow-soft">
          <Scale aria-hidden className="size-4 text-primary" />
          Luật BHXH 41/2024/QH15
        </span>
        {holidayButton}
      </div>
    </header>
  );
}
