"use client";

import { useState } from "react";

export default function SearchPage() {
  const [q, setQ] = useState("");

  const onSubmit = (e: any) => {
    e.preventDefault();
    const kw = q.trim();
    if (!kw) return;
    window.location.href = "/products?kw=" + encodeURIComponent(kw);
  };

  return (
    <section className="py-10">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>검색</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, maxWidth: 520 }}>
        <input
          className="input"
          placeholder="상품명으로 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="검색어 입력"
        />
        <button className="btn btn-primary" type="submit">검색</button>
      </form>
      <p style={{ color: "#666", marginTop: 10 }}>
        예) SILVER, 브로치, 스트랩 등으로 검색해 보세요.
      </p>
    </section>
  );
}
