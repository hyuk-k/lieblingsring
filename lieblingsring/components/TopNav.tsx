"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type MeResponse = { user: null | { name?: string; email?: string } };

// 텍스트 로고만 쓰고 싶으면 true
const USE_TEXT_LOGO = false;

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [me, setMe] = useState<MeResponse["user"]>(null);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        const data: MeResponse = await r.json();
        setMe(data.user ?? null);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = q.trim();
    if (!kw) return;
    router.push(`/products?kw=${encodeURIComponent(kw)}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.location.reload();
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          background: active ? "#f5f5f5" : "transparent",
          fontWeight: active ? 700 : 500,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header>
      <div
        className="wrap container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "10px 16px",
          flexWrap: "nowrap",
          minWidth: 0, // 🔸오버플로우 방지
        }}
      >
        {/* 로고 */}
        <Link
          href="/"
          aria-label="홈"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {USE_TEXT_LOGO ? (
            <strong style={{ letterSpacing: 2 }}>LIEBLINGSRING</strong>
          ) : (
            <Image src="/logo.svg" alt="LIEBLINGSRING" style={{ height: 28, display: "block" }} />
          )}
        </Link>

        {/* 데스크탑 네비 */}
        <nav
          className="hide-sm"
          style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", whiteSpace: "nowrap" }}
          aria-label="주요 메뉴"
        >
          <NavLink href="/shop" label="shop" />
          <NavLink href="/lookbook" label="lookbook" />
          <NavLink href="/about" label="about us" />
          <NavLink href="/community" label="community" />
          <NavLink href="/order" label="order" />
          <NavLink href="/cart" label="cart" />

          {me ? (
            <>
              <NavLink href="/account" label="mypage" />
              <button type="button" className="btn btn-outline" onClick={handleLogout} aria-label="logout" style={{ whiteSpace: "nowrap" }}>
                logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" label="login" />
              <NavLink href="/signup" label="signup" />
            </>
          )}

          <button
            type="button"
            className="btn btn-outline"
            aria-label="검색"
            onClick={() => setSearchOpen((v) => !v)}
          >
            🔍
          </button>
          <a className="btn btn-outline" href="https://pf.kakao.com/" target="_blank" rel="noreferrer noopener">
            kakao
          </a>
          <a className="btn btn-outline" href="https://instagram.com/" target="_blank" rel="noreferrer noopener">
            insta
          </a>
        </nav>

        {/* 모바일 버튼 */}
        <div className="show-sm" style={{ display: "none", alignItems: "center", gap: 8 }}>
          <button type="button" className="btn btn-outline" aria-label="검색" onClick={() => setSearchOpen((v) => !v)}>
            🔍
          </button>
          <button type="button" className="btn btn-outline" aria-label="메뉴" onClick={() => setMobileOpen(true)}>
            ☰
          </button>
        </div>
      </div>

      {/* 검색 확장 */}
      {searchOpen && (
        <div className="container" style={{ paddingBottom: 12 }}>
          <form onSubmit={goSearch} style={{ display: "flex", gap: 8, maxWidth: 600 }} role="search" aria-label="상품 검색">
            <input
              className="input"
              placeholder="상품명으로 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="검색어"
            />
            <button className="btn btn-primary" type="submit">검색</button>
            <button type="button" className="btn btn-outline" onClick={() => setSearchOpen(false)}>닫기</button>
          </form>
        </div>
      )}

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-label="모바일 메뉴"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "flex-end", zIndex: 1001 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{ width: "80%", maxWidth: 320, background: "#fff", height: "100%", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <strong>메뉴</strong>
              <button type="button" className="btn btn-outline" onClick={() => setMobileOpen(false)}>닫기</button>
            </div>

            <nav style={{ display: "grid", gap: 8 }}>
              <NavLink href="/shop" label="shop" />
              <NavLink href="/lookbook" label="lookbook" />
              <NavLink href="/about" label="about us" />
              <NavLink href="/community" label="community" />
              <NavLink href="/order" label="order" />
              <NavLink href="/cart" label="cart" />

              {me ? (
                <>
                  <NavLink href="/account" label="mypage" />
                  <button type="button" className="btn btn-outline" onClick={handleLogout} aria-label="logout">logout</button>
                </>
              ) : (
                <>
                  <NavLink href="/login" label="login" />
                  <NavLink href="/signup" label="signup" />
                </>
              )}

              <a href="https://pf.kakao.com/" target="_blank" rel="noreferrer noopener">kakao</a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer noopener">instagram</a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
