"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "회원가입 실패");
      alert("가입이 완료되었습니다. 로그인해 주세요.");
      router.push("/login");
    } catch (err:any) {
      alert(err.message || "에러");
    } finally { setLoading(false); }
  };

  return (
    <section className="container" style={{ padding: "28px 0", maxWidth: 520 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>회원가입</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input className="input" name="email" placeholder="이메일" value={form.email} onChange={onChange} />
        <input className="input" type="password" name="password" placeholder="비밀번호" value={form.password} onChange={onChange} />
        <input className="input" name="name" placeholder="이름(선택)" value={form.name} onChange={onChange} />
        <input className="input" name="phone" placeholder="연락처(선택)" value={form.phone} onChange={onChange} />
        <button className="btn btn-primary" disabled={loading}>{loading ? "처리 중..." : "가입하기"}</button>
      </form>
    </section>
  );
}

