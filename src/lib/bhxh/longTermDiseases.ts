import { LONG_TERM_DISEASE_ROWS, LONG_TERM_GROUPS } from "./longTermDiseases.data";

export interface LongTermDisease {
  no: number;
  group: string;
  name: string;
  /** Mã ICD-10 nguyên văn trong danh mục. */
  codes: string;
}

/** Một mục mã: mã đơn (bao luôn mã con) hoặc khoảng "Từ X đến Y". Lưu dạng bỏ dấu chấm, ví dụ "A061". */
type CodeSpan = { from: string; to: string };

const normalizeCode = (code: string) => code.toUpperCase().replace(/[.*\s]/g, "");

function parseSpans(codes: string): CodeSpan[] {
  return codes.split(/,|;|\svà\s/).flatMap((part) => {
    const range = part.match(/Từ\s+(\S+)\s+đến\s+(\S+)/);
    if (range) return [{ from: normalizeCode(range[1]), to: normalizeCode(range[2]) }];
    const code = part.match(/[A-Z]\d{2}(?:\.\d{1,2})?/);
    return code ? [{ from: normalizeCode(code[0]), to: normalizeCode(code[0]) }] : [];
  });
}

/** Mã 3 ký tự trong danh mục bao gồm mọi mã 4, 5 ký tự thuộc nhóm đó (Phụ lục I, mục II.2.1). */
function spanCovers(span: CodeSpan, code: string): boolean {
  if (code.length < span.from.length) return false;
  return code.slice(0, span.from.length) >= span.from && code.slice(0, span.to.length) <= span.to;
}

const ENTRIES = LONG_TERM_DISEASE_ROWS.map(([no, group, name, codes]) => ({
  disease: { no, group: LONG_TERM_GROUPS[group], name, codes } satisfies LongTermDisease,
  spans: parseSpans(codes),
  search: fold(`${name} ${LONG_TERM_GROUPS[group]}`),
}));

export const LONG_TERM_DISEASE_COUNT = ENTRIES.length;
export const LONG_TERM_DISEASE_SOURCE = "Phụ lục I, Thông tư 25/2025/TT-BYT ngày 30/6/2025";
export const LONG_TERM_DISEASES: readonly LongTermDisease[] = ENTRIES.map((entry) => entry.disease);
export { LONG_TERM_GROUPS };

function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

const ICD_QUERY = /^[A-Za-z]\d{2}(?:\.?\d{0,2})\*?$/;

/** Tra cứu theo mã ICD-10 (ví dụ "D16.3", "I63") hoặc theo tên bệnh, không phân biệt dấu. */
export function searchLongTermDiseases(query: string, limit = Number.POSITIVE_INFINITY): LongTermDisease[] {
  const q = query.trim();
  if (!q) return [];
  if (ICD_QUERY.test(q)) {
    const code = normalizeCode(q);
    return ENTRIES.filter((entry) => entry.spans.some((span) => spanCovers(span, code)))
      .slice(0, limit)
      .map((entry) => entry.disease);
  }
  const tokens = fold(q).split(/\s+/).filter(Boolean);
  return ENTRIES.filter((entry) => tokens.every((token) => entry.search.includes(token)))
    .slice(0, limit)
    .map((entry) => entry.disease);
}
