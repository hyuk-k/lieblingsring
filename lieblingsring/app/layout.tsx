import "./globals.css";
import TopNav from "@/components/TopNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TopNav />      {/* ✅ 모든 페이지에 네비 복구 */}
        {children}
      </body>
    </html>
  );
}
