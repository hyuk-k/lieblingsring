// lieblingsring/lieblingsring/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminSidebar() {
  const pathname = usePathname() ?? "";

  const items: { href: string; label: string }[] = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/shop", label: "샵 설정" },
    { href: "/admin/product", label: "상품 목록" },
    { href: "/admin/product-add", label: "상품 추가" },
    { href: "/admin/lookbook", label: "룩북" },
    { href: "/admin/order", label: "주문 관리" },
    { href: "/admin/notice", label: "공지/메시지" },
  ];

  return (
    <aside style={{ width: 220, padding: 20, borderRight: "1px solid #eee", minHeight: "100vh", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 18, fontWeight: 800 }}>관리자</div>
      <nav aria-label="관리자 메뉴">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <li key={it.href} style={{ marginBottom: 8 }}>
                <Link
                  href={it.href}
                  style={{
                    display: "inline-block",
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: active ? "#f5f5f5" : "transparent",
                    fontWeight: active ? 700 : 500,
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    color: "#111",
                  }}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
