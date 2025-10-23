"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  // 필요 시 필드 추가
};

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json().catch(() => null);

        // 안전하게 응답 형태 검사
        // 1) API가 배열을 직접 반환한 경우
        if (Array.isArray(data)) {
          setOrders(data);
        }
        // 2) API가 { ok: true, data: [...] } 형태로 반환한 경우
        else if (data && Array.isArray(data.data)) {
          setOrders(data.data);
        }
        // 3) API가 { orders: [...] } 같은 별도 키를 사용하는 경우
        else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        // 4) 응답이 예상과 다르면 빈 배열 + 에러 메시지 설정(옵션)
        else {
          console.warn("Unexpected /api/orders response:", data);
          setOrders([]);
          // 선택적으로 에러 표시:
          // setError("주문 데이터를 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("fetch /api/orders error:", err);
        setError("주문 목록을 불러오는 중 오류가 발생했습니다.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="container" style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>주문내역</h1>
        <p>불러오는 중…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container" style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>주문내역</h1>
        <p style={{ color: "crimson" }}>{error}</p>
      </section>
    );
  }

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
              <div>결제금액: {(o.totalAmount ?? 0).toLocaleString()}원</div>
              <div>상태: {o.status ?? "-"}</div>
              <div>주문일: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}