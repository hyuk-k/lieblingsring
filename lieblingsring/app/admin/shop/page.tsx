"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminShopPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/products");
      setProducts(await res.json());
    })();
  }, []);

  return (
    <section>
      <h1 style={{fontSize:24, fontWeight:800}}>상품 관리</h1>
      <Link href="/admin/shop/new" className="btn btn-primary" style={{marginTop:12}}>상품 추가</Link>

      <table style={{width:"100%", marginTop:20, borderCollapse:"collapse"}}>
        <thead>
          <tr style={{background:"#f5f5f5"}}>
            <th>이름</th><th>가격</th><th>상태</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{borderBottom:"1px solid #eee"}}>
              <td>{p.name}</td>
              <td>{p.price.toLocaleString()}원</td>
              <td>{p.status}</td>
              <td><Link href={`/admin/shop/${p.id}`}>수정</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

