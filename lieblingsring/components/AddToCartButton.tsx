"use client";

type Props = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  qty?: number;
};

export default function AddToCartButton({ id, name, price, image, qty = 1 }: Props) {
  const add = async () => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, price, image, qty }),
    });
    if (!res.ok) return alert("장바구니 담기에 실패했어요.");
    alert("장바구니에 담았습니다.");
  };

  return (
    <button className="btn btn-primary" onClick={add}>
      장바구니 담기
    </button>
  );
}

