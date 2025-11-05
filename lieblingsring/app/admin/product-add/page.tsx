// lieblingsring/lieblingsring/app/admin/product-add/page.tsx
"use client";

import React, { useState } from "react";

export default function AdminProductAddPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [subcategory, setSubcategory] = useState<"jewelry" | "smallitem" | "other">("jewelry");
  const [loading, setLoading] = useState(false);

  const MAX_PER_FILE = 10 * 1024 * 1024;
  const MAX_FILES = 6;

  function validateFiles(fls: FileList | null) {
    if (!fls) return { ok: true };
    if (fls.length > MAX_FILES) return { ok: false, message: `최대 ${MAX_FILES}장` };
    for (const f of Array.from(fls)) {
      if (f.size > MAX_PER_FILE) return { ok: false, message: `${f.name} 10MB 초과` };
    }
    return { ok: true };
  }

  async function uploadImagesToServer(fileList: FileList | null) {
    // 이미 Cloudinary 업로드 흐름이 있다면 여기서 사용
    // (이미지를 직접 업로드해 URL 배열을 획득한 뒤 서버에 전달)
    // 예시: 간단히 이미지가 이미 URL 배열로 준비되어 있다고 가정
    return [] as string[];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return alert("상품명 입력");
    if (!price || Number.isNaN(Number(price))) return alert("가격 입력");

    const v = validateFiles(images);
    if (!v.ok) return alert(v.message);

    setLoading(true);
    try {
      const imageUrls = await uploadImagesToServer(images); // 실제 구현에 맞게 교체

      const res = await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          images: imageUrls,
          subcategory,
        }),
      });

      const json = await res.json().catch(async () => {
        const text = await res.text();
        throw new Error("서버 응답 오류: " + text);
      });

      if (!res.ok) throw new Error(json?.message || "서버 오류");

      alert("상품 생성 완료");
      setName("");
      setPrice("");
      setDescription("");
      setImages(null);
    } catch (err: any) {
      console.error("product add error:", err);
      alert("오류: " + (err?.message || "알 수 없음"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>상품 추가</h1>

      <div>
        {/* 탭 UI */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={() => setSubcategory("jewelry")} style={{ background: subcategory === "jewelry" ? "#000" : "#fff", color: subcategory === "jewelry" ? "#fff" : "#000" }}>장신구</button>
          <button type="button" onClick={() => setSubcategory("smallitem")} style={{ background: subcategory === "smallitem" ? "#000" : "#fff", color: subcategory === "smallitem" ? "#fff" : "#000" }}>소품</button>
          <button type="button" onClick={() => setSubcategory("other")} style={{ background: subcategory === "other" ? "#000" : "#fff", color: subcategory === "other" ? "#fff" : "#000" }}>기타</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label>상품명</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>가격</label>
            <input value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
          <div>
            <label>설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label>이미지 (최대 6장, 각 10MB)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={loading}>{loading ? "처리중..." : "저장"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}