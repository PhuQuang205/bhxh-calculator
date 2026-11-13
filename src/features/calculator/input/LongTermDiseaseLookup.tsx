"use client";

import * as React from "react";

import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";
import { searchLongTermDiseases } from "@/lib/bhxh/longTermDiseases";

import { LongTermDiseaseSheet } from "./LongTermDiseaseSheet";

/** Tra cứu Phụ lục I – Danh mục bệnh cần chữa trị dài ngày. Chỉ để đối chiếu, không ảnh hưởng kết quả tính. */
export function LongTermDiseaseLookup() {
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => searchLongTermDiseases(query, 8), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="mb-4 flex flex-col">
      <Field label="Tra cứu danh mục bệnh dài ngày" htmlFor="long-term-search">
        <Input
          id="long-term-search"
          type="search"
          size="lg"
          autoComplete="off"
          placeholder="Nhập tên bệnh hoặc mã ICD-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Field>
      <div aria-live="polite" className="-mt-1">
        {!hasQuery ? (
          <p className="text-xs leading-5 text-muted-foreground">
            <LongTermDiseaseSheet trigger="link" />
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm leading-5 text-muted-foreground">
            Không có trong danh mục.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((disease) => (
              <li key={disease.no} className="flex items-start justify-between gap-3 rounded-lg bg-primary-tint px-4 py-3">
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm leading-5 font-medium">{disease.name}</span>
                  <span className="text-xs leading-4 text-muted-foreground">
                    STT {disease.no} · {disease.group}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs leading-4 font-semibold text-primary tabular-nums">
                  {disease.codes}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
