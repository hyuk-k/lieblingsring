// app/mypage/page.tsx
import QnaCreateClient from '../community/qna/QnaCreateClient';
import { prisma } from '@/lib/db';
import type { Qna } from '@prisma/client';

export const revalidate = 0;

export default async function QnaPage() {
  let qnas: Qna[] = [];
  try {
    qnas = await prisma.qna.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (e) {
    console.error('QnaPage prisma error', e);
  }

  // 주문 조회(타입 추론 오류 방지: const로 직접 할당)
  let orders = [];
  try {
    const ordersRaw = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });

    // ordersRaw를 화면에 맞게 매핑
    orders = ordersRaw.map((o: any) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt?.toISOString?.() ?? String(o.createdAt),
      items: (o.items ?? []).map((it: any) => ({
        id: it.id,
        quantity: it.quantity ?? it.qty ?? 0,
        price: it.price,
        product: it.product ? { id: it.product.id, title: it.product.name ?? it.product.title } : null,
      })),
      payments: o.payments ?? [],
    }));
  } catch (e) {
    console.error('MyPage orders fetch error', e);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Q&A</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>질문 등록</h2>
        <QnaCreateClient onCreated={() => { /* 목록 갱신 로직 추가 */ }} />
      </section>

      <section>
        <h2>최근 주문</h2>
        <ul>
          {orders.length === 0 ? (
            <li>주문이 없습니다.</li>
          ) : (
            orders.map((o: any) => (
              <li key={o.id} style={{ marginBottom: 12 }}>
                <div>주문번호: {o.id}</div>
                <div>총금액: {o.totalAmount}</div>
                <div>결제건수: {o.payments?.length ?? 0}</div>
                <details>
                  <summary>항목 보기</summary>
                  <ul>
                    {o.items.map((it: any) => (
                      <li key={it.id}>
                        {it.product?.title ?? '상품'} x{it.quantity} — {it.price}원
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))
          )}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Q&A 목록</h2>
        <ul>
          {qnas.map((q) => (
            <li key={q.id}>{q.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}