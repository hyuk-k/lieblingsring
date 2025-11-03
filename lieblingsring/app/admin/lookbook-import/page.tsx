// app/admin/lookbook-import/page.tsx
"use client";
import { useState } from "react";

export default function LookbookImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null);

  const upload = async () => {
    if (!file) return setError("파일을 선택하세요");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/import-lookbook", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "업로드 실패");
      } else {
        setResult(json);
      }
    } catch (err: any) {
      setError(err?.message || "업로드 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>룩북 일괄 등록 (CSV / Excel)</h1>
      <input type="file" accept=".csv,.xls,.xlsx" onChange={onFile} />
      <div style={{ marginTop: 12 }}>
        <button onClick={upload} disabled={!file || loading}>{loading ? "업로드 중..." : "업로드"}</button>
      </div>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <div>총행: {result.total}</div>
          <div>성공: {result.results?.filter((r:any)=>r.ok).length} / 실패: {result.results?.filter((r:any)=>!r.ok).length}</div>
          <details>
            <summary>실패 항목</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.results.filter((r:any)=>!r.ok), null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
