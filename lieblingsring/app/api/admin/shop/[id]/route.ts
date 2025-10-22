// ./app/api/admin/shop/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/** 데모용 관리자 확인: 운영에서는 JWT/세션/DB 권한 검증 권장 */
function isAdmin(req: NextRequest) {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (err) {
    console.error("isAdmin error:", err);
    return false;
  }
}

/** context.params에서 id 안전 추출 */
function extractId(context?: { params?: Record<string, unknown> } | undefined): string | null {
  const raw = context?.params?.["id"];
  if (typeof raw === "string" && raw.trim().length > 0) return raw;
  return null;
}

/** PUT에서 허용할 필드만 골라 반환(화이트리스트) */
function sanitizeProductUpdate(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return {};
  const obj = payload as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};

  // 허용 필드: 프로젝트 스키마에 따라 조정하세요
  if (typeof obj.name === "string") allowed.name = obj.name.trim();
  if (typeof obj.summary === "string") allowed.summary = obj.summary.trim();
  if (typeof obj.price === "number") allowed.price = obj.price;
  if (typeof obj.salePrice === "number") allowed.salePrice = obj.salePrice;
  if (Array.isArray(obj.images)) allowed.images = obj.images;
  if (typeof obj.description === "string") allowed.description = obj.description;
  if (typeof obj.status === "string") allowed.status = obj.status;
  if (typeof obj.isCustom === "boolean") allowed.isCustom = obj.isCustom;
  // 필요한 다른 필드가 있으면 명시적으로 추가

  return allowed;
}

/** GET: 상품 조회 */
export async function GET(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        // 필요 시 relation 포함
        // variants: true, // 예시
      },
    });
    if (!product) return NextResponse.json({ ok: false, message: "상품을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, data: product }, { status: 200 });
  } catch (err) {
    console.error("GET /admin/shop/[id] error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** PUT: 상품 수정 (관리자 전용) */
export async function PUT(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    const payload = await req.json().catch(() => ({}));
    const data = sanitizeProductUpdate(payload);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, message: "업데이트할 유효한 필드가 없습니다." }, { status: 400 });
    }

    // 업데이트: 필요시 트랜잭션으로 확장
    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /admin/shop/[id] error:", err);
    // Prisma 특수 에러(P2002 등) 처리 가능
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** DELETE: 상품 삭제 (관리자 전용) — soft-delete 권장 */
export async function DELETE(req: NextRequest, context: { params?: Record<string, unknown> }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });

  const id = extractId(context);
  if (!id) return NextResponse.json({ ok: false, message: "유효하지 않은 id" }, { status: 400 });

  try {
    // 권장: 물리 삭제 대신 soft-delete(예: deletedAt 필드 추가 권장)
    // await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });

    // 현재는 물리 삭제:
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /admin/shop/[id] error:", err);
    // 존재하지 않는 리소스 삭제 시 Prisma의 P2025 대비
    if (err?.code === "P2025") {
      return NextResponse.json({ ok: false, message: "존재하지 않는 상품입니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}