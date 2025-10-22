// ./app/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
// import { prisma } from "@/lib/db"; // DB 연동 시 주석 해제

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/**
 * 관리자 여부 확인 (간단 boolean 반환)
 * - 운영: 쿠키 값만으로 권한을 판단하지 말고 DB/세션 검증을 권장합니다.
 */
async function isAdminCookiePresent(req?: NextRequest): Promise<boolean> {
  try {
    // 서버 환경에 따라 cookies()가 sync/async일 수 있으므로, req 우선 사용
    let cookieValue: string | null | undefined = null;

    if (req) {
      // NextRequest가 주어지면 req.cookies 사용 (명확한 경로)
      cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    } else {
      // req가 없을 때(호출 환경에 따라) next/headers cookies() 사용
      // 일부 Next 버전에서는 cookies()가 sync. 사용 환경에 맞춰 조정하세요.
      // const store = await cookies(); // 만약 Promise 반환되는 환경이면 await 사용
      const store = cookies();
      cookieValue = store.get(ADMIN_COOKIE_NAME)?.value;
    }

    // 간단 체크: 값이 "1" 인지 확인 (운영 시엔 더 강한 검증 필요)
    return cookieValue === "1";
  } catch (err) {
    console.error("isAdminCookiePresent error:", err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  // 권한 검사
  const admin = await isAdminCookiePresent(req);
  if (!admin) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  // 실제 DB에서 불러올 경우 예:
  // const items = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  // 임시 목업 데이터
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

  return NextResponse.json({ ok: true, items });
}