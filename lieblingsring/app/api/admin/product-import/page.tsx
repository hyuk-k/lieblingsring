// app/admin/product-import/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  };

  const upload = async () => {
    if (!file) return setError("파일을 선택하세요");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/import-products", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "업로드 실패");
      } else {
        setResult(json);
      }
    } catch (err: any) {
      setError(err?.message || "업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 980 }}>
      <h1>상품 일괄 등록 (CSV / Excel)</h1>
      <p>CSV 또는 XLSX 파일을 업로드하면 상품을 일괄 생성합니다. 헤더: name, price, description, image_urls, slug(optional)</p>

      <div style={{ marginTop: 12 }}>
        <input type="file" accept=".csv,.xls,.xlsx" onChange={onFile} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => router.back()} style={{ marginRight: 8 }}>뒤로</button>
        <button onClick={upload} disabled={!file || loading}>{loading ? "업로드 중..." : "업로드"}</button>
      </div>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div>총 행: {result.total}</div>
          <div>성공: {result.results?.filter((r:any)=>r.ok).length} / 실패: {result.results?.filter((r:any)=>!r.ok).length}</div>

          <details style={{ marginTop: 8 }}>
            <summary>실패 항목</summary>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{JSON.stringify(result.results.filter((r:any)=>!r.ok), null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
