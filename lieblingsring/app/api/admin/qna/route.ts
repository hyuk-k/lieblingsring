// app/api/admin/qna/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function isAdmin(req: Request) {
  // 실제 인증 로직으로 대체하세요.
  return true;
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });

    const items = await prisma.qna.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/admin/qna error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin(req))) return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });

    const body = await req.json();
    const { id, answer, answered } = body;
    if (!id) return NextResponse.json({ ok: false, message: "id 필요" }, { status: 400 });

    const updated = await prisma.qna.update({
      where: { id },
      data: {
        answer: typeof answer === "string" ? answer : undefined,
        answered: typeof answered === "boolean" ? answered : true,
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error("PUT /api/admin/qna error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin(req))) return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });

    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ ok: false, message: "id 필요" }, { status: 400 });

    await prisma.qna.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/qna error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}
