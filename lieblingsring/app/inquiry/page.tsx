"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";

type FormState = {
  name: string;
  contact: string;
  product: string;
  type: string;
  message: string;
  source: string;
};

export default function InquiryPage() {
  const sp = useSearchParams();
  const router = useRouter();

  // searchParams는 상황에 따라 null일 수 있으므로 안전하게 처리
  const initialProduct = sp?.get("product") ?? "";
  const initialSource = sp?.get("source") ?? "direct";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    contact: "",
    product: initialProduct,
    type: "상품",
    message: "",
    source: initialSource,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (f: FormState) => {
    if (!f.name.trim()) return "이름을 입력해 주세요.";
    if (!f.contact.trim()) return "연락처(휴대전화 또는 이메일)를 입력해 주세요.";
    if (!f.message.trim()) return "문의 내용을 입력해 주세요.";
    // 추가 유효성: 이메일/전화 포맷 검사(선택사항)
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const v = validate(form);
    if (v) {
      setErrorMessage(v);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.message || "문의 접수에 실패했습니다.");
        return;
      }

      // 성공: 감사 페이지로 이동
      router.push("/inquiry/thanks");
    } catch (err) {
      console.error("inquiry submit error:", err);
      setErrorMessage("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
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
        <label className="sr-only" htmlFor="name">이름</label>
        <input
          id="name"
          required
          name="name"
          className="input"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          aria-label="이름"
        />

        <label className="sr-only" htmlFor="contact">연락처</label>
        <input
          id="contact"
          required
          name="contact"
          className="input"
          placeholder="연락처 (휴대전화 또는 이메일)"
          value={form.contact}
          onChange={handleChange}
          aria-label="연락처"
        />

        <label className="sr-only" htmlFor="product">관심 상품</label>
        <input
          id="product"
          name="product"
          className="input"
          placeholder="관심 상품"
          value={form.product}
          onChange={handleChange}
          aria-label="관심 상품"
        />

        <label className="sr-only" htmlFor="type">문의 유형</label>
        <select
          id="type"
          name="type"
          className="input"
          value={form.type}
          onChange={handleChange}
          aria-label="문의 유형"
        >
          <option value="상품">상품</option>
          <option value="사이즈">사이즈</option>
          <option value="배송">배송</option>
          <option value="맞춤 제작">맞춤 제작</option>
        </select>

        <label className="sr-only" htmlFor="message">문의 내용</label>
        <textarea
          id="message"
          required
          name="message"
          className="textarea"
          placeholder="문의 내용"
          value={form.message}
          onChange={handleChange}
          aria-label="문의 내용"
          rows={6}
        />

        <label style={{ fontSize: 12, color: "#666" }}>
          개인정보 수집·이용에 동의합니다 (3년 보관).
        </label>

        {errorMessage && (
          <div role="alert" style={{ color: "crimson", fontSize: 14 }}>
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "전송 중..." : "문의 보내기"}
        </button>
      </form>
    </div>
  );
}