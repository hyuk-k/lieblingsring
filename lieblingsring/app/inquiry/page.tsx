"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function InquiryPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:"", contact:"", product: sp.get("product") || "", type:"상품", message:"", source: sp.get("source") || "direct"
  });

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/inquiry", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) router.push("/inquiry/thanks"); else alert("문의 접수 실패");
  };

  return (
    <div className="py-10" style={{maxWidth:640}}>
      <h1 style={{fontSize:24, fontWeight:700}}>상담 문의</h1>
      <p style={{color:"#666", marginTop:6}}>사이즈/재고/맞춤 제작 등 무엇이든 남겨주세요. 영업일 기준 24시간 내 답변드립니다.</p>
      <form onSubmit={submit} style={{marginTop:16, display:"grid", gap:10}}>
        <input required className="input" placeholder="이름" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input required className="input" placeholder="연락처(휴대전화 또는 이메일)" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})}/>
        <input className="input" placeholder="관심 상품" value={form.product} onChange={e=>setForm({...form, product:e.target.value})}/>
        <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
          <option>상품</option><option>사이즈</option><option>배송</option><option>맞춤 제작</option>
        </select>
        <textarea required className="textarea" placeholder="문의 내용" value={form.message} onChange={e=>setForm({...form, message:e.target.value})}/>
        <label style={{fontSize:12, color:"#666"}}>개인정보 수집·이용에 동의합니다(3년 보관).</label>
        <button className="btn btn-primary" disabled={loading}>{loading ? "전송 중..." : "문의 보내기"}</button>
      </form>
    </div>
  );
}
