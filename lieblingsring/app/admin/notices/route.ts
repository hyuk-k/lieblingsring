// ./app/admin/notices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

/**
 * 관리자 여부 검사 (재사용 가능한 헬퍼)
 * - 단순 쿠키 값("1") 검사는 데모·개발용으로만 사용하세요.
 * - 운영에서는 세션ID/JWT를 검증하거나 DB에서 권한을 확인하세요.
 */
export function isAdminFromRequest(req: NextRequest): boolean {
  try {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
    return cookieValue === "1"; // 데모: "1"이면 관리자
  } catch (err) {
    console.error("isAdminFromRequest error:", err);
    return false;
  }
}

/**
 * GET /api/admin/notices
 * - 권한 확인 후 공지목록 반환
 */
export async function GET(req: NextRequest) {
  if (!isAdminFromRequest(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, data: items }, { status: 200 });
  } catch (err) {
    console.error("GET /admin/notices error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/**
 * POST /api/admin/notices
 * - 권한 확인, 입력 검증, 생성
 */
export async function POST(req: NextRequest) {
  if (!isAdminFromRequest(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await req.json().catch(() => ({}));
    const title = typeof (body as any).title === "string" ? (body as any).title.trim() : "";
    const content = typeof (body as any).content === "string" ? (body as any).content.trim() : "";

    if (!title) {
      return NextResponse.json({ ok: false, message: "title은 필수입니다." }, { status: 400 });
    }

    // 선택: content도 필수로 만들려면 검사 추가
    const item = await prisma.notice.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (err) {
    console.error("POST /admin/notices error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}