// app/shop/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tab = "장신구" | "소품" | "기타";

/** images: 배열/단일문자열/JSON 문자열 모두 대응 */
function firstImage(srcLike: any): string {
  // 배열
  if (Array.isArray(srcLike)) {
    const v = srcLike.find((x: unknown) => typeof x === "string") as string | undefined;
    if (v && v.trim()) return v.trim();
  }
  // JSON 문자열
  if (typeof srcLike === "string") {
    try {
      const arr = JSON.parse(srcLike);
      if (Array.isArray(arr)) {
        const v = arr.find((x: unknown) => typeof x === "string") as string | undefined;
        if (v && v.trim()) return v.trim();
      }
    } catch {
      // 평범한 문자열 경로일 수도 있음
      if (srcLike.trim()) return srcLike.trim();
    }
  }
  return "/placeholder.jpg";
}

const formatKRW = (n: number) => {
  try { return n.toLocaleString("ko-KR"); } catch { return String(n); }
};

export default function ShopPage() {
  const [tab, setTab] = useState<Tab>("장신구");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/shop?cat=" + encodeURIComponent(tab), { cache: "no-store" });
        const data = await res.json();
        if (alive) setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tab]);

  return (
    <section className="container" style={{ padding: "40px 0" }}>
      {/* 헤더 / 탭 */}
      <div className="shop-head" role="region" aria-label="상품 목록 헤더">
        <h1>shop</h1>
        <div className="tabs" role="tablist" aria-label="카테고리">
          {(["장신구", "소품", "기타"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                aria-pressed={active}
                className={`tab ${active ? "is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            );
          })}
          <Link href="/products" className="tab" style={{ marginLeft: "auto" }}>
            전체 보기
          </Link>
        </div>
      </div>

      {/* 콘텐츠 */}
      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="muted">해당 카테고리의 상품이 없습니다.</p>
      ) : (
        <div className="shop-grid">
          {items.map((p: any) => {
            const img = firstImage(p.images ?? p.imagesJson);
            const onSale = typeof p.salePrice === "number" && p.salePrice > 0;
            const price = onSale ? p.salePrice : p.price;

            return (
              <Link key={p.id ?? p.slug} href={`/products/${p.slug}`} className="card" aria-label={`${p.name} 상세보기`}>
                <img
                  src={img}
                  alt={`${p.name} 이미지`}
                  className="card-img"
                  loading="lazy"
                  decoding="async"
                  onError={(e: any) => { e.currentTarget.src = "/placeholder.jpg"; }}
                />
                <h3 className="card-name">{p.name}</h3>

                {onSale ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="card-price" style={{ color: "#dc2626" }}>
                      {formatKRW(price)}원
                    </span>
                    <span style={{ color: "#9ca3af", textDecoration: "line-through", fontSize: 13 }}>
                      {formatKRW(p.price)}원
                    </span>
                  </div>
                ) : (
                  <div className="card-price">{formatKRW(price)}원</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
