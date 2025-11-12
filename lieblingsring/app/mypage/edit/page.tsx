// app/mypage/edit/page.tsx
"use client";

import { useState } from "react";

export default function MyPageEdit() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/mypage/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password: password || undefined }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setStatusMsg("정보가 수정되었습니다.");
      } else {
        setStatusMsg(data?.message || "수정에 실패했습니다.");
      }
    } catch (err: any) {
      setStatusMsg(err.message || "서버 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>회원정보 수정</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 12 }}>
          <label>이름</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" style={{ width: "100%", padding: 8 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>비밀번호 (변경 시 입력)</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="새 비밀번호" style={{ width: "100%", padding: 8 }} />
        </div>

        {statusMsg && <div style={{ marginBottom: 12 }}>{statusMsg}</div>}

        <div>
          <button type="submit" disabled={loading}>{loading ? "저장 중..." : "수정 저장"}</button>
        </div>
      </form>
    </main>
  );
}
