// ./app/api/admin/lookbook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/** 간단 관리자 검사(데모용). 운영에서는 JWT/세션/DB 검증 권장) */
function isAdmin(req: NextRequest) {
  try {
    return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  } catch (e) {
    console.error("isAdmin error:", e);
    return false;
  }
}

/** POST 허용 필드만 골라서 반환 */
function sanitizeCreatePayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return null;
  const body = payload as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const caption = typeof body.caption === "string" ? body.caption.trim() : null;
  const image = typeof body.image === "string" ? body.image.trim() : null; // 이미지 URL(최소 처리)
  // 추가 필드 허용 시 명시적으로 추가
  if (!title) return null;
  return { title, caption, image };
}

/** GET: 목록(페이징 지원) */
export async function GET(req: NextRequest) {
  try {
    // 관리자 보호(필요 시 주석 해제)
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.lookbook.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.lookbook.count(),
    ]);

    return NextResponse.json({
      ok: true,
      data: items,
      meta: { total, page, limit },
    });
  } catch (err) {
    console.error("GET /admin/lookbook error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/** POST: 생성 (간단 입력 검증 포함) */
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
    }

    const raw = await req.json().catch(() => null);
    const data = sanitizeCreatePayload(raw);
    if (!data) {
      return NextResponse.json({ ok: false, message: "유효하지 않은 입력입니다." }, { status: 400 });
    }

    // 예: 이미지 업로드를 받는 경우, 여기서는 image 필드를 URL로 받는다고 가정
    const created = await prisma.lookbook.create({
      data: {
        title: data.title,
        caption: data.caption,
        image: data.image, // 스키마에 맞게 필드명 확인
      },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /admin/lookbook error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}