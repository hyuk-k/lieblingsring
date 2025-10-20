import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

  // TODO: Prisma Notice/Qna에서 실제 데이터 가져오기
  const items = [
    { id: "n1", type: "NOTICE", title: "추석 연휴 배송 안내", createdAt: new Date().toISOString() },
    { id: "q1", type: "QNA", title: "반지 사이즈 교환 가능할까요?", createdAt: new Date(Date.now() - 7200_000).toISOString() },
  ];
  return NextResponse.json({ items });
}

