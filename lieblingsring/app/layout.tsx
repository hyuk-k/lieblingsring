// lieblingsring/lieblingsring/app/layout.tsx
import "./globals.css";                 // app 폴더 내부의 globals.css를 가리킵니다
import TopNav from "../components/TopNav"; // components 폴더는 app의 상위(프로젝트 루트)에 있음

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TopNav />      {/* 모든 페이지에 네비 복구 */}
        {children}
      </body>
    </html>
  );
}