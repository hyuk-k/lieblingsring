// app/inquiry/page.tsx
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// ssr: false 제거
const InquiryClient = dynamic(() => import("./InquiryClient"));

export default function InquiryPage() {
  return (
    <main className="container" style={{ padding: "40px 0" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>상담 문의</h1>
      <p style={{ color: "#666", marginTop: 6 }}>
        사이즈 / 재고 / 맞춤 제작 등 무엇이든 남겨주세요. 영업일 기준 24시간 내 답변드립니다.
      </p>

      <Suspense fallback={<div>로딩 중…</div>}>
        <InquiryClient />
      </Suspense>
    </main>
  );
}