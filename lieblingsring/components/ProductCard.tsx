"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@prisma/client";

/** images가 배열/JSON 문자열/단일 문자열 모두 대응 */
function getFirstImage(images: unknown): string {
  // 1️⃣ 배열일때
  if (Array.isArray(images)) {
    const v = images.find((x) => typeof x === "string") as string | undefined;
    if (v && v.trim()) return v.trim();
  }

  // 2️⃣ JSON 문자열일 때
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        const v = parsed.find((x) => typeof x === "string") as string | undefined;
        if (v && v.trim()) return v.trim();
      }
    } catch {
      // 단일 문자열일 경우 그대로 리턴
      if (images.trim()) return images.trim();
    }
  }

  // 3️⃣ 플백 이미지
  return "/placeholder.jpg";
}

/** 숫자를 $로 표시 포맷 */
const formatKRW = (n: number): string => {
  try {
    return n.toLocaleString("ko-KR");
  } catch {
    return String(n);
  }
};

type ProductCardProps = {
  product: Product & { images?: string[] | string | null; slug?: string };
};

export default function ProductCard({ product }: ProductCardProps) {
  const imgSrc = getFirstImage(product.images);
  const isOnSale = typeof product.salePrice === "number" && product.salePrice > 0;
  const displayPrice = isOnSale ? product.salePrice! : product.price;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Link
        href={`/products/${product.slug ?? ""}`}
        aria-label={`${product.name} 상세보기`}
      >
        <div style={{ width: "100%", aspectRatio: "3 / 4", overflow: "hidden" }}>
          <Image
            src={imgSrc}
            alt={`${product.name} 이미지`}
            width={600}
            height={800}
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
            placeholder="empty"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              transition: "transform .3s ease",
            }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = "/placeholder.jpg";
            }}
          />
        </div>

        <div style={{ padding: 12 }}>
          <h3
            className="card-name"
            style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}
          >
            {product.name}
          </h3>

          {/* 가격 영역 */}
          {isOnSale ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                className="card-price"
                style={{ color: "#dc2626", fontWeight: 700 }}
              >
                {formatKRW(displayPrice)}원
              </span>
              <span
                style={{
                  color: "#9ca3af",
                  textDecoration: "line-through",
                  fontSize: 13,
                }}
              >
                {formatKRW(product.price)}원
              </span>
            </div>
          ) : (
            <div className="card-price" style={{ fontWeight: 700 }}>
              {formatKRW(displayPrice)}원
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
