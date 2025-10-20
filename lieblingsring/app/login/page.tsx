"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "로그인 실패");
      router.push("/");  // 홈으로
    } catch (err:any) {
      alert(err.message || "에러");
    } finally { setLoading(false); }
  };

  return (
    <section className="container" style={{ padding: "28px 0", maxWidth: 520 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>로그인</h1>
      <form onSubmit={login} style={{ display: "grid", gap: 12 }}>
        <input className="input" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="비밀번호" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary" disabled={loading}>{loading ? "처리 중..." : "로그인"}</button>
      </form>
      <div style={{ marginTop: 10 }}>
        계정이 없으신가요? <Link href="/signup" className="btn btn-outline" style={{ padding: "6px 10px" }}>회원가입</Link>
      </div>
    </section>
  );
}

