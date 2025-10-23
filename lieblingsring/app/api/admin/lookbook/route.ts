// app/api/admin/lookbook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

function isAdmin(req: NextRequest) {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  try {
    const payload = await req.json().catch(() => ({}));
    const data: any = {};
    if (typeof payload.title === "string") data.title = payload.title.trim();
    if (typeof payload.caption === "string") data.caption = payload.caption.trim();
    if (typeof payload.image === "string" && payload.image.trim() !== "") data.image = payload.image.trim();

    if (!data.title || !data.image) {
      return NextResponse.json({ ok: false, message: "title과 image는 필수입니다." }, { status: 400 });
    }

    const created = await prisma.lookbook.create({ data });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/lookbook error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}