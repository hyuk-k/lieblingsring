// ./app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * 회원가입 엔드포인트
 * - 요청 바디 검증
 * - 이메일(또는 id) 중복 체크
 * - 비밀번호 해시화(bcryptjs)
 * - 사용자 생성(Prisma)
 * - 일관된 JSON 응답
 */

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof (body as any).email === "string" ? (body as any).email.trim() : "";
    const password = typeof (body as any).password === "string" ? (body as any).password : "";
    const name = typeof (body as any).name === "string" ? (body as any).name.trim() : "";

    // 기본 검증
    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "이메일과 비밀번호는 필수입니다." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "비밀번호는 최소 6자 이상이어야 합니다." }, { status: 400 });
    }

    // 이메일 중복 체크 (필요에 따라 유효성 검사 강화)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, message: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }

    // 비밀번호 해시 (동기/비동기 선택 가능; 여기서는 비동기 사용)
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // 사용자 생성 (필요한 필드만 명시적으로 작성)
    const created = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
        // 필요한 추가 필드가 있으면 명시적으로 추가하세요
      },
    });

    // 민감정보 제거 후 반환
    const { password: _p, ...safeUser } = created as any;

    return NextResponse.json({ ok: true, data: safeUser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}