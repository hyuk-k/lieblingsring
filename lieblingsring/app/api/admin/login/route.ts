// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof (body as any).password === "string" ? (body as any).password : "";
    const ADMIN_PASS = process.env.ADMIN_PASS;
    if (!ADMIN_PASS) return NextResponse.json({ ok: false, message: "Server config error" }, { status: 500 });

    // timing safe compare
    const ok = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASS));
    if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

    const cookieName = process.env.ADMIN_COOKIE_NAME ?? "admin";
    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: cookieName,
      value: "1",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6,
    });
    return res;
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}