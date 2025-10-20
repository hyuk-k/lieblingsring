// app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) r.replace("/admin");
    else alert("비밀번호가 올바르지 않습니다.");
  };

  return (
    <section className="container" style={{ padding: "28px 0", maxWidth: 400 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>관리자 로그인</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          type="password"
          placeholder="ADMIN_PASS"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </section>
  );
}
