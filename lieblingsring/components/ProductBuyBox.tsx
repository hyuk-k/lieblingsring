"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  productId: string;
  name: string;
  basePrice: number;
  salePrice?: number | null;
  slug: string;
};

/** GA4 사용 여부만 체크하면 되므로 최소한의 시그니처만 선언 */
type GtagFn = (...args: unknown[]) => void;
type WindowWithGtag = Window & { gtag?: GtagFn };

/** 안전한 숫자 포맷 */
const toKRW = (n: number) => {
  try {
    return n.toLocaleString("ko-KR");
  } catch {
    return String(n);
  }
};

/** 장바구니/위시리스트 아이템 */
type CartLikeItem = {
  id: string;
  slug: string;
  name: string;
  addEarring: boolean;
  earringExtra: number;
  price: number; // 단가(옵션 반영)
  qty: number;
  ts: number; // 타임스탬프
};

/** JSON.parse 안전 래퍼 */
function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** 배열 보장 래퍼 */
function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default function ProductBuyBox({
  productId,
  name,
  basePrice,
  salePrice,
  slug,
}: Props) {
  const [qty, setQty] = useState<number>(1);
  const [addEarring, setAddEarring] = useState<boolean>(false);

  /** 제품명으로 세트 가격 규칙 (요청 사항 반영) */
  const earringExtra = useMemo<number>(() => {
    if (/국화매듭/i.test(name)) return 79_000;
    if (/생쪽매듭|실타래/i.test(name)) return 59_000;
    return 0; // 나머지 상품은 세트 옵션 없음
  }, [name]);

  /** 단가/합계 */
  const unit: number = (salePrice ?? basePrice) + (addEarring ? earringExtra : 0);
  const total: number = unit * qty;

  /** GA4 view_item */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as WindowWithGtag;
    if (!w.gtag) return;

    w.gtag("event", "view_item", {
      currency: "KRW",
      value: unit,
      items: [
        {
          item_id: productId,
          item_name: name,
          item_variant: addEarring ? "earring_set" : "base",
          quantity: 1,
        },
      ],
    });
  }, [productId, name, unit, addEarring]);

  /** 로컬 스토리지 쓰기 */
  const addToLocal = (key: "cart" | "wishlist") => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(key);
    const parsed = safeParse<unknown>(raw);
    const list = ensureArray<CartLikeItem>(parsed);

    const item: CartLikeItem = {
      id: productId,
      slug,
      name,
      addEarring,
      earringExtra,
      price: unit,
      qty,
      ts: Date.now(),
    };

    list.push(item);
    localStorage.setItem(key, JSON.stringify(list));
  };

  /** 장바구니 담기 */
  const onAddToCart = () => {
    addToLocal("cart");

    if (typeof window !== "undefined") {
      const w = window as WindowWithGtag;
      w.gtag?.("event", "add_to_cart", {
        currency: "KRW",
        value: total,
        items: [
          {
            item_id: productId,
            item_name: name,
            quantity: qty,
            item_variant: addEarring ? "earring_set" : "base",
          },
        ],
      });
    }

    alert("장바구니에 담았습니다.");
  };

  /** 찜하기 */
  const onWishlist = () => {
    addToLocal("wishlist");

    if (typeof window !== "undefined") {
      const w = window as WindowWithGtag;
      w.gtag?.("event", "add_to_wishlist", {
        currency: "KRW",
        value: unit,
        items: [{ item_id: productId, item_name: name }],
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
          <span>귀걸이 세트 추가(+{toKRW(earringExtra)}원)</span>
        </label>
      )}

      {/* 수량 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <span style={{ color: "#666" }}>수량</span>
        <button
          className="btn btn-outline"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="수량 감소"
        >
          -
        </button>
        <div style={{ minWidth: 40, textAlign: "center" }}>{qty}</div>
        <button
          className="btn btn-outline"
          onClick={() => setQty((q) => q + 1)}
          aria-label="수량 증가"
        >
          +
        </button>
      </div>

      {/* 금액 */}
      <div style={{ marginTop: 12, fontWeight: 700 }}>합계: {toKRW(total)}원</div>

      {/* 버튼들 */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={onAddToCart}>
          장바구니
        </button>
        <button className="btn btn-outline" onClick={onWishlist}>
          찜하기
        </button>
        <a
          className="btn btn-outline"
          href="https://smartstore.naver.com/lieblingsring"
          target="_blank"
          rel="noreferrer"
        >
          스마트스토어
        </a>
      </div>
    </div>
  );
}
