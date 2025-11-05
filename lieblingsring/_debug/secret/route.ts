// lieblingsring/lieblingsring/app/api/_debug/secret/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  // 절대 비밀값을 반환하지 마세요 — 존재 여부(true/false)만 반환합니다.
  const ok = Boolean(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
  return NextResponse.json({ ok, present: ok ? "secret present" : "secret missing" });
}
