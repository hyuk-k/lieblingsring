// lieblingsring/lieblingsring/app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, COOKIE_NAME, cookieOptions } from "@/lib/auth";

/**
 * 로그인 라우트 (전체 파일)
 *
 * 변경 요약:
 * - cookieOptions 타입 안전하게 처리 (타입 좁힘 또는 캐스트)
 * - JWT 시크릿 존재 여부 확인
 * - 에러 발생 시 명확한 로그 남김
 */

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.includes("@") && email.indexOf(" ") === -1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = isValidEmail((body as any).email) ? (body as any).email.trim() : "";
    const password = typeof (body as any).password === "string" ? (body as any).password : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "이메일과 비밀번호가 필요합니다." }, { status: 400 });
    }

    // 시크릿 확인
    const secretAvailable = Boolean(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
    if (!secretAvailable) {
      console.error("Missing JWT secret: set NEXTAUTH_SECRET or JWT_SECRET in environment variables.");
      return NextResponse.json({ ok: false, message: "서버 설정 오류" }, { status: 500 });
    }

    // 사용자 조회
    const user = await prisma.customer.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 비밀번호 비교
    const storedHash = (user as any).password ?? "";
    const valid = await bcrypt.compare(password, storedHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 토큰 생성
    let token: string;
    try {
      token = await signToken({ sub: user.id, email: user.email });
    } catch (err: any) {
      console.error("Token sign error:", err);
      return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
    }

    const res = NextResponse.json({
      ok: true,
      data: { id: user.id, email: user.email, name: user.name ?? null },
    });

    // ===== 안전한 cookieOptions 적용 부분 =====
    // 문제 원인: cookieOptions의 타입이 빌드 시점에 object로 보장되지 않아 스프레드 오류 발생
    // 해결: 런타임에서 cookieOptions가 객체인지 확인한 뒤 스프레드하거나,
    //       안전한 타입 캐스트를 사용하여 TypeScript 컴파일 오류를 피함.
    try {
      // 1) 런타임 타입 좁힘: cookieOptions가 null/undefined가 아니고 object인 경우에만 스프레드
      if (cookieOptions && typeof cookieOptions === "object" && !Array.isArray(cookieOptions)) {
        // TS가 여전히 혼동하는 경우를 대비해 안전하게 캐스트
        const options = cookieOptions as Record<string, unknown>;
        res.cookies.set({
          name: COOKIE_NAME ?? "auth_token",
          value: token,
          ...options,
        });
      } else {
        // 기본 안전 옵션
        res.cookies.set({
          name: COOKIE_NAME ?? "auth_token",
          value: token,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    } catch (err: any) {
      console.error("Set cookie error:", err);
      return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
    }

    return res;
  } catch (err: any) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}