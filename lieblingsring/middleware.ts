// middleware.ts (프로젝트 루트)
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieName = process.env.ADMIN_COOKIE_NAME || "admin";
  const isAuthed = req.cookies.get(cookieName)?.value === "1";

  // 1) 로그인 관련/정적 파일은 통과
  const allowPrefixes = [
    "/admin/login",
    "/api/admin/auth/login",
    "/api/admin/auth/logout",
    "/api/admin/auth/me",
    "/_next",           // 정적 빌드
    "/favicon.ico",
    "/assets",
    "/public",
  ];
  if (allowPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2) /admin, /api/admin 은 보호
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isAuthed) {
      const login = new URL("/admin/login", req.url);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
