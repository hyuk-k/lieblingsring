"use client";

import { useEffect, useState } from "react";

type CartItem = { id: string; name: string; price: number; qty: number; image?: string | null };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/cart", { cache: "no-store" });
      const d = await r.json();
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const setQty = async (id: string, qty: number) => {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, qty }),
    });
    reload();
  };

  const removeOne = async (id: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    reload();
  };

  const clearAll = async () => {
    await fetch("/api/cart", { method: "DELETE" }); // body 없이 -> 전체 비우기
    reload();
  };

  return (
    <section className="container" style={{ padding: "28px 0" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>장바구니</h1>

      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="muted">장바구니가 비었습니다.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                <img src={it.image || "/placeholder.jpg"} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div className="muted">{it.price.toLocaleString()}원</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button className="btn btn-outline" onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}>-</button>
                  <span>{it.qty}</span>
                  <button className="btn btn-outline" onClick={() => setQty(it.id, it.qty + 1)}>+</button>
                </div>
                <button className="btn btn-outline" onClick={() => removeOne(it.id)}>삭제</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>합계 {total.toLocaleString()}원</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline" onClick={clearAll}>비우기</button>
              <a href="/checkout" className="btn btn-primary">결제하기</a>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
