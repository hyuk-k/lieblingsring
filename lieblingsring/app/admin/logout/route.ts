// ./app/admin/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

export async function GET(_req: NextRequest) {
  // 로그인 페이지로 리디렉션
  const res = NextResponse.redirect("/admin/login");

  // 쿠키 무효화(빈값 + expires 과 maxAge 설정) — production에서는 secure:true 권장
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // 과거 날짜로 설정하여 브라우저에서 삭제하도록 함
    // 또는 maxAge: 0 으로도 무효화 가능
  });

  // 운영 환경에서 서버에 세션/토큰을 저장해 둔 경우에는 여기서 서버측 무효화 로직(예: DB/Redis 삭제)을 추가하세요.

  return res;
}