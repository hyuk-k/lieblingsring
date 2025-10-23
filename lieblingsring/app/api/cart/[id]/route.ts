// app/api/cart/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function extractId(context?: { params?: Promise<{ id: string }> }) {
  if (!context?.params) return null;
  try {
    const p = await context.params;
    return typeof p.id === "string" ? p.id : null;
  } catch (e) {
    return null;
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const item = await prisma.cart.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ ok: false, message: "항목 없음" }, { status: 404 });
    return NextResponse.json({ ok: true, data: item });
  } catch (err) {
    console.error("GET /api/cart/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const res = await prisma.cart.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true, removed: res.count });
  } catch (err: any) {
    console.error("DELETE /api/cart/[id] error:", err);
    if (err?.code === "P2025") return NextResponse.json({ ok: false, message: "존재하지 않음" }, { status: 404 });
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}