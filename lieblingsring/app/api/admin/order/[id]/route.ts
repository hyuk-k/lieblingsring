// ./app/api/admin/order/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/** 간단한 관리자 체크(데모용). 운영에서는 세션/JWT/DB로 검증하세요. */
function isAdmin(req: NextRequest): boolean {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (err) {
    console.error("isAdmin error:", err);
    return false;
  }
}

function extractId(context: { params?: Record<string, unknown> } | undefined): string | null {
  if (!context?.params) return null;
  const raw = context.params["id"];
  if (typeof raw === "string" && raw.trim().length > 0) return raw;
  return null;
}

/** PUT에서 허용할 필드만 골라 반환 (화이트리스트) */
function sanitizeOrderUpdate(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return {};
  const obj = payload as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};
  // 예: 상태 변경, 배송정보 등 필요한 필드만 허용
  if (typeof obj.status === "string") allowed.status = obj.status;
  if (typeof obj.payMethod === "string") allowed.payMethod = obj.payMethod;
  if (typeof obj.payTxId === "string") allowed.payTxId = obj.payTxId;
  if (typeof obj.totalAmount === "number") allowed.totalAmount = obj.totalAmount;
  // 필요 시 추가 필드 허용
  return allowed;
}

/** GET: 주문 조회 */
export async function GET(_req: NextRequest, context: { params?: Record<string, unknown> }) {
  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ ok: false, message: "주문을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: order }, { status: 200 });
  } catch (err) {
    console.error("GET /admin/order/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** PUT: 주문 수정 (관리자 전용) */
export async function PUT(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const payload = await req.json().catch(() => ({}));
    const data = sanitizeOrderUpdate(payload);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 유효한 필드가 없습니다." }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /admin/order/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** DELETE: 주문 삭제 (관리자 전용) — 실삭제 대신 soft-delete 권장 */
export async function DELETE(_req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(_req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    // 권장: 물리 삭제 대신 soft-delete 구현(예: deletedAt 필드 추가)
    // 예시: await prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /admin/order/[id] error:", err);
    // 주문이 없을 때의 Prisma 에러 처리 가능 (예: P2025)
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}