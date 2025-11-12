// app/mypage/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export const revalidate = 0;

type OrderWithItems = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { id: string; quantity: number; price: number; product?: { id: string; title: string } }[];
};

export default async function MyPage() {
  try {
    // 서버 컴포넌트에서는 Request 객체가 없으므로 인증된 사용자 정보를 얻는 방식은
    // 프로젝트 구조에 따라 다릅니다. 여기서는 간단히 모든 데이터 대신
    // '서버에서 토큰을 읽어 보호된 API를 호출'하는 방식 대신 직접 prisma를 사용합니다.
    // 실제로는 token -> payload.sub (userId)로 쿼리 조건을 넣어야 합니다.
    // 예시에서는 모든 사용자의 주문/포인트를 가져오지 않도록 주의하세요.

    // --- 권장 방식(실제 사용 시): 서버에서 Request를 받을 수 있게 getServerSideProps 대체 또는
    // API 엔드포인트를 호출하여 userId 기반 데이터를 가져오세요.
    // 여기서는 데모용으로 현재 프로젝트의 인증 로직에 맞게 수정해서 사용하세요.

    // 예: (권장) payload.sub로 userId 추출 후 where: { customerId: userId }
    // 아래는 샘플(관리자/테스트용)으로 최신 주문 10개를 가져옵니다.
    const ordersRaw = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: { include: { product: true } }, payment: true },
    });

    const orders: OrderWithItems[] = ordersRaw.map((o) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: (o.items || []).map((it) => ({
        id: it.id,
        quantity: it.quantity,
        price: it.price,
        product: (it as any).product ? { id: (it as any).product.id, title: (it as any).product.title } : undefined,
      })),
    }));

    // 포인트 요약 (데모: 전체 포인트 합계)
    const pointsRaw = await prisma.point.findMany({ take: 1 });
    const points = pointsRaw.length > 0 ? pointsRaw[0].amount : 0;

    // 장바구니 요약 (데모: 장바구니 모델이 없다면 cart 테이블/리레이션을 구현하세요)
    // 여기서는 임시로 주문에서 가장 최신 주문의 아이템 수와 합계를 표시합니다.
    const cartSummary = orders.length > 0
      ? { itemsCount: orders[0].items.reduce((s, it) => s + it.quantity, 0), total: orders[0].totalAmount }
      : { itemsCount: 0, total: 0 };

    // 간단한 사용자 정보(실제론 payload.sub로 user 조회)
    // 테스트용: 첫 번째 고객 정보를 가져옴
    const sampleUser = await prisma.customer.findFirst();

    return (
      <main style={{ padding: 24 }}>
        <h1>마이페이지</h1>

        <section style={{ marginBottom: 24 }}>
          <h2>회원 정보</h2>
          {sampleUser ? (
            <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
              <div><strong>이메일:</strong> {sampleUser.email}</div>
              <div><strong>이름:</strong> {sampleUser.name ?? "-"}</div>
              <div style={{ marginTop: 8 }}>
                <Link href="/mypage/edit">
                  <button>회원정보 수정</button>
                </Link>
              </div>
            </div>
          ) : (
            <div>사용자 정보를 불러올 수 없습니다.</div>
          )}
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>장바구니 요약</h2>
          <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            <div>담긴 상품 수: {cartSummary.itemsCount}</div>
            <div>예상 총액: {cartSummary.total} 원</div>
            <div style={{ marginTop: 8 }}>
              <Link href="/cart"><button>장바구니 보기 / 결제하기</button></Link>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>최근 주문</h2>
          {orders.length === 0 ? (
            <div>주문 내역이 없습니다.</div>
          ) : (
            <ul>
              {orders.map((o) => (
                <li key={o.id} style={{ border: "1px solid #eee", padding: 12, marginBottom: 8, borderRadius: 8 }}>
                  <div>주문번호: {o.id}</div>
                  <div>총금액: {o.totalAmount} 원</div>
                  <div>상태: {o.status}</div>
                  <div>주문일: {new Date(o.createdAt).toLocaleString()}</div>
                  <details style={{ marginTop: 8 }}>
                    <summary>항목 보기</summary>
                    <ul>
                      {o.items.map((it) => (
                        <li key={it.id}>
                          {it.product?.title ?? "상품"} x{it.quantity} — {it.price}원
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>적립금</h2>
          <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            현재 적립금: {points} 원
            <div style={{ marginTop: 8 }}>
              <Link href="/mypage/points"><button>적립금 내역 보기</button></Link>
            </div>
          </div>
        </section>
      </main>
    );
  } catch (err) {
    console.error("mypage render error:", err);
    return (
      <main style={{ padding: 24 }}>
        <h1>마이페이지</h1>
        <div>오류가 발생했습니다. 콘솔 로그를 확인하세요.</div>
      </main>
    );
  }
}