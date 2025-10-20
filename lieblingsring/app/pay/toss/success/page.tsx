"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TossSuccessPage() {
  const sp = useSearchParams();
  const [msg, setMsg] = useState("결제 확인 중...");

  useEffect(() => {
    (async () => {
      const paymentKey = sp.get("paymentKey");
      const orderId = sp.get("orderId");
      const amount = sp.get("amount");
      if (!paymentKey || !orderId || !amount) {
        setMsg("필수 값이 없습니다.");
        return;
      }

      const res = await fetch("/api/payments/toss/confirm", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) })
      });
      const data = await res.json();
      if (res.ok) setMsg("결제가 완료되었습니다. 주문번호: " + data.orderId);
      else setMsg("승인 실패: " + (data.message || "알 수 없는 오류"));
    })();
  }, [sp]);

  return (
    <section className="container" style={{ padding: "28px 0" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>결제 결과</h1>
      <p style={{ marginTop: 12 }}>{msg}</p>
    </section>
  );
}

