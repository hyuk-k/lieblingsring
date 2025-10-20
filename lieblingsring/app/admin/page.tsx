// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MeRes = { isAdmin?: boolean };

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/auth/me", { cache: "no-store" });
        const d: MeRes = await r.json();
        setIsAdmin(!!d.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  };

  // 로딩 상태 (짧게 빈 화면/스켈레톤)
  if (isAdmin === null) return null;

  // 혹시 미들웨어 누락 대비 (비관리자일 때 표시 안 함)
  if (!isAdmin) return null;

  return (
    <section className="container" style={{ padding: "28px 0 60px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>관리자</h1>
        <button className="btn btn-outline" onClick={logout}>
          로그아웃
        </button>
      </div>

      <nav style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <Link className="btn btn-outline" href="/admin/shop">
          상품 관리
        </Link>
        <Link className="btn btn-outline" href="/admin/lookbook">
          룩북 관리
        </Link>
        <Link className="btn btn-outline" href="/admin/order">
          주문 관리
        </Link>
        <Link className="btn btn-outline" href="/admin/notice">
          공지/Q&A 관리
        </Link>
      </nav>

      <p className="muted" style={{ marginTop: 12, color: "#777" }}>
        ※ 관리자 전용 페이지입니다. 왼쪽 메뉴에서 관리 기능을 선택하세요.
      </p>
    </section>
  );
}
