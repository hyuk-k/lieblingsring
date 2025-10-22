"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export default function InquiryPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    product: sp.get("product") || "",
    type: "상품",
    message: "",
    source: sp.get("source") || "direct",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "문의 접수 실패");
        return;
      }

      // ✅ 문의 성공 → thank you 페이지로 이동
      router.push("/inquiry/thanks");
    } catch (err) {
      console.error(err);
      alert("서버 통신 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 container" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>상담 문의</h1>
      <p style={{ color: "#666", marginTop: 6 }}>
        사이즈 / 재고 / 맞춤 제작 등 무엇이든 남겨주세요. 영업일 기준 24시간 내 답변드립니다.
      </p>

      <form onSubmit={submit} style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <input
          required
          name="name"
          className="input"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
        />
        <input
          required
          name="contact"
          className="input"
          placeholder="연락처 (휴대전화 또는 이메일)"
          value={form.contact}
          onChange={handleChange}
        />
        <input
          name="product"
          className="input"
          placeholder="관심 상품"
          value={form.product}
          onChange={handleChange}
        />
        <select
          name="type"
          className="input"
          value={form.type}
          onChange={handleChange}
        >
          <option value="상품">상품</option>
          <option value="사이즈">사이즈</option>
          <option value="배송">배송</option>
          <option value="맞춤 제작">맞춤 제작</option>
        </select>
        <textarea
          required
          name="message"
          className="textarea"
          placeholder="문의 내용"
          value={form.message}
          onChange={handleChange}
        />
        <label style={{ fontSize: 12, color: "#666" }}>
          개인정보 수집·이용에 동의합니다 (3년 보관).
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "전송 중..." : "문의 보내기"}
        </button>
      </form>
    </div>
  );
}
