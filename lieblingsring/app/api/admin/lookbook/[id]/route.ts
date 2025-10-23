// ./app/api/admin/lookbook/[id]/route.ts
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
    const row = await prisma.lookbook.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ ok: false, message: "항목을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: row }, { status: 200 });
  } catch (err) {
    console.error("GET /admin/lookbook/[id] error:", err);
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
    if (typeof payload.title === "string") data.title = payload.title.trim();
    if (typeof payload.caption === "string") data.caption = payload.caption.trim();
    if (typeof payload.image === "string") data.image = payload.image.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 필드가 없습니다." }, { status: 400 });
    }

    const updated = await prisma.lookbook.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /admin/lookbook/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    await prisma.lookbook.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /admin/lookbook/[id] error:", err);
    if (err?.code === "P2025") return NextResponse.json({ ok: false, message: "존재하지 않는 항목입니다." }, { status: 404 });
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}