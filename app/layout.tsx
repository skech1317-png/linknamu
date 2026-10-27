import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "알짜배기여",
  description: "내 모든 링크를 한 페이지에 모아 하나의 URL로 공유하는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
