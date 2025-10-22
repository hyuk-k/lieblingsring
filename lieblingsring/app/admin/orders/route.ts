import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// ✅ 비동기 함수로 수정
async function assertAdmin() {
  const store = await cookies(); // Next 15에서 cookies()는 Promise
  const isAdmin = store.get(process.env.ADMIN_COOKIE_NAME ?? "admin_session")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const guard = await assertAdmin(); // ✅ await 필요
  if (guard) return guard;

  // ✅ (예시) 실제 Prisma에서 불러오려면 나중에 이렇게 수정할 수 있음:
  // const items = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });

  // 🔹 임시 목업 데이터
  const items = [
    {
      id: "ord_1",
      orderNo: "2025-0001",
      buyer: "홍길동",
      total: 129000,
      status: "READY",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord_2",
      orderNo: "2025-0002",
      buyer: "김영희",
      total: 89000,
      status: "PAID",
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
  ];

  return NextResponse.json({ items });
}
