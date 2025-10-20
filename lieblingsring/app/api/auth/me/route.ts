import { NextResponse } from "next/server";

export async function GET() {
  // 쿠키/세션 등으로 사용자 확인
  const user = null; // 로그인 시 { email, name } 같은 객체 리턴
  return NextResponse.json({ user });
}

