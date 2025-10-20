"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  productId: string;
  name: string;
  basePrice: number;
  salePrice?: number | null;
  slug: string;
};

export default function ProductBuyBox({ productId, name, basePrice, salePrice, slug }: Props) {
  const [qty, setQty] = useState(1);
  const [addEarring, setAddEarring] = useState(false);

  // 제품명으로 세트가 적용되는 가격 규칙(요청하신 79,000/59,000원 케이스 반영)
  const earringExtra = useMemo(() => {
    if (/국화매듭/i.test(name)) return 79000;
    if (/생쪽매듭|실타래/i.test(name)) return 59000;
    return 0; // 나머지 상품은 세트 옵션 없음
  }, [name]);

  // 표시용 단가
  const unit = (salePrice ?? basePrice) + (addEarring ? earringExtra : 0);
  const total = unit * qty;

  // GA4 view_item
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).gtag) return;
    (window as any).gtag("event", "view_item", {
      currency: "KRW",
      value: unit,
      items: [{ item_id: productId, item_name: name, item_variant: addEarring ? "earring_set" : "base", quantity: 1 }]
    });
  }, [productId, name, unit, addEarring]);

  const addToLocal = (key: "cart" | "wishlist") => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      id: productId,
      slug,
      name,
      addEarring,
      earringExtra,
      price: unit,
      qty,
      ts: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(list));
  };

  const onAddToCart = () => {
    addToLocal("cart");
    if ((window as any)?.gtag) {
      (window as any).gtag("event", "add_to_cart", {
        currency: "KRW",
        value: total,
        items: [{ item_id: productId, item_name: name, quantity: qty, item_variant: addEarring ? "earring_set" : "base" }]
      });
    }
    alert("장바구니에 담았습니다.");
  };

  const onWishlist = () => {
    addToLocal("wishlist");
    if ((window as any)?.gtag) {
      (window as any).gtag("event", "add_to_wishlist", {
        currency: "KRW",
        value: unit,
        items: [{ item_id: productId, item_name: name }]
      });
    }
    alert("찜 리스트에 추가했습니다.");
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* 옵션 */}
      {earringExtra > 0 && (
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={addEarring}
            onChange={(e) => setAddEarring(e.target.checked)}
          />
          <span>귀걸이 세트 추가(+{earringExtra.toLocaleString()}원)</span>
        </label>
      )}

      {/* 수량 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <span style={{ color: "#666" }}>수량</span>
        <button className="btn btn-outline" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 감소">-</button>
        <div style={{ minWidth: 40, textAlign: "center" }}>{qty}</div>
        <button className="btn btn-outline" onClick={() => setQty((q) => q + 1)} aria-label="수량 증가">+</button>
      </div>

      {/* 금액 */}
      <div style={{ marginTop: 12, fontWeight: 700 }}>
        합계: {total.toLocaleString()}원
      </div>

      {/* 버튼들 */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={onAddToCart}>장바구니</button>
        <button className="btn btn-outline" onClick={onWishlist}>찜하기</button>
        <a className="btn btn-outline" href="https://smartstore.naver.com/lieblingsring" target="_blank">스마트스토어</a>
      </div>
    </div>
  );
}

