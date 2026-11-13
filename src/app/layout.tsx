import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { googleSansFlex } from "./fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tính chế độ BHXH – Ốm đau, Thai sản, Dưỡng sức",
  description:
    "Tính nhanh số ngày hưởng BHXH ốm đau, thai sản, dưỡng sức phục hồi sức khỏe theo Luật BHXH 41/2024/QH15.",
  authors: [{ name: "Nguyễn Thị Hồng Quyên" }],
};

export const viewport: Viewport = {
  themeColor: "#f2f2f2",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" className={`${googleSansFlex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
