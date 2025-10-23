// ./app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, COOKIE_NAME, cookieOptions } from "@/lib/auth";

/**
 * 로그인 엔드포인트
 * - 이메일 + 비밀번호 검증
 * - 비밀번호 비교(bcryptjs)
 * - 토큰 발급(signToken은 lib/auth에 구현되어 있어야 함)
 * - httpOnly 쿠키로 토큰 또는 세션 플래그 설정 (프로젝트 정책에 맞게 조정)
 *
 * 주의:
 * - lib/auth.signToken 구현이 JWT 또는 다른 서명 방식을 사용한다고 가정합니다.
 * - 만약 lib/auth가 edge/ESM 호환성 문제 있다면 jose 등으로 변환하세요.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof (body as any).email === "string" ? (body as any).email.trim() : "";
    const password = typeof (body as any).password === "string" ? (body as any).password : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "이메일과 비밀번호는 필수입니다." }, { status: 400 });
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 비밀번호 비교
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 토큰 생성 (lib/auth에서 signToken 구현 필요)
    // 예: const token = await signToken({ sub: user.id, email: user.email });
    const token = await signToken({ sub: user.id, email: user.email });

    // 응답과 함께 쿠키 설정 (cookieOptions은 lib/auth에서 미리 정의된 옵션을 사용)
    const res = NextResponse.json({ ok: true, data: { id: user.id, email: user.email, name: user.name } });

    // 쿠키 설정: 프로젝트 정책에 맞게 아래를 조정하세요.
    // - cookieOptions 예: { httpOnly: true, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60*60*24*7 }
    if (cookieOptions) {
      res.cookies.set({
        name: COOKIE_NAME ?? "auth_token",
        value: token,
        ...cookieOptions,
      });
    } else {
      // 기본 옵션
      res.cookies.set({
        name: COOKIE_NAME ?? "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}