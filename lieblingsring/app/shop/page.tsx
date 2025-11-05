// lieblingsring/lieblingsring/app/shop/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tab = "장신구" | "소품" | "기타";

/**
 * 탭 표시명 -> 서버에 보낼 subcategory 값 매핑 (서버와 반드시 동일하게 맞춰주세요)
 * 서버에서는 이 값(jewelry / smallitem / other)으로 필터링 하도록 구현되어야 합니다.
 */
const SUBCATEGORY_MAP: Record<Tab, string> = {
  장신구: "jewelry",
  소품: "smallitem",
  기타: "other",
};

/** images: 배열/단일문자열/JSON 문자열 모두 대응 */
function firstImage(srcLike: any): string {
  if (!srcLike) return "/placeholder.jpg";

  // 배열
  if (Array.isArray(srcLike)) {
    const v = srcLike.find((x: unknown) => typeof x === "string") as string | undefined;
    if (v && v.trim()) return v.trim();
  }

  // JSON 문자열 또는 단일 문자열
  if (typeof srcLike === "string") {
    // JSON 문자열 시도
    try {
      const arr = JSON.parse(srcLike);
      if (Array.isArray(arr)) {
        const v = arr.find((x: unknown) => typeof x === "string") as string | undefined;
        if (v && v.trim()) return v.trim();
      }
    } catch {
      // JSON 파싱 실패하면 평범한 문자열 경로일 수 있음
      if (srcLike.trim()) return srcLike.trim();
    }
  }

  return "/placeholder.jpg";
}

const formatKRW = (n: number) => {
  try {
    return n.toLocaleString("ko-KR");
  } catch {
    return String(n);
  }
};

export default function ShopPage() {
  const [tab, setTab] = useState<Tab>("장신구");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErrorMsg(null);
      setItems([]);

      try {
        // 서버에 전달할 param 값: SUBCATEGORY_MAP[tab]
        // 서버가 cat 대신 subcategory 파라미터를 기대한다면 URL을 바꾸세요.
        const sub = encodeURIComponent(SUBCATEGORY_MAP[tab]);
        const res = await fetch(`/api/shop?cat=${sub}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        // 응답이 JSON이 아닐 수도 있으니 안전하게 처리
        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          // 일부 서버는 이미 JSON으로 파싱 가능한 구조를 리턴할 수 있으므로 시도
          try {
            data = JSON.parse(JSON.stringify(text));
          } catch {
            data = null;
          }
        }

        if (!alive) return;

        if (!res.ok) {
          // 서버가 오류 메세지를 JSON으로 줬다면 우선 그것을 사용
          const msg = data?.message ?? `서버 오류: ${res.status}`;
          setErrorMsg(String(msg));
          setItems([]);
        } else {
          // 서버 응답 구조가 { items: [...] } 또는 바로 배열일 수 있으니 둘 다 검토
          const arr = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
            ? data
            : [];

          setItems(Array.isArray(arr) ? arr : []);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // abort - 무시
        } else {
          console.error("shop fetch error:", err);
          setErrorMsg("상품을 불러오는 중 오류가 발생했습니다.");
          setItems([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [tab]);

  return (
    <section className="container" style={{ padding: "40px 0" }}>
      {/* 헤더 / 탭 */}
      <div className="shop-head" role="region" aria-label="상품 목록 헤더" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>shop</h1>
        <div className="tabs" role="tablist" aria-label="카테고리" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
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
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: active ? "1px solid #000" : "1px solid #e5e7eb",
                  background: active ? "#000" : "#fff",
                  color: active ? "#fff" : "#000",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}

          <Link href="/products" className="tab" style={{ marginLeft: "auto", textDecoration: "none", color: "#111", padding: "6px 12px" }}>
            전체 보기
          </Link>
        </div>
      </div>

      {/* 콘텐츠 */}
      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : errorMsg ? (
        <div>
          <p className="muted" style={{ color: "#b91c1c" }}>
            {errorMsg}
          </p>
          <p className="muted">잠시 후 다시 시도해 주세요.</p>
        </div>
      ) : items.length === 0 ? (
        <p className="muted">해당 카테고리의 상품이 없습니다.</p>
      ) : (
        <div className="shop-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20
        }}>
          {items.map((p: any) => {
            const img = firstImage(p.images ?? p.imagesJson ?? p.image);
            const onSale = typeof p.salePrice === "number" && p.salePrice > 0;
            const price = onSale ? p.salePrice : p.price;

            return (
              <Link
                key={p.id ?? p.slug}
                href={`/products/${p.slug}`}
                className="card"
                aria-label={`${p.name} 상세보기`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: 8,
                  border: "1px solid #e6e6e6",
                  padding: 12,
                  background: "#fff",
                }}
              >
                <div style={{ borderRadius: 8, overflow: "hidden", height: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
                  <img
                    src={img}
                    alt={`${p.name} 이미지`}
                    className="card-img"
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e: any) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>

                <h3 className="card-name" style={{ marginTop: 12, marginBottom: 8, fontSize: 16 }}>{p.name}</h3>

                {onSale ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="card-price" style={{ color: "#dc2626", fontWeight: 700 }}>
                      {formatKRW(price)}원
                    </span>
                    <span style={{ color: "#9ca3af", textDecoration: "line-through", fontSize: 13 }}>
                      {formatKRW(p.price)}원
                    </span>
                  </div>
                ) : (
                  <div className="card-price" style={{ fontWeight: 700 }}>{formatKRW(price)}원</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}