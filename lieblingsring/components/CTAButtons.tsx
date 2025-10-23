// components/CTAButtons.tsx
"use client";

import Link from "next/link";
import React from "react";
import { event as gaEvent } from "@/lib/ga"; // named import 사용

// 프로젝트에 전역 타입 파일이 없다면 파일 내에 간단한 Product 타입을 선언합니다.
// 만약 src/types/index.ts 등에 Product 타입이 있다면 해당 import로 대체해도 됩니다.
// import type { Product } from "@/types";
type Product = {
  id: string;
  name: string;
  // 필요한 경우 아래 필드들 추가:
  // price?: number;
  // sku?: string;
};

type Props = {
  product: Product;
  inquiryHref: string;
  inquiryPrimary?: boolean;
};

export default function CTAButtons({ product, inquiryHref, inquiryPrimary }: Props) {
  const handleAddToCart = () => {
    // 애널리틱스: add_to_cart
    gaEvent("add_to_cart", {
      currency: "KRW",
      value: 0,
      items: [{ item_id: product.id, item_name: product.name }],
    });
    // 실제 장바구니 동작(예: 상태 업데이트, API 호출) 추가 위치
  };

  const handleBeginCheckout = () => {
    gaEvent("begin_checkout", {
      items: [{ item_id: product.id, item_name: product.name }],
    });
    // checkout 로직(예: 결제 페이지 이동) 추가 위치
  };

  const handleInquiryClick = () => {
    gaEvent("select_content", {
      content_type: "inquiry",
      item_id: product.id,
      item_name: product.name,
      source: "pdp",
    });
  };

  return (
    <div className="cta-buttons" role="group" aria-label="구매 액션">
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleAddToCart}
        aria-label="장바구니 담기"
      >
        장바구니 담기
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleBeginCheckout}
        aria-label="바로 구매"
      >
        바로 구매
      </button>

      <Link
        href={inquiryHref}
        className={`btn ${inquiryPrimary ? "btn-primary" : "btn-outline"}`}
        onClick={handleInquiryClick}
      >
        문의하기
      </Link>
    </div>
  );
}