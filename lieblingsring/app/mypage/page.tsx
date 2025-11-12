// app/mypage/page.tsx
import QnaCreateClient from '../community/qna/QnaCreateClient';
import { prisma } from '@/lib/db';
import type { Qna, Order, OrderItem, Payment } from '@prisma/client';

export const revalidate = 0;

type OrderWithItems = Order & {
  items: (OrderItem & { product?: { id: string; name?: string; title?: string } })[];
  payments: Payment[];
};

export default async function MyPage() {
  // Q&A 목록(서버에서 가져오기)
  let qnas: Qna[] = [];
  try {
    qnas = await prisma.qna.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (e) {
    console.error('QnaPage prisma error', e);
  }

  // 주문 조회: ordersRaw를 const로 직접 할당해 타입 추론 보장
  let orders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: { id: string; quantity: number; price: number; product?: { id: string; title?: string } }[];
    payments: Payment[];
  }[] = [];

  try {
    const ordersRaw = (await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    })) as OrderWithItems[];

    orders = ordersRaw.map((o) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
      items: (o.items ?? []).map((it) => ({
        id: it.id,
        quantity: (it as any).quantity ?? (it as any).qty ?? 0,
        price: (it as any).price ?? 0,
        product: it.product ? { id: (it.product as any).id, title: (it.product as any).name ?? (it.product as any).title } : undefined,
      })),
      payments: o.payments ?? [],
    }));
  } catch (e) {
    console.error('MyPage orders fetch error', e);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>마이페이지</h1>

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
            orders.map((o) => (
              <li key={o.id} style={{ marginBottom: 12 }}>
                <div>주문번호: {o.id}</div>
                <div>총금액: {o.totalAmount}</div>
                <div>결제건수: {o.payments?.length ?? 0}</div>
                <details>
                  <summary>항목 보기</summary>
                  <ul>
                    {o.items.map((it) => (
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