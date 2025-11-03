// lieblingsring/lieblingsring/app/admin/product-add/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadWithProgress } from "@/components/uploadWithProgress"; // 반드시 생성되어 있어야 합니다

const MAX_FILES = 6;
const MAX_BYTES = 6 * 1024 * 1024; // 6MB

export default function AdminProductAdd() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // 0..100

  // revoke Object URLs on unmount or when previews change
  const prevUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    const prev = prevUrlsRef.current;
    return () => {
      (prev || []).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);
  useEffect(() => {
    // cleanup previous when localPreviews changes
    prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    prevUrlsRef.current = localPreviews.slice();
  }, [localPreviews]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl) return;
    const arr = Array.from(fl).slice(0, MAX_FILES);
    // client-side validation
    for (const f of arr) {
      if (!f.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      if (f.size > MAX_BYTES) {
        setError("파일이 너무 큽니다(최대 6MB).");
        return;
      }
    }
    setFiles(arr);
    setLocalPreviews(arr.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("상품명을 입력하세요.");
    if (!price || Number(price) <= 0) return setError("유효한 가격을 입력하세요.");

    setLoading(true);
    setProgress(0);
    try {
      let imageUrls: string[] = [];

      // 1) 이미지가 선택되어 있으면 업로드 (진행률 반영)
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));

        // uploadWithProgress는 XHR을 사용해 progress 콜백을 제공합니다.
        const res = await uploadWithProgress("/api/uploads", fd, (pct) => {
          setProgress(pct);
        });

        // 서버 응답을 읽습니다
        const upJson = await res.json();
        if (!res.ok || !upJson?.ok) {
          throw new Error(upJson?.message || "이미지 업로드 실패");
        }

        const images = Array.isArray(upJson.images) ? upJson.images : [];
        imageUrls = images.map((it: any) => it.url).filter(Boolean);
        setUploadedUrls(imageUrls);
        setProgress(100);
      }

      // 2) 상품 생성 호출
      const createRes = await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          summary,
          description,
          imageUrls,
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok || !createJson?.ok) {
        // 필요 시 업로드된 이미지 롤백(삭제) 로직 추가 가능
        throw new Error(createJson?.message || "상품 생성 실패");
      }

      // 성공하면 목록으로 이동하거나 새로 만든 상품 미리보기로 이동
      router.push("/admin/product");
    } catch (err: any) {
      console.error("AdminProductAdd error:", err);
      setError(err?.message || "서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      // 진행률 초기화(짧은 시간 뒤)
      setTimeout(() => setProgress(0), 400);
    }
  };

  // optional: remove a selected local file before upload
  const removeLocalFile = (index: number) => {
    const newFiles = files.slice();
    const newPreviews = localPreviews.slice();
    // revoke the object URL
    const url = newPreviews[index];
    if (url) URL.revokeObjectURL(url);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setLocalPreviews(newPreviews);
  };

  return (
    <div style={{ padding: 20, maxWidth: 980 }}>
      <h1>상품 추가</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: 12 }}>
          <label htmlFor="name">상품명</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="price">가격</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} required />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="summary">요약</label>
          <input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="description">상세설명</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="images">이미지 (최대 {MAX_FILES}장, 각 6MB 이하)</label>
          <input id="images" type="file" accept="image/*" multiple onChange={onFiles} />
        </div>

        {/* 로컬 미리보기(선택 후) */}
        {localPreviews.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {localPreviews.map((p, i) => (
              <div key={i} style={{ width: 120, height: 120, position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                <img src={p} alt={`preview-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={() => removeLocalFile(i)} aria-label={`이미지 ${i + 1} 제거`} style={{ position: "absolute", top: 6, right: 6 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* 업로드 진행률 바 */}
        {progress > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ width: "100%", background: "#eee", height: 8, borderRadius: 4 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#111", borderRadius: 4, transition: "width 0.2s linear" }} />
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>{progress}% 업로드 중...</div>
          </div>
        )}

        {/* 업로드 후 서버에서 반환된 이미지 미리보기(선택적) */}
        {uploadedUrls.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h4>업로드된 이미지</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {uploadedUrls.map((u, i) => (
                <div key={i} style={{ width: 120, height: 120, overflow: "hidden", borderRadius: 6, border: "1px solid #eee" }}>
                  <img src={u} alt={`uploaded-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div role="alert" style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
          <button type="button" onClick={() => router.back()} style={{ marginLeft: 8 }}>취소</button>
        </div>
      </form>
    </div>
  );
}