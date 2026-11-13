@../AGENTS.md

# BHXH Calculator — context dự án

Web app một trang tính nhanh số ngày hưởng và tiền trợ cấp BHXH: **Ốm đau – Thai sản – Dưỡng sức, phục hồi sức khỏe**. Tính trực tiếp khi nhập (live), xử lý 100% phía client, không backend, không database, không lưu dữ liệu người dùng.

- Repo: `github.com/PhuQuang205/bhxh-calculator`, nhánh `main`.
- Deploy: Vercel import repo GitHub, push `main` là tự deploy. Không có biến môi trường.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, pnpm, `date-fns`, `lucide-react`, `@base-ui/react` (Popover, Select, Switch), `radix-ui` (Tabs), `react-day-picker`, `vitest`.

## Nguồn chuẩn nghiệp vụ — KHÔNG tự sửa

`Kế hoạch Thiết kế Web App Tính Chế độ BHXH (Ốm đau - Thai sản - Dưỡng sức).md` ở gốc repo là **đặc tả của khách hàng**.

- Không sửa file đó.
- Code phải theo **đúng con số trong đặc tả**, kể cả khi tra luật thấy khác. Chỉ đổi khi anh (chủ dự án) báo khách đã đổi đặc tả.
- Chỗ đặc tả bỏ trống (ví dụ số ngày tối đa khi tránh thai): không tự bịa số, hãy hỏi lại.

Mọi con số nằm duy nhất trong `src/lib/bhxh/rules.ts`. Tóm tắt:

| Chế độ | Cách đếm ngày | Trần | Công thức tiền |
|---|---|---|---|
| Ốm đau (bản thân, chăm con < 7 tuổi, bệnh dài ngày) | Ngày làm việc. Ngày nghỉ dưới nửa ngày tính 0,5. | 30/40/50 ngày/năm; nặng nhọc, độc hại 40/50/70 | `lương tháng liền kề ÷ 24 × 75% × ngày`. Bệnh dài ngày quá 180 ngày hưởng 50/55/65%. |
| Khám thai | Ngày làm việc | 5 lần, mỗi lần ≤ 2 ngày | `BQ 6 tháng ÷ 24 × 100% × ngày` |
| Nam nghỉ khi vợ sinh | Ngày làm việc | 5 / 7 (mổ hoặc < 32 tuần) / 10 (sinh đôi) / 14 (sinh đôi phải mổ) | `BQ ÷ 24 × ngày` |
| Sảy, phá thai, thai chết lưu | Ngày liên tục | 10 / 20 / 40 / 50 ngày theo tuần tuổi thai (< 5, < 13, < 22, ≥ 22) | `BQ ÷ 24 × ngày` |
| Tránh thai | Ngày liên tục | Không có trần trong đặc tả | `BQ ÷ 24 × ngày` |
| Sinh con | Ngày liên tục | 6 tháng, thêm 1 tháng/con từ con thứ 2 | `BQ × số tháng` |
| Dưỡng sức | Ngày liên tục, nghỉ trong 30 ngày đầu sau khi đi làm lại | Sau ốm: 10 (dài ngày) / 7 (phẫu thuật) / 5 (khác). Sau thai sản: 10 (từ 2 con) / 7 (sinh mổ) / 5 (khác) | `2.340.000 × 30% × ngày` (702.000 đ/ngày) |

Viết tắt: BQ = bình quân tiền lương đóng BHXH 6 tháng liền kề.

## Cấu trúc

```
src/lib/bhxh/          engine thuần (không React), có test vitest
  rules.ts             MỌI con số nghiệp vụ
  holidays.ts          lịch nghỉ lễ/Tết có sẵn theo năm + gộp ngày tùy chỉnh
  dateEngine.ts        đếm ngày lịch / ngày làm việc, dựng từng ô ngày, diễn giải ngày bị trừ
  period.ts            khoảng nghỉ dùng chung
  sickness.ts, maternity.ts, recovery.ts → trả về CalcOutcome (CalcResult | CalcPending)
  inputs.ts, types.ts
src/features/calculator/   UI: CalculatorView (useReducer + useMemo), state.ts, Header, input/*, result/*
src/components/ui|form/    UI kit port từ portal-sales-pharmacy
```

- UI kết quả chỉ đọc `CalcResult`, không tự tính lại.
- Lương (tháng liền kề / BQ 6 tháng) là **tùy chọn** theo phản hồi của khách: thiếu lương vẫn trả `CalcResult` đầy đủ số ngày, `withoutMoney()` bỏ phần tiền và gắn `moneyMissing`.
- Ngày nghỉ hằng tuần là danh sách thứ tùy chọn (`WeeklyRest = number[]`, 0 = CN … 6 = T7). Mặc định `[0]`; đơn vị có thể nghỉ cả ngày thường, ví dụ Thứ 4.
- Ngày truyền đi dạng chuỗi ISO `yyyy-MM-dd`.
- Tiền là số nguyên đồng (`Math.round` ở từng dòng).

## Giao diện

- Bento kiểu mẫu ProHealth: nền `#f2f2f2`, card trắng bo 24–32px, màu chính `#0762d9`, font Google Sans Flex, số lớn nét mảnh.
- Ô nhập theo form đăng nhập của `D:\learn-program\ERP_DUOC_TAM_PHUC_V2\portal-sales-pharmacy`:
  - Nhãn 14px ở trên.
  - Ô `h-14 bg-muted rounded-lg`, không viền. Focus thì nền `primary-tint`.
  - Khe lỗi cố định dưới ô.
  - Nút pill.
- Token màu nằm trong `src/app/globals.css`. Thêm component thì ưu tiên tái dùng `components/ui` hoặc port tiếp từ portal.
- In phiếu: `window.print()` kết hợp `.print-only` / `.no-print`.

## Lệnh

- `pnpm dev`: chạy dev.
- `pnpm test`: chạy vitest cho engine.
- `pnpm lint`
- `pnpm build`

Build phải xanh trước khi commit.

## Commit

- Conventional Commits, tiếng Anh.
- Commit nguyên tử: tách engine, UI kit và trang.
- **Không** thêm `Co-authored-by` hay dòng "Generated with".
