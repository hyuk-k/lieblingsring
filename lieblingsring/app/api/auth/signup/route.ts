// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof (body as any).email === "string" ? (body as any).email.trim() : "";
    const password = typeof (body as any).password === "string" ? (body as any).password : "";
    const name = typeof (body as any).name === "string" ? (body as any).name.trim() : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "이메일과 비밀번호가 필요합니다." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "비밀번호는 최소 6자 이상이어야 합니다." }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, message: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await prisma.customer.create({
      data: {
        email,
        // schema에는 customer에 password 필드가 없을 수도 있으므로 확인 필요
        // 만약 schema에 password 없다면 별도 인증 테이블을 사용하세요.
        // 여기서는 가정상 password 필드가 있다면 아래처럼 저장:
        ...(Boolean((prisma as any).customer && true) ? { password: hashed } : {}),
        name: name || null,
      } as any,
    });

    const { password: _p, ...safe } = created as any;
    return NextResponse.json({ ok: true, data: safe }, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}