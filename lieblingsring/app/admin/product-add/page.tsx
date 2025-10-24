"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductAdd() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl) return;
    const arr = Array.from(fl).slice(0, 6); // 최대 6장 제한
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1) 이미지 업로드
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));

      const upRes = await fetch("/api/uploads", { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upJson.ok) throw new Error(upJson.message || "이미지 업로드 실패");

      const imageUrls = upJson.images.map((it: any) => it.url);

      // 2) 상품 생성
      const createRes = await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price), description, imageUrls }),
      });
      const createJson = await createRes.json();
      if (!createJson.ok) throw new Error(createJson.message || "상품 생성 실패");

      router.push("/admin/product"); // 목록으로 이동(경로에 맞게 조정)
    } catch (err: any) {
      console.error(err);
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 900 }}>
      <h2>상품 추가</h2>

      <label>상품명</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />

      <label>가격</label>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} required />

      <label>이미지 (최대 6장)</label>
      <input type="file" accept="image/*" multiple onChange={onFiles} />

      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {previews.map((p, i) => (
          <div key={i} style={{ width: 120, height: 120, overflow: "hidden", borderRadius: 6, border: "1px solid #eee" }}>
            <img src={p} alt={`preview-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      <label style={{ marginTop: 12 }}>상세설명</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
      </div>
    </form>
  );
}
