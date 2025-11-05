// lieblingsring/lieblingsring/app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, COOKIE_NAME, cookieOptions } from "@/lib/auth";


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

    // JWT/토큰 서명에 필요한 시크릿이 있는지 확인
    // signToken 내부에서 처리하지 않는다면 여기서 확인해주어 명확한 로그를 남깁니다.
    const secretAvailable = Boolean(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
    if (!secretAvailable) {
      console.error("Missing JWT secret: set NEXTAUTH_SECRET or JWT_SECRET in environment variables.");
      return NextResponse.json({ ok: false, message: "서버 설정 오류" }, { status: 500 });
    }

    // 사용자 조회 (Customer 모델 사용)
    const user = await prisma.customer.findUnique({ where: { email } });
    if (!user) {
      // 보안상 구체적 이유는 숨겨야 함
      return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 비밀번호 비교 (bcryptjs)
    const storedHash = (user as any).password ?? "";
    const valid = await bcrypt.compare(password, storedHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 토큰 생성 (signToken에서 내부적으로 시크릿을 사용)
    let token: string;
    try {
      token = await signToken({ sub: user.id, email: user.email });
    } catch (err: any) {
      console.error("Token sign error:", err);
      return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
    }

    // 응답 준비
    const res = NextResponse.json({
      ok: true,
      data: { id: user.id, email: user.email, name: user.name ?? null },
    });

    // 쿠키 설정: cookieOptions이 제공되면 사용, 없으면 기본 안전 옵션 사용
    try {
      if (cookieOptions && typeof cookieOptions === "object") {
        res.cookies.set({
          name: COOKIE_NAME ?? "auth_token",
          value: token,
          ...cookieOptions,
        });
      } else {
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
      // 쿠키 설정 실패는 치명적이지 않으나 로그는 남김
      console.error("Set cookie error:", err);
      // 쿠키 설정 실패 시에도 토큰을 body로 반환하진 않음(보안)
      return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
    }

    return res;
  } catch (err: any) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}