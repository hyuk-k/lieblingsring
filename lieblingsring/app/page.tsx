"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [q, setQ] = useState("");

  // ESC로 오버레이 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(false);
        setOpenSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = q.trim();
    if (!kw) return;
    window.location.href = `/products?kw=${encodeURIComponent(kw)}`;
  };

  return (
    <>
      {/* ===== 메인 히어로(겹침 없이 1개만 렌더) ===== */}
      <main className="home-hero" aria-label="메인 비주얼">
        {/* 배경 이미지 */}
        <img
          src="/model-black-slip-looking-up-window.jpg"
          alt="LIEBLINGSRING 메인 비주얼"
          className="home-hero-bg"
        />

        {/* 중앙 카피/버튼 */}
        <section className="home-hero-overlay">
          <div>
            <div style={{ textTransform: "lowercase", opacity: 0.9, letterSpacing: 1 }}>
              lieblingsring
            </div>
            <h1
              style={{
                fontSize: 42,
                letterSpacing: 10,
                margin: "12px 0 18px",
                fontWeight: 800,
              }}
            >
              당신을 특별하게 빛내줄 장신구
            </h1>
            <Link
              href="/shop"
              className="btn btn-primary"
              style={{ padding: "12px 22px", borderRadius: 999, fontWeight: 700 }}
            >
              go store
            </Link>
          </div>
        </section>

        {/* 우상단 퀵(검색/메뉴) */}
        <div className="quick-top-right">
          <button
            className="quick-btn"
            aria-label="검색 열기"
            onClick={() => setOpenSearch(true)}
          >
            🔍
          </button>
          <button
            className="quick-btn"
            aria-label="메뉴 열기"
            onClick={() => setOpenMenu(true)}
          >
            ≡
          </button>
        </div>

        {/* 우하단 SNS */}
        <div className="quick-sns" aria-label="소셜 링크">
          <a
            href="https://pf.kakao.com/"
            target="_blank"
            rel="noreferrer"
            className="kakao-dot"
            title="카카오톡 문의"
          >
            k
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="insta-dot"
            title="인스타그램"
          >
            ∘
          </a>
        </div>

        {/* 검색 오버레이 */}
        {openSearch && (
          <div className="overlay" onClick={() => setOpenSearch(false)}>
            <form
              className="search-box"
              onSubmit={goSearch}
              onClick={(e) => e.stopPropagation()}
              role="search"
              aria-label="사이트 검색"
            >
              <input
                placeholder="검색어를 입력하세요"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                aria-label="검색어"
                className="input"
              />
              <button type="submit" className="btn btn-primary">
                검색
              </button>
            </form>
          </div>
        )}

	{/* 메뉴 오버레이 */}
	{openMenu && (
	  <div className="overlay" onClick={() => setOpenMenu(false)}>
	    <div
	      className="drawer"
	      onClick={(e) => e.stopPropagation()}
	      role="dialog"
	      aria-label="메뉴"
	    >
	      <div className="drawer-head">
	        <b>MENU</b>
	        <button className="btn btn-outline" onClick={() => setOpenMenu(false)}>
	          닫기
	        </button>
	      </div>
	      <nav className="drawer-nav">
	        <Link href="/shop">shop</Link>
	        <Link href="/lookbook">lookbook</Link>
	        <Link href="/about">about us</Link>
	        <Link href="/archive">archive</Link>
	        <Link href="/community">community</Link>
	        <Link href="/login">login</Link>
	        <Link href="/signup">signup</Link>
	
	        {/* ✅ 로그아웃 버튼 추가 */}
	        <button
	          onClick={async () => {
	            await fetch("/api/auth/logout", { method: "POST" });
	            window.location.reload(); // 페이지 새로고침
	          }}
	          className="btn btn-outline"
	          style={{ marginTop: "12px" }}
	        >
	          logout
	        </button>
	
	        <a href="https://pf.kakao.com/" target="_blank" rel="noreferrer">
	          kakao
	        </a>
	        <a href="https://instagram.com/" target="_blank" rel="noreferrer">
	          instagram
	        </a>
	      </nav>
	    </div>
	  </div>
	)}

      </main>

      {/* 하단 간단 브랜드 카피 */}
      <section className="py-8" style={{ textAlign: "center", background: "#fff" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "12px 0" }}>
          매일의 순간에, 영원을 더하다
        </h2>
        <p style={{ color: "#666" }}>미니멀 주얼리 · 무료 사이즈 교환 · 간편 결제</p>
      </section>
    </>
  );
}
