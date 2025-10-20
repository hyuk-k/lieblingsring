"use client";
import { useEffect, useState } from "react";

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data || []);
    })();
  }, []);

  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>주문내역</h1>

      {orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <ul style={{ display: "grid", gap: 16 }}>
          {orders.map((o) => (
            <li
              key={o.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                display: "grid",
                gap: 6,
              }}
            >
              <b>주문번호: {o.id}</b>
              <div>결제금액: {o.total.toLocaleString()}원</div>
              <div>상태: {o.status}</div>
              <div>주문일: {new Date(o.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
