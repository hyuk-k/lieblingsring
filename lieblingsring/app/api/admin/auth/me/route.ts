// ./app/api/admin/auth/me/route.ts (권장)
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/**
 * 매우 간단한 체크(데모용) — 운영에서는 세션/JWT 검증을 권장합니다.
 */
function checkAdminFromRequest(req: NextRequest): boolean {
  try {
    const v = req.cookies.get(COOKIE_NAME)?.value;
    return v === "1";
  } catch (err) {
    console.error("checkAdminFromRequest error:", err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = checkAdminFromRequest(req);
    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/auth/me error:", err);
    return NextResponse.json({ isAdmin: false, message: "서버 오류" }, { status: 500 });
  }
}