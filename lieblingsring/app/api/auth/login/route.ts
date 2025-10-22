// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/db"; // Prisma client

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ message: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // 토큰 생성 (payload 최소화: sub = user.id)
    const token = signToken({ sub: user.id, email: user.email, name: user.name ?? undefined });

    const res = NextResponse.json({ ok: true, id: user.id });
    // 만료시간: JWT_EXPIRES_IN에 맞춰 Date로 설정(예: 15분 후)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 예시 15분
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      ...cookieOptions(),
      expires: expiresAt,
    });

    return res;
  } catch (err) {
    console.error("auth login error:", err);
    return NextResponse.json({ message: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
}