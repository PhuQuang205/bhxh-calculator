import { Google_Sans_Flex } from "next/font/google";

export const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  display: "swap",
  // Next chưa có số đo sẵn cho font này; font dự phòng đã khai báo tay trong globals.css.
  adjustFontFallback: false,
});
