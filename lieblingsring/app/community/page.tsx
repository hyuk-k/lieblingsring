"use client";

import { useState } from "react";

type Tab = "notice" | "qna";

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>("notice");

  return (
    <section className="container" style={{ padding: "28px 0", maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>community</h1>
      <div className="tabs" style={{ marginBottom: 12 }}>
        <button className={`tab ${tab==="notice"?"is-active":""}`} onClick={()=>setTab("notice")}>공지사항</button>
        <button className={`tab ${tab==="qna"?"is-active":""}`} onClick={()=>setTab("qna")}>Q&A</button>
      </div>

      {tab==="notice" ? (
        <ul style={{ display: "grid", gap: 10 }}>
          {/* 공지 리스트 */}
          <li style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <b>[공지] 배송 안내</b>
            <div className="muted" style={{ marginTop: 6 }}>배송비 / 출고일 변경 안내</div>
          </li>
        </ul>
      ) : (
        <ul style={{ display: "grid", gap: 10 }}>
          {/* Q&A 리스트 */}
          <li style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <b>반지 사이즈 문의</b>
            <div className="muted" style={{ marginTop: 6 }}>정사이즈 추천 / 교환 안내</div>
          </li>
        </ul>
      )}
    </section>
  );
}
