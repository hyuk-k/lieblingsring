"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminProductForm() {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const [form, setForm] = useState({ name:"", price:0, summary:"", description:"", status:"ACTIVE" });

  useEffect(() => {
    if (id) (async()=>{
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      setForm(data);
    })();
  }, [id]);

  const save = async () => {
    const method = id ? "PUT" : "POST";
    const res = await fetch(`/api/admin/products${id?`/${id}`:""}`, {
      method,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    if (res.ok) router.push("/admin/shop");
    else alert("저장 실패");
  };

  return (
    <section>
      <h1 style={{fontSize:22, fontWeight:700}}>{id?"상품 수정":"상품 추가"}</h1>
      <input className="input" placeholder="상품명" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
      <input className="input" placeholder="가격" type="number" value={form.price} onChange={e=>setForm({...form,price:+e.target.value})} />
      <textarea className="textarea" placeholder="요약" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} />
      <textarea className="textarea" placeholder="상세설명" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <button className="btn btn-primary" onClick={save}>저장</button>
    </section>
  );
}

