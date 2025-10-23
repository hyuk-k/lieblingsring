// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookieName = process.env.COOKIE_NAME ?? "auth_token";
    const token = req.cookies.get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, data: null });

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ ok: false, data: null });

    const user = await prisma.customer.findUnique({ where: { id: payload.sub as string } });
    if (!user) return NextResponse.json({ ok: false, data: null });

    const { password: _p, ...safe } = user as any;
    return NextResponse.json({ ok: true, data: safe });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}