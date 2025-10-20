import { NextResponse } from "next/server";

export async function POST() {
  // 세션 쿠키 제거(데모용). 운영에선 토큰 블랙리스트 등 추가.
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return res;
}

