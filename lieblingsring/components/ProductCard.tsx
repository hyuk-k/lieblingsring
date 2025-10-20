"use client";

import Link from "next/link";
import type { Product } from "@prisma/client";

/** images가 배열/JSON 문자열/단일 문자열 모두 대응 */
function getFirstImage(product: any): string {
  // 1) product.images 가 배열인 경우
  if (Array.isArray(product?.images)) {
    const v = product.images.find((x: unknown) => typeof x === "string") as string | undefined;
    if (v && v.trim()) return v.trim();
  }
  // 2) product.imagesJson 이 JSON 문자열인 경우
  if (typeof product?.imagesJson === "string") {
    try {
      const arr = JSON.parse(product.imagesJson);
      if (Array.isArray(arr)) {
        const v = arr.find((x: unknown) => typeof x === "string") as string | undefined;
        if (v && v.trim()) return v.trim();
      }
    } catch {}
  }
  // 3) product.images 가 단일 문자열인 경우
  if (typeof product?.images === "string" && product.images.trim()) {
    return product.images.trim();
  }
  // 4) 최종 폴백
  return "/placeholder.jpg";
}

const formatKRW = (n: number) => {
  try {
    return n.toLocaleString("ko-KR");
  } catch {
    return String(n);
  }
};

export default function ProductCard({ product }: { product: Product }) {
  const imgSrc = getFirstImage(product as any);
  const isOnSale = typeof product.salePrice === "number" && product.salePrice > 0;
  const displayPrice = isOnSale ? product.salePrice! : product.price;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Link href={`/products/${product.slug}`} aria-label={`${product.name} 상세보기`}>
        <div style={{ width: "100%", aspectRatio: "3 / 4", overflow: "hidden" }}>
          <img
            src={imgSrc}
            alt={`${product.name} 이미지`}
            loading="lazy"
            decoding="async"
            className="card-img hover:scale-105"
            onError={(e: any) => {
              // 이미지 깨질 경우 플레이스홀더로 대체
              if (e?.currentTarget) e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        </div>

        <div style={{ padding: 12 }}>
          <h3 className="card-name">{product.name}</h3>

          {/* 가격 영역 */}
          {isOnSale ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="card-price" style={{ color: "#dc2626" }}>
                {formatKRW(displayPrice)}원
              </span>
              <span style={{ color: "#9ca3af", textDecoration: "line-through", fontSize: 13 }}>
                {formatKRW(product.price)}원
              </span>
            </div>
          ) : (
            <div className="card-price">{formatKRW(displayPrice)}원</div>
          )}
        </div>
      </Link>
    </div>
  );
}
