import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // .env.local 에 저장한 ADMIN_PASS 값과 비교
  if (password === process.env.ADMIN_PASS) {
    // 로그인 성공 → 세션 쿠키 설정
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 6, // 6시간 유지
    });
    return res;
  }

  // 로그인 실패
  return NextResponse.json(
    { ok: false, message: "비밀번호가 올바르지 않습니다." },
    { status: 401 }
  );
}
