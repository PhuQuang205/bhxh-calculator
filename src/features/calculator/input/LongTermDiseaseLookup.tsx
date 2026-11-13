"use client";

import * as React from "react";

import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";
import { LONG_TERM_DISEASE_COUNT, LONG_TERM_DISEASE_SOURCE, searchLongTermDiseases } from "@/lib/bhxh/longTermDiseases";

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
          placeholder="Nhập tên bệnh hoặc mã ICD-10, ví dụ I63"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Field>
      <div aria-live="polite" className="-mt-1">
        {!hasQuery ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {LONG_TERM_DISEASE_COUNT} bệnh theo {LONG_TERM_DISEASE_SOURCE}. Mã 3 ký tự (ví dụ D16) bao gồm cả các mã con (D16.0 … D16.9).{" "}
            <LongTermDiseaseSheet trigger="link" />
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm leading-5 text-muted-foreground">
            Không thấy trong danh mục. Thử tìm theo mã ICD-10 ghi trên giấy ra viện hoặc giấy nghỉ ốm.
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
