// app/admin/layout.tsx
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 여기는 로그인 페이지까지 포함되는 “루트 레이아웃”이므로
  // 절대 redirect 검사를 하지 않습니다.
  return <>{children}</>;
}
