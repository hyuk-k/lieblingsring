// ./app/api/admin/lookbook/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/** 간단한 관리자 체크(데모용).
 *  운영에서는 쿠키 값만으로 권한을 판단하지 말고 세션/JWT/DB 검증을 권장합니다.
 */
function isAdmin(req: NextRequest): boolean {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (err) {
    console.error("isAdmin error:", err);
    return false;
  }
}

/** 컨텍스트에서 id 안전 추출 */
function extractId(context?: { params?: Record<string, unknown> } | undefined): string | null {
  const raw = context?.params?.["id"];
  if (typeof raw === "string" && raw.trim().length > 0) return raw;
  return null;
}

/** PUT에서 허용할 필드만 골라 반환 (화이트리스트 방식) */
function sanitizeUpdatePayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return {};
  const obj = payload as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};
  if (typeof obj.title === "string") allowed.title = obj.title.trim();
  if (typeof obj.caption === "string") allowed.caption = obj.caption.trim();
  if (typeof obj.image === "string") allowed.image = obj.image.trim();
  // 필요하면 추가로 허용 필드를 명시적으로 추가
  return allowed;
}

/** GET: 룩북 항목 조회 */
export async function GET(req: NextRequest, context: { params?: Record<string, unknown> }) {
  // 권한 필요 시 주석 해제
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const row = await prisma.lookbook.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ ok: false, message: "항목을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: row });
  } catch (err) {
    console.error("GET /admin/lookbook/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** PUT: 룩북 항목 수정 */
export async function PUT(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const payload = await req.json().catch(() => ({}));
    const data = sanitizeUpdatePayload(payload);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 유효한 필드가 없습니다." }, { status: 400 });
    }

    const updated = await prisma.lookbook.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error("PUT /admin/lookbook/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** DELETE: 룩북 항목 삭제 (soft-delete 권장) */
export async function DELETE(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    // 권장: soft-delete (prisma schema에 deletedAt 같은 필드가 있다면 아래처럼 사용)
    // await prisma.lookbook.update({ where: { id }, data: { deletedAt: new Date() } });

    // 현재는 물리 삭제:
    await prisma.lookbook.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /admin/lookbook/[id] error:", err);
    // 존재하지 않는 항목은 404로 응답할 수도 있음(Prisma 에러 코드 P2025 등)
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}