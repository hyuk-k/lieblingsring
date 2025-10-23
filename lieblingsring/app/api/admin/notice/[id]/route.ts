// ./app/api/admin/notice/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/** 간단한 관리자 체크(데모용). 운영에서는 세션/JWT/DB 검증 권장 */
function isAdmin(req: NextRequest) {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (e) {
    console.error("isAdmin error:", e);
    return false;
  }
}

/** Next.js 15: context.params는 Promise<{ id: string }> 입니다. 안전하게 추출 */
async function extractId(context?: { params?: Promise<{ id: string }> } | undefined) {
  try {
    if (!context?.params) return null;
    const p = await context.params;
    if (p && typeof p.id === "string" && p.id.trim().length > 0) return p.id;
    return null;
  } catch (e) {
    console.error("extractId error:", e);
    return null;
  }
}

/** GET: 공지/문의 조회 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const item = await prisma.inquiry.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ ok: false, message: "항목을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: item }, { status: 200 });
  } catch (err) {
    console.error("GET /admin/notice/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** PUT: 공지/문의 수정 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const payload = await req.json().catch(() => ({}));
    // 허용 필드(화이트리스트)만 적용
    const data: Record<string, any> = {};
    if (typeof payload.title === "string") data.title = payload.title.trim();
    if (typeof payload.content === "string") data.content = payload.content.trim();
    if (typeof payload.type === "string") data.type = payload.type.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 유효한 필드가 없습니다." }, { status: 400 });
    }

    const updated = await prisma.inquiry.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /admin/notice/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** DELETE: 공지/문의 삭제 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = await extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /admin/notice/[id] error:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ ok: false, message: "존재하지 않는 항목입니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}