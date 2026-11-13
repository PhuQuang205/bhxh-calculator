"use client";

import Image from "next/image";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import logo from "./logo-bhxh.png";
import type { Mode } from "./state";

const MODES: readonly { value: Mode; label: string }[] = [
  { value: "sickness", label: "Ốm đau" },
  { value: "maternity", label: "Thai sản" },
  { value: "recovery", label: "Dưỡng sức" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src={logo} alt="" width={40} height={40} priority className="size-10 shrink-0" />
      <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
        <span className="text-lg leading-6 font-semibold tracking-tight whitespace-nowrap">BHXH Nhanh</span>
        <span className="text-xs leading-4 text-muted-foreground sm:text-sm sm:leading-5">
          <span aria-hidden className="hidden sm:inline">- </span>Bản quyền Bảo hiểm xã hội cơ sở Cầu Giấy
        </span>
      </span>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Logo />
        <div className="flex gap-2 lg:hidden">{holidayButton}</div>
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
        {holidayButton}
      </div>
    </header>
  );
}
