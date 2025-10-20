"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LookbookNewPage() {
  const [form, setForm] = useState({ title: "", caption: "", image: "" });
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: data });
    const result = await res.json();

    if (res.ok && result.url) setForm((prev) => ({ ...prev, image: result.url }));
    else alert(result.message || "업로드 실패");
    setUploading(false);
  };

  const save = async () => {
    const res = await fetch("/api/admin/lookbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/admin/lookbook");
    else alert("저장 실패");
  };

  return (
    <section>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>룩북 추가</h1>

      <input
        className="input"
        placeholder="제목"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        className="textarea"
        placeholder="설명"
        value={form.caption}
        onChange={(e) => setForm({ ...form, caption: e.target.value })}
      />

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>대표 이미지</label>
        {form.image ? (
          <img src={form.image} alt="미리보기" style={{ width: 280, borderRadius: 8, marginBottom: 8 }} />
        ) : null}
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      </div>

      <button className="btn btn-primary" onClick={save} disabled={uploading}>
        {uploading ? "이미지 업로드 중..." : "저장"}
      </button>
    </section>
  );
}

