// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, COOKIE_NAME, cookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof (body as any).email === "string" ? (body as any).email.trim() : "";
    const password = typeof (body as any).password === "string" ? (body as any).password : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "이메일과 비밀번호가 필요합니다." }, { status: 400 });
    }

    // Customer 모델 사용 (schema에 맞춤)
    const user = await prisma.customer.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });

    const valid = await bcrypt.compare(password, (user as any).password ?? "");
    if (!valid) return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });

    const token = await signToken({ sub: user.id, email: user.email });

    const res = NextResponse.json({ ok: true, data: { id: user.id, email: user.email, name: user.name } });

    // 쿠키 설정 (lib/auth의 cookieOptions 사용 가능)
    if (cookieOptions) {
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
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}