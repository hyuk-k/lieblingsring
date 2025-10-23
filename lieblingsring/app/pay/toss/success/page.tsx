// app/pay/toss/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

export default function TossSuccessPage() {
  const sp = useSearchParams();
  const paymentKey = sp?.get("paymentKey") ?? "";
  const orderId = sp?.get("orderId") ?? "";
  const amount = sp?.get("amount") ?? "";

  return (
    <div>
      <h1>결제 성공</h1>
      <p>orderId: {orderId}</p>
      <p>paymentKey: {paymentKey}</p>
      <p>amount: {amount}</p>
    </div>
  );
}