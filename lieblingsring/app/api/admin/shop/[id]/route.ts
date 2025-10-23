// ./app/api/admin/shop/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

function isAdmin(req: NextRequest): boolean {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (e) {
    console.error("isAdmin error:", e);
    return false;
  }
}

async function extractId(context?: { params?: Promise<{ id: string }> }): Promise<string | null> {
  if (!context?.params) return null;
  try {
    const p = await context.params;
    if (p && typeof p.id === "string" && p.id.trim()) return p.id;
    return null;
  } catch (e) {
    console.error("extractId error:", e);
    return null;
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ ok: false, message: "상품을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: product }, { status: 200 });
  } catch (err: any) {
    console.error("GET /admin/shop/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const payload = await req.json().catch(() => ({}));
    const data: Record<string, any> = {};
    if (typeof payload.name === "string") data.name = payload.name.trim();
    if (typeof payload.summary === "string") data.summary = payload.summary.trim();
    if (typeof payload.price === "number") data.price = payload.price;
    if (typeof payload.salePrice === "number") data.salePrice = payload.salePrice;
    if (Array.isArray(payload.images)) data.images = payload.images;
    if (typeof payload.description === "string") data.description = payload.description;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 필드가 없습니다." }, { status: 400 });
    }

    const updated = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /admin/shop/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /admin/shop/[id] error:", err);
    if (err?.code === "P2025") return NextResponse.json({ ok: false, message: "존재하지 않는 상품입니다." }, { status: 404 });
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}