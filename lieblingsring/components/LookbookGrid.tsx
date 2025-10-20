// components/LookbookGrid.tsx
"use client";

import { useEffect } from "react";

// public/ 의 실제 파일명과 정확히 맞추세요 (대소문자 포함)
const LOOKS: { src: string; title?: string }[] = [
  { src: "/model-black-blouse-key-necklace-right-profile-closeup.jpg", title: "Right Profile" },
  { src: "/model-black-slip-looking-up-window.jpg", title: "Window Gaze" },
  { src: "/model-white-tee-key-necklace-smile-portrait.jpg", title: "Key Necklace" },
  { src: "/model-black-slip-sitting-bed-smile-portrait.jpg", title: "Bed Portrait" },
  { src: "/mirror-smile-earring-necklace-closeup.jpg", title: "Mirror Smile" },
  { src: "/neckline-key-necklace-left-profile-extreme-closeup.jpg", title: "Left Profile" },
  { src: "/model-black-blouse-necklace-side-gaze.jpg", title: "Side Gaze" },
  { src: "/model-black-dress-stand-smile-vintage-hangers.jpg", title: "Vintage Hangers" },
  { src: "/model-black-blouse-raising-hand-vintage-wall.jpg", title: "Raising Hand" },
];

export default function LookbookGrid() {
  // 선택: GA4 page_view
  useEffect(() => {
    const gtag = (window as any)?.gtag;
    if (gtag) gtag("event", "page_view", { page_title: "lookbook", page_path: "/lookbook" });
  }, []);

  const handleClick = (title: string) => {
    const gtag = (window as any)?.gtag;
    if (gtag) gtag("event", "look_click", { look_title: title });
  };

  return (
    <div
      className="lookbook-layout"
      style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}
    >
      {/* 좌측 고정 사이드 */}
      <aside
        style={{
          borderRight: "1px solid #eee",
          padding: "40px 24px",
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, letterSpacing: 1, marginBottom: 16 }}>LIEBLINGSRING</h2>
          <nav style={{ display: "grid", gap: 8, fontSize: 14 }}>
            <a href="/about">ABOUT US</a>
            <a href="/shop">STORE</a>
            <a href="/lookbook" style={{ fontWeight: 700, textDecoration: "underline" }}>LOOKBOOK</a>
            <a href="/community">COMMUNITY</a>
          </nav>
        </div>
        <div style={{ fontSize: 12, color: "#777" }}>
          <p>📞 010-2608-0967</p>
          <p>✉ lieblingsring@naver.com</p>
          <p>Mon–Fri 10:00–16:00</p>
        </div>
      </aside>

      {/* 우측 그리드 */}
      <main style={{ padding: "40px 32px" }}>
        <h1 style={{ textAlign: "center", fontSize: 13, letterSpacing: 6, marginBottom: 36, fontWeight: 700 }}>
          LOOKBOOK
        </h1>

        <div
          className="lookbook-grid"
          style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {LOOKS.map((it, i) => (
            <figure key={i} style={{ margin: 0, cursor: "pointer" }}>
              <img
                src={it.src}
                alt={it.title || `Look ${i + 1}`}
                loading="lazy"
                onClick={() => handleClick(it.title || `Look ${i + 1}`)}
                style={{
                  width: "100%",
                  height: 520,
                  objectFit: "cover",
                  borderRadius: 8,
                  display: "block",
                  background: "#f6f6f6",
                  transition: "transform .3s ease",
                }}
                className="hover:scale-105"
              />
              {it.title && (
                <figcaption style={{ marginTop: 8, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                  {it.title}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </main>
    </div>
  );
}
