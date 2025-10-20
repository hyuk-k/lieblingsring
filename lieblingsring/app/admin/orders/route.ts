import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 간단 보호막(미들웨어도 있지만 이중 안전장치)
function assertAdmin() {
  const isAdmin = cookies().get(process.env.ADMIN_COOKIE_NAME ?? "admin")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const guard = assertAdmin();
  if (guard) return guard;

  // TODO: Prisma에서 실제 주문 가져오기
  // 예시 목업 데이터
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

