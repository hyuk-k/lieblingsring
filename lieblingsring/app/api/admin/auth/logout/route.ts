import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin";

export async function POST(_req: NextRequest) {
  // 서버측 세션/토큰이 있다면 여기서 무효화(예: DB/Redis 삭제)하세요.
  // 예: await revokeAdminSession(sessionId);

  const res = NextResponse.json({ ok: true }, { status: 200 });

  // 쿠키 무효화: 빈 값 + expires 과 maxAge: 0을 함께 설정
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // 과거로 설정 -> 브라우저에서 삭제
    maxAge: 0,
  });

  return res;
}