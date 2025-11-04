// lieblingsring/lieblingsring/app/admin/product-add/page.tsx
"use client";

import React, { useState } from "react";

type UploadResult = {
  ok: boolean;
  url?: string;
  message?: string;
};

export default function AdminProductAddPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const MAX_PER_FILE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 6;

  function validateFiles(fls: FileList | null) {
    if (!fls || fls.length === 0) return { ok: false, message: "파일을 선택하세요." };
    if (fls.length > MAX_FILES) return { ok: false, message: `최대 ${MAX_FILES}장까지 업로드 가능합니다.` };
    for (const f of Array.from(fls)) {
      if (f.size > MAX_PER_FILE) return { ok: false, message: `${f.name}의 용량이 10MB를 초과합니다.` };
    }
    return { ok: true };
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fls = e.target.files;
    setFiles(fls);
    if (!fls) {
      setPreviews([]);
      return;
    }
    const arr = Array.from(fls).map((f) => URL.createObjectURL(f));
    setPreviews(arr);
  }

  async function fetchSignature() {
    const res = await fetch("/api/uploads/sign");
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json?.message || "signature 획득 실패");
    return json as { signature: string; timestamp: number; cloudName: string; apiKey: string };
  }

  async function uploadFileToCloudinary(file: File, signData: { signature: string; timestamp: number; cloudName: string; apiKey: string }): Promise<UploadResult> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", signData.apiKey);
    fd.append("timestamp", String(signData.timestamp));
    fd.append("signature", signData.signature);
    // 옵션: folder 등 추가 가능
    try {
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const cloudJson = await cloudRes.json();
      if (!cloudRes.ok) return { ok: false, message: cloudJson?.error?.message || "Cloudinary 업로드 실패" };
      return { ok: true, url: cloudJson.secure_url };
    } catch (err: any) {
      console.error("cloud upload error:", err);
      return { ok: false, message: err?.message || "업로드 중 오류" };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return alert("상품명을 입력하세요.");
    if (!price || Number.isNaN(Number(price))) return alert("유효한 가격을 입력하세요.");
    const v = validateFiles(files);
    if (!v.ok) return alert(v.message);

    setLoading(true);
    try {
      const signData = await fetchSignature();

      // 여러 파일을 병렬 업로드
      const fileList = Array.from(files || []);
      const uploadPromises = fileList.map((f) => uploadFileToCloudinary(f, signData));
      const results = await Promise.all(uploadPromises);

      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        alert("이미지 업로드 실패: " + failed.map((f) => f.message).join(", "));
        setLoading(false);
        return;
      }

      const imageUrls = results.map((r) => r.url!) ;

      // 이제 서버에 제품 생성 요청 (images: string[])
      const createRes = await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          images: imageUrls,
        }),
      });

      let createJson;
      try {
        createJson = await createRes.json();
      } catch (err) {
        const text = await createRes.text();
        console.error("create product non-json response:", text);
        throw new Error("상품 생성 중 서버 오류: " + (text || createRes.statusText));
      }

      if (!createRes.ok) {
        alert("상품 생성 실패: " + (createJson?.message || "서버 오류"));
        setLoading(false);
        return;
      }

      alert("상품이 성공적으로 생성되었습니다.");
      // 초기화
      setName("");
      setPrice("");
      setDescription("");
      setFiles(null);
      setPreviews([]);
    } catch (err: any) {
      console.error("AdminProductAdd error:", err);
      alert("오류: " + (err?.message || "알 수 없는 오류"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>상품 추가</h1>
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
          <input type="file" multiple accept="image/*" onChange={onFileChange} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {previews.map((p, i) => (
            <img key={i} src={p} alt={`preview-${i}`} style={{ width: 120, height: 120, objectFit: "cover" }} />
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? "업로드 중..." : "저장"}</button>
        </div>
      </form>
    </main>
  );
}