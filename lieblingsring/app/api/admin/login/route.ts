// ./app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";
const ADMIN_PASS = process.env.ADMIN_PASS;

// 타이밍 공격 방지를 위한 안전 비교
function timingSafeEqual(a: string, b: string) {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // 길이가 다르면 즉시 false 반환 (하지만 시간 차이를 일정하게 만들기 위해 비교 수행)
      // 동일 길이의 더미 버퍼와 비교하여 시간 소모를 맞출 수 있음
      const dummy = Buffer.alloc(Math.max(bufA.length, bufB.length));
      return !crypto.timingSafeEqual(Buffer.concat([bufA, dummy]).slice(0, dummy.length), Buffer.concat([bufB, dummy]).slice(0, dummy.length));
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // 환경변수 미설정 대비
  if (!ADMIN_PASS) {
    console.error("ADMIN_PASS is not configured");
    return NextResponse.json({ ok: false, message: "서버 설정 오류" }, { status: 500 });
  }

  // 요청 바디 검증
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청" }, { status: 400 });
  }

  const password = typeof (payload as any).password === "string" ? (payload as any).password : "";

  // 인증 검사 (타이밍 안전 비교)
  const ok = timingSafeEqual(password, ADMIN_PASS);

  if (ok) {
    const res = NextResponse.json({ ok: true });

    // 쿠키 옵션: production 환경에서는 secure:true 권장
    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "1",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6, // 6시간
    });

    return res;
  }

  // 로그인 실패: 간단한 로깅(심화: IP, rate-limit 연계 권장)
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.ip ?? "unknown";
    console.warn(`Admin login failed - ip=${ip}`);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: false, message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
}