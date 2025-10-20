// app/api/admin/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "admin";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
