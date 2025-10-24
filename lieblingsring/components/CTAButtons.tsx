// components/CTAButtons.tsx
"use client";
import Link from "next/link";
import React from "react";
import { event as gaEvent } from "@/lib/ga";

type Product = {
  id: string;
  name: string;
};

type Props = {
  product: Product;
  inquiryHref: string;
  inquiryPrimary?: boolean;
};

export default function CTAButtons({ product, inquiryHref, inquiryPrimary }: Props) {
  const handleAddToCart = () => {
    gaEvent("add_to_cart", {
      currency: "KRW",
      value: 0,
      items: [{ item_id: product.id, item_name: product.name }],
    });
  };

  const handleBeginCheckout = () => {
    // 결제 수단은 PAYAPP으로 고정
    // 실제 결제 시작 API로 넘어가도록 변경하세요 (서버에서 payapp 처리)
    gaEvent("begin_checkout", { items: [{ item_id: product.id, item_name: product.name }] });
    // 예: router.push("/checkout?method=PAYAPP") 또는 checkout API 호출
    window.location.href = `/checkout?method=PAYAPP&product=${encodeURIComponent(product.id)}`;
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
      <button type="button" className="btn btn-primary" onClick={handleAddToCart} aria-label="장바구니 담기">
        장바구니 담기
      </button>

      <button type="button" className="btn btn-secondary" onClick={handleBeginCheckout} aria-label="바로 구매">
        바로 구매 (페이앱)
      </button>

      <Link href={inquiryHref} className={`btn ${inquiryPrimary ? "btn-primary" : "btn-outline"}`} onClick={handleInquiryClick}>
        문의하기
      </Link>
    </div>
  );
}