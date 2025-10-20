"use client";

import { useEffect, useState } from "react";

type Notice = {
  id: string;
  type: "NOTICE" | "QNA";
  title: string;
  createdAt: string;
};

export default function AdminNoticePage() {
  const [rows, setRows] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/admin/notices", { cache: "no-store" });
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
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>공지/Q&A 관리</h1>

      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="muted">등록된 글이 없습니다.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8, width: 120 }}>구분</th>
                <th style={{ padding: 8 }}>제목</th>
                <th style={{ padding: 8, width: 200 }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: 8 }}>{n.type}</td>
                  <td style={{ padding: 8 }}>{n.title}</td>
                  <td style={{ padding: 8 }}>{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

