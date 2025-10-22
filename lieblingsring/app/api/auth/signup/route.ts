// ./app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { usersStore } from "../../_store/users";

const SALT_ROUNDS = 10; // 필요시 환경변수로 관리

type SignupPayload = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  phone?: unknown;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function validateEmail(email: string) {
  // 간단한 이메일 정규식 (필요시 더 엄격하게 교체)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const payload = body as SignupPayload;

    // 필수 필드 검증
    if (!isString(payload.email) || !isString(payload.password)) {
      return NextResponse.json({ message: "이메일과 비밀번호는 필수입니다." }, { status: 400 });
    }

    const email = payload.email.trim();
    const password = payload.password;

    if (!validateEmail(email)) {
      return NextResponse.json({ message: "유효한 이메일을 입력해 주세요." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
    }

    // 중복 검사
    const exists = usersStore.users.some((u) => u.email === email);
    if (exists) {
      return NextResponse.json({ message: "이미 존재하는 이메일입니다." }, { status: 409 });
    }

    // 비밀번호 해시화
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // 사용자 추가 (비밀번호는 해시 저장)
    const newUser = {
      id: String(Date.now()),
      email,
      password: hashed,
      name: isString(payload.name) ? payload.name : undefined,
      phone: isString(payload.phone) ? payload.phone : undefined,
      createdAt: new Date().toISOString(),
    };

    usersStore.users.push(newUser);

    // 응답: 민감정보(비밀번호 등) 반환 금지
    return NextResponse.json({ ok: true, id: newUser.id }, { status: 201 });
  } catch (err) {
    console.error("signup error:", err);
    return NextResponse.json({ message: "서버 오류로 회원가입에 실패했습니다." }, { status: 500 });
  }
}