// app/pay/toss/fail/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

export default function TossFailPage() {
  const sp = useSearchParams();
  const code = sp?.get("code") ?? "";
  const message = sp?.get("message") ?? "";

  return (
    <div>
      <h1>결제 실패</h1>
      <p>{code}</p>
      <p>{message}</p>
    </div>
  );
}