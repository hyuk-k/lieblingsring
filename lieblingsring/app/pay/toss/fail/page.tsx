"use client";

import { useSearchParams } from "next/navigation";

export default function TossFailPage() {
  const sp = useSearchParams();
  const code = sp.get("code");
  const message = sp.get("message");

  return (
    <section className="container" style={{ padding: "28px 0" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>결제 실패</h1>
      <p style={{ marginTop: 12 }}>사유: {code} / {message}</p>
    </section>
  );
}

