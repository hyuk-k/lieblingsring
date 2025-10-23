// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const CART_COOKIE = process.env.CART_COOKIE_NAME ?? "cart";

export async function GET() {
  try {
    const store = await cookies();
    const raw = store.get(CART_COOKIE)?.value ?? "[]";
    const items = JSON.parse(raw) as any[];
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const items = Array.isArray(payload.items) ? payload.items : [];

    const store = await cookies();
    store.set({
      name: CART_COOKIE,
      value: JSON.stringify(items),
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}