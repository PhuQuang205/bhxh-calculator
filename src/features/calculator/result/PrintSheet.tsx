import { format } from "date-fns";

import { formatMoney } from "@/lib/format";
import type { CalcResult } from "@/lib/bhxh/types";

import type { CalculatorState } from "../state";
import { benefitText, caseTitle, periodText } from "../summary";

/** Phiếu tính khổ A4: chỉ hiện khi in (lớp .print-only). */
export function PrintSheet({ state, result }: { state: CalculatorState; result: CalcResult }) {
  const rows: [string, string][] = [
    ["Người lao động", state.fullName.trim() || "………………………………"],
    ["Chế độ", caseTitle(state)],
    ["Thời gian nghỉ", periodText(result)],
    ["Tổng số ngày theo lịch", `${result.calendarDays} ngày`],
    [
      "Quy tắc tính ngày",
      result.rule === "working" ? "Ngày làm việc (không tính ngày nghỉ hằng tuần, lễ, Tết)" : "Ngày liên tục (tính cả T7, CN, lễ, Tết)",
    ],
    ["Số ngày được hưởng", benefitText(result)],
  ];
  return (
    <div className="print-only text-[12pt] leading-normal text-black">
      <div className="mb-6 flex items-start justify-between">
        <div className="text-[10pt] uppercase">Đơn vị: ……………………………</div>
        <div className="text-[10pt]">Ngày lập: {format(new Date(), "dd/MM/yyyy")}</div>
      </div>
      <h1 className="mb-1 text-center text-[16pt] font-bold uppercase">Phiếu tính chế độ bảo hiểm xã hội</h1>
      <p className="mb-6 text-center text-[10pt] italic">Căn cứ Luật Bảo hiểm xã hội số 41/2024/QH15</p>

      <table className="mb-4 w-full border-collapse text-[11pt]">
        <tbody>
          {rows.map(([key, value]) => (
            <tr key={key}>
              <td className="w-1/3 border border-black px-2 py-1 font-semibold">{key}</td>
              <td className="border border-black px-2 py-1">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {result.deductions.length > 0 ? (
        <ul className="mb-4 list-disc pl-6 text-[11pt]">
          {result.deductions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      <table className="mb-4 w-full border-collapse text-[11pt]">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left">Khoản</th>
            <th className="border border-black px-2 py-1 text-left">Công thức</th>
            <th className="border border-black px-2 py-1 text-right">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {result.lines.map((line) => (
            <tr key={line.label}>
              <td className="border border-black px-2 py-1">{line.label}</td>
              <td className="border border-black px-2 py-1">{line.formula}</td>
              <td className="border border-black px-2 py-1 text-right whitespace-nowrap">{formatMoney(line.amount)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
              Tổng cộng
            </td>
            <td className="border border-black px-2 py-1 text-right font-bold whitespace-nowrap">{formatMoney(result.total)}</td>
          </tr>
        </tbody>
      </table>

      {result.alerts.some((a) => a.level !== "ok") ? (
        <div className="mb-4 text-[10pt]">
          <p className="font-semibold">Lưu ý:</p>
          <ul className="list-disc pl-6">
            {result.alerts
              .filter((a) => a.level !== "ok")
              .map((a) => (
                <li key={a.text}>{a.text}</li>
              ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-3 text-center text-[11pt]">
        <div>
          <p className="font-semibold">Người lao động</p>
          <p className="text-[9pt] italic">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold">Người lập phiếu</p>
          <p className="text-[9pt] italic">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold">Thủ trưởng đơn vị</p>
          <p className="text-[9pt] italic">(Ký, đóng dấu)</p>
        </div>
      </div>
    </div>
  );
}
