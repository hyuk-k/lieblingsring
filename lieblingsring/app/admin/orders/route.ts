// app/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

export async function GET(req: NextRequest) {
  // 관리자 인증: req.cookies 사용
  try {
    const isAdmin = req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
    if (!isAdmin) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: orders });
  } catch (err) {
    console.error("GET /admin/orders error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}