// app/admin/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next 15 계열은 cookies() 를 await 해야 경고가 사라집니다.
  const jar = await cookies();
  const cookieName = process.env.ADMIN_COOKIE_NAME || "admin";
  const isAdmin = jar.get(cookieName)?.value === "1";

  if (!isAdmin) redirect("/admin/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "#111",
          color: "#fff",
          padding: 20,
          display: "grid",
          gap: 8,
        }}
      >
        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Admin</h2>
        <Link href="/admin">대시보드</Link>
        <Link href="/admin/shop">상품관리</Link>
        <Link href="/admin/lookbook">룩북관리</Link>
        <Link href="/admin/order">주문관리</Link>
        <Link href="/admin/notice">공지/Q&A</Link>
        <form action="/api/admin/auth/logout" method="post" style={{ marginTop: 12 }}>
          <button
            type="submit"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #fff",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </form>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}

