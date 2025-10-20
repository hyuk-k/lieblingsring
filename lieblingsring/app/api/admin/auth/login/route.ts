// app/api/admin/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const ok = password && password === process.env.ADMIN_PASS;
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  const cookieName = process.env.ADMIN_COOKIE_NAME || "admin";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "1", { httpOnly: true, path: "/" });
  return res;
}
