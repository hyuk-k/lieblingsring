// ./app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASS;

/** 타이밍 공격 완화를 위한 안전 비교 */
function timingSafeEqual(a: string, b: string) {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    // 길이가 다르면 같은 길이의 더미 버퍼와 비교하여 일정 시간 소비
    if (bufA.length !== bufB.length) {
      const max = Math.max(bufA.length, bufB.length);
      const ta = Buffer.concat([bufA, Buffer.alloc(max - bufA.length)]);
      const tb = Buffer.concat([bufB, Buffer.alloc(max - bufB.length)]);
      return crypto.timingSafeEqual(ta, tb) && false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // 환경변수 미설정 체크
  if (!ADMIN_PASS) {
    console.error("ADMIN_PASS is not configured");
    return NextResponse.json({ ok: false, message: "Server configuration error" }, { status: 500 });
  }

  // 요청 바디 파싱/검증
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }
  const password = typeof (body as any)?.password === "string" ? (body as any).password : "";

  // 인증 (타이밍 안전 비교)
  const authenticated = timingSafeEqual(password, ADMIN_PASS);

  if (!authenticated) {
    // 로그인 실패 로깅(심화: IP 기반 레이트리밋 연동 권장)
    try {
      const ip = req.headers.get("x-forwarded-for") ?? "unknown";
      console.warn(`Admin login failed - ip=${ip}`);
    } catch {}
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // 로그인 성공 — 쿠키 설정
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "1",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 6, // 6시간
  });
  return res;
}