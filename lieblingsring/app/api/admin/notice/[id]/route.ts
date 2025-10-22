// ./app/api/admin/notice/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/** 간단한 관리자 체크(데모용) - 운영에서는 세션/JWT/DB 검증으로 대체하세요 */
function isAdmin(req: NextRequest): boolean {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (e) {
    console.error("isAdmin error:", e);
    return false;
  }
}

/** 안전한 ID 추출 및 검증 */
function extractIdFromContext(context: { params?: Record<string, unknown> } | undefined): string | null {
  if (!context?.params) return null;
  const raw = context.params["id"];
  if (typeof raw === "string" && raw.trim().length > 0) return raw;
  return null;
}

/** PUT으로 허용할 필드만 골라 반환 (화이트리스트 방식) */
function sanitizeNoticeUpdate(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return {};
  const obj = payload as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};
  if (typeof obj.title === "string") allowed.title = obj.title.trim();
  if (typeof obj.content === "string") allowed.content = obj.content.trim();
  if (typeof obj.type === "string") allowed.type = obj.type.trim();
  // 필요 시 더 많은 허용 필드 추가
  return allowed;
}

/** GET: 공지/문의 조회 */
export async function GET(_req: NextRequest, context: { params?: Record<string, unknown> }) {
  // 권한 검사
  // (관리 페이지용 API라면 권한 검사 필요. 주석 해제하여 사용)
  // if (!isAdmin(_req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractIdFromContext(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const notice = await prisma.inquiry.findUnique({ where: { id } });
    if (!notice) return NextResponse.json({ ok: false, message: "항목을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: notice }, { status: 200 });
  } catch (err) {
    console.error("GET /admin/notice/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** PUT: 공지/문의 수정 */
export async function PUT(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractIdFromContext(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const payload = await req.json().catch(() => ({}));
    const data = sanitizeNoticeUpdate(payload);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 유효한 필드가 없습니다." }, { status: 400 });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /admin/notice/[id] error:", err);
    // Prisma의 에러 코드(P2002 등)를 검사해 구체적 응답을 줄 수도 있음
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** DELETE: 공지/문의 삭제 */
export async function DELETE(_req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(_req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractIdFromContext(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /admin/notice/[id] error:", err);
    // 존재하지 않는 항목을 삭제하려 할 때 Prisma에서 에러가 날 수 있으므로 상황에 따라 404로 응답하도록 처리 가능
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}