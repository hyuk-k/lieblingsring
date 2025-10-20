"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLookbook() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(()=>{
    (async()=>{
      const res = await fetch("/api/admin/lookbook");
      setItems(await res.json());
    })();
  },[]);

  return (
    <section>
      <h1 style={{fontSize:24, fontWeight:800}}>룩북 관리</h1>
      <Link href="/admin/lookbook/new" className="btn btn-primary" style={{marginTop:12}}>추가</Link>

      <div className="grid" style={{gap:16, marginTop:20, gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))"}}>
        {items.map(it => (
          <Link href={`/admin/lookbook/${it.id}`} key={it.id} style={{border:"1px solid #eee", padding:8}}>
            <img src={it.image} alt={it.title} style={{width:"100%", aspectRatio:"1/1", objectFit:"cover"}} />
            <div>{it.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

