// app/api/_debug/secret/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

/**
 * debug endpoint: 시크릿의 존재 여부만 반환합니다.
 * 사용법: 배포 후 https://{your-domain}/api/_debug/secret 에 GET 요청
 * 결과: { ok: true, present: "NEXTAUTH_SECRET" } 또는 { ok: false, present: null }
 *
 * 주의: 절대 실제 시크릿 값을 로그/응답으로 노출하지 않습니다.
 */
export async function GET() {
  const names = ["NEXTAUTH_SECRET", "JWT_SECRET"];
  for (const name of names) {
    if (typeof process.env[name] === "string" && process.env[name]!.length > 0) {
      return NextResponse.json({ ok: true, present: name });
    }
  }
  return NextResponse.json({ ok: false, present: null });
}
