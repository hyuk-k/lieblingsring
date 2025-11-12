// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CartItem = { id: string; name: string; price: number; qty: number; image?: string | null };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [mutating, setMutating] = useState<boolean>(false); // 중복 요청 방지
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/cart', { cache: 'no-store' });
      if (!r.ok) throw new Error(`서버 응답 오류: ${r.status}`);
      const d = await r.json();
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } catch (err: any) {
      console.error('cart reload error', err);
      setError(err?.message || '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const setQty = async (id: string, qty: number) => {
    if (mutating) return;
    if (qty < 1) qty = 1;
    setMutating(true);
    setError(null);
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, qty }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`수량 변경 실패: ${res.status} ${body}`);
      }
      await reload();
    } catch (err: any) {
      console.error('setQty error', err);
      setError(err?.message || '수량 변경 중 오류가 발생했습니다.');
    } finally {
      setMutating(false);
    }
  };

  const removeOne = async (id: string) => {
    if (mutating) return;
    setMutating(true);
    setError(null);
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`삭제 실패: ${res.status} ${body}`);
      }
      await reload();
    } catch (err: any) {
      console.error('removeOne error', err);
      setError(err?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setMutating(false);
    }
  };

  const clearAll = async () => {
    if (mutating) return;
    if (!confirm('장바구니를 비우시겠습니까?')) return;
    setMutating(true);
    setError(null);
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`전체 비우기 실패: ${res.status} ${body}`);
      }
      await reload();
    } catch (err: any) {
      console.error('clearAll error', err);
      setError(err?.message || '비우기 중 오류가 발생했습니다.');
    } finally {
      setMutating(false);
    }
  };

  return (
    <section className="container" style={{ padding: '28px 0' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>장바구니</h1>

      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <p>{error}</p>
          <button onClick={reload}>다시 시도</button>
        </div>
      ) : items.length === 0 ? (
        <div>
          <p className="muted">장바구니가 비었습니다.</p>
          <div style={{ marginTop: 12 }}>
            <Link href="/shop"><button className="btn btn-primary">쇼핑하러 가기</button></Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #eee', borderRadius: 10, padding: 10 }}>
                <img src={it.image || '/placeholder.jpg'} alt={it.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div className="muted">{it.price.toLocaleString()}원</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="btn btn-outline" onClick={() => setQty(it.id, Math.max(1, it.qty - 1))} disabled={mutating}>-</button>
                  <span>{it.qty}</span>
                  <button className="btn btn-outline" onClick={() => setQty(it.id, it.qty + 1)} disabled={mutating}>+</button>
                </div>
                <button className="btn btn-outline" onClick={() => removeOne(it.id)} disabled={mutating}>삭제</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>합계 {total.toLocaleString()}원</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" onClick={clearAll} disabled={mutating}>비우기</button>
              <Link href="/checkout"><a className="btn btn-primary" aria-disabled={mutating}>결제하기</a></Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}