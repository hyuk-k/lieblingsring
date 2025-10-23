// app/error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    // 빌드/실행 중 에러를 서버 콘솔/클라이언트 콘솔에 찍어 원인 파악에 도움을 줌
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <main style={{ padding: 40 }}>
      <h1>앗 — 오류가 발생했습니다</h1>
      <p>예기치 못한 오류가 발생하여 페이지를 표시할 수 없습니다.</p>
      <details style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
        <summary>오류 정보(개발용)</summary>
        {String(error?.message ?? "No error message")}
      </details>
    </main>
  );
}
