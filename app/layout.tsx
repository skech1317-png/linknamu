import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "알짜배기여",
  description: "내 모든 링크를 한 페이지에 모아 하나의 URL로 공유하는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Pretendard: 한글·영문 모두 둥글고 단정한 산세리프. 쓰는 글자만 내려받는 subset 버전 */}
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
