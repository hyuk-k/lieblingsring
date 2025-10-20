"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  orderNo: string;
  buyer: string;
  total: number;
  status: "READY" | "PAID" | "CANCEL";
  createdAt: string;
};

export default function AdminOrderPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/admin/orders", { cache: "no-store" });
        const data = await r.json();
        if (alive) setRows(data.items ?? []);
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="container" style={{ padding: "28px 0" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>주문 관리</h1>

      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="muted">주문이 없습니다.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>주문번호</th>
                <th style={{ padding: 8 }}>구매자</th>
                <th style={{ padding: 8 }}>금액</th>
                <th style={{ padding: 8 }}>상태</th>
                <th style={{ padding: 8 }}>일시</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: 8 }}>{o.orderNo}</td>
                  <td style={{ padding: 8 }}>{o.buyer}</td>
                  <td style={{ padding: 8 }}>{o.total.toLocaleString()}원</td>
                  <td style={{ padding: 8 }}>{o.status}</td>
                  <td style={{ padding: 8 }}>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

