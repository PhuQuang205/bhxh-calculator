"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ListChecks, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  LONG_TERM_DISEASES,
  LONG_TERM_DISEASE_COUNT,
  LONG_TERM_DISEASE_SOURCE,
  LONG_TERM_GROUPS,
  searchLongTermDiseases,
} from "@/lib/bhxh/longTermDiseases";

const TRIGGER_CLASS = {
  pill: "relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full whitespace-nowrap bg-card px-4 text-sm leading-5 font-medium shadow-soft outline-hidden transition-colors duration-100 hover:bg-primary-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring motion-reduce:transition-none",
  link: "cursor-pointer font-semibold text-primary underline underline-offset-2 outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
};

/** Sheet trượt từ phải: toàn bộ Phụ lục I theo nhóm chuyên khoa, lọc theo tên hoặc mã ICD-10. */
export function LongTermDiseaseSheet({ trigger = "pill" }: { trigger?: keyof typeof TRIGGER_CLASS }) {
  const [query, setQuery] = React.useState("");
  const list = React.useMemo(() => (query.trim() ? searchLongTermDiseases(query) : LONG_TERM_DISEASES), [query]);
  const groups = LONG_TERM_GROUPS.map((group) => ({ group, items: list.filter((d) => d.group === group) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger className={TRIGGER_CLASS[trigger]}>
        {trigger === "pill" ? (
          <>
            <ListChecks aria-hidden className="size-4 text-primary" />
            <span className="sm:hidden">Bệnh dài ngày</span>
            <span className="hidden sm:inline">Danh mục bệnh dài ngày</span>
          </>
        ) : (
          "Xem toàn bộ danh mục"
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-card shadow-soft outline-hidden transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full sm:w-[720px] sm:rounded-l-2xl motion-reduce:transition-none">
          <div className="flex flex-col gap-4 p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Dialog.Title className="text-lg leading-6 font-semibold">Danh mục bệnh cần chữa trị dài ngày</Dialog.Title>
                <Dialog.Description className="text-sm leading-5 text-muted-foreground">
                  {LONG_TERM_DISEASE_COUNT} bệnh, {LONG_TERM_DISEASE_SOURCE}. Mã 3 ký tự bao gồm cả các mã con.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Đóng"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-muted outline-hidden hover:bg-border-subtle focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
              >
                <X aria-hidden className="size-5" />
              </Dialog.Close>
            </div>
            <Input
              type="search"
              size="lg"
              autoComplete="off"
              aria-label="Lọc theo tên bệnh hoặc mã ICD-10"
              placeholder="Nhập tên bệnh hoặc mã ICD-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div aria-live="polite" className="flex-1 overflow-y-auto px-6 pb-6">
            {groups.length === 0 ? (
              <p className="rounded-lg bg-muted px-4 py-3 text-sm leading-5 text-muted-foreground">
                Không thấy trong danh mục. Thử tìm theo mã ICD-10 ghi trên giấy ra viện hoặc giấy nghỉ ốm.
              </p>
            ) : (
              groups.map(({ group, items }) => (
                <section key={group} className="mb-5">
                  <h3 className="sticky top-0 z-10 bg-card py-2 text-xs leading-4 font-semibold tracking-wide text-primary uppercase">
                    {group} <span className="text-muted-foreground">· {items.length}</span>
                  </h3>
                  <table className="w-full text-sm leading-5">
                    <tbody>
                      {items.map((disease) => (
                        <tr key={disease.no} className="border-b border-border-subtle align-top last:border-0">
                          <td className="w-12 py-2.5 pr-2 text-muted-foreground tabular-nums">{disease.no}</td>
                          <td className="py-2.5 pr-3">{disease.name}</td>
                          <td className="py-2.5 text-right font-medium whitespace-nowrap text-primary tabular-nums">{disease.codes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
