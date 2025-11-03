// lieblingsring/lieblingsring/app/admin/layout.tsx
import React from "react";
import AdminSidebar from "../../components/AdminSidebar"; // 경로는 귀하 프로젝트에 맞게 조정

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AdminRootShell>{children}</AdminRootShell>
      </body>
    </html>
  );
}

function AdminRootShell({ children }: { children: React.ReactNode }) {
  "use client";
  const { usePathname } = require("next/navigation") as any;
  const pathname = usePathname?.() ?? "";

  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login?");
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      {!isLogin && <AdminSidebar />}
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}