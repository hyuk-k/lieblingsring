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

  // 주문 조회(여기에서 변경된 include 사용)
  let ordersRaw = [];
  try {
    ordersRaw = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: { include: { product: true } },
        payments: true, // <-- 여기서 반드시 'payments' (복수) 로 사용
      },
    });
  } catch (e) {
    console.error('MyPage orders fetch error', e);
  }

  // ordersRaw를 화면에 맞게 매핑
  const orders = (ordersRaw ?? []).map((o: any) => ({
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
    // payments는 배열이므로 필요에 따라 첫 결제나 전체를 처리
    payments: o.payments ?? [],
  }));

  return (
    <main style={{ padding: 24 }}>
      <h1>Q&A</h1>
      {/* 이하 기존 렌더링 코드: qnas, orders 등 사용 */}
      <section>
        <h2>최근 주문</h2>
        <ul>
          {orders.length === 0 ? (
            <li>주문이 없습니다.</li>
          ) : (
            orders.map((o: any) => (
              <li key={o.id}>
                <div>주문번호: {o.id}</div>
                <div>총금액: {o.totalAmount}</div>
                <div>결제건수: {o.payments?.length ?? 0}</div>
                {/* items 렌더링 등 */}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}