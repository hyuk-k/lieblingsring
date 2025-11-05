// lieblingsring/lieblingsring/app/api/auth/signup/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "잘못된 요청" }, { status: 400 });
    }

    const { email, password, name } = body as { email?: unknown; password?: unknown; name?: unknown };

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "유효한 이메일 주소를 입력하세요." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ ok: false, message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
    }

    // Prisma에서 Customer 모델이 정의되어 있으므로 customer 사용
    if (!(prisma as any).customer) {
      console.error("Prisma client has no .customer model. Check prisma/schema.prisma");
      return NextResponse.json({ ok: false, message: "서버 설정 오류: 사용자 모델을 찾을 수 없습니다." }, { status: 500 });
    }

    // email은 schema에서 @unique이므로 findUnique 사용
    const existing = await prisma.customer.findUnique({ where: { email } as any });
    if (existing) {
      return NextResponse.json({ ok: false, message: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 여기서 필드명을 schema.prisma의 실제 필드명(password)으로 사용
    const customer = await prisma.customer.create({
      data: {
        email,
        password: hashed,
        name: typeof name === "string" ? name : "",
      },
    });

    return NextResponse.json({ ok: true, customerId: customer.id });
  } catch (err: any) {
    console.error("signup error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}