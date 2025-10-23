// app/admin/notices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

function isAdmin(req: NextRequest) {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (e) {
    console.error("isAdmin error:", e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  try {
    const items = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /admin/notices error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.contact === "string") data.contact = body.contact.trim();
    if (typeof body.message === "string") data.message = body.message.trim();
    if (Object.keys(data).length === 0) return NextResponse.json({ ok: false, message: "빈 요청" }, { status: 400 });

    const item = await prisma.inquiry.create({ data });
    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (err) {
    console.error("POST /admin/notices error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}