// app/api/admin/announcements/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 관리자 인증 체크 함수(프로젝트에 맞게 구현)
async function isAdmin(req: Request) {
  // 예: 토큰에서 userId 추출 후 DB 확인
  // const userId = getUserIdFromRequest(req);
  // const user = await prisma.customer.findUnique({ where: { id: userId } });
  // return user?.role === "admin";
  return true; // 개발 시 임시로 true, 배포 전 실제 로직으로 교체하세요.
}

export async function GET(req: Request) {
  try {
    // 인증/권한 체크
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });
    }

    const items = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/admin/announcements error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, published } = body;

    const created = await prisma.announcement.create({
      data: {
        title,
        content,
        published: Boolean(published ?? false),
        // authorId: adminId 와 같이 설정 가능
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err) {
    console.error("POST /api/admin/announcements error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, content, published } = body;

    if (!id) return NextResponse.json({ ok: false, message: "id 필요" }, { status: 400 });

    const updated = await prisma.announcement.update({
      where: { id },
      data: { title, content, published: Boolean(published ?? false) },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error("PUT /api/admin/announcements error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ ok: false, message: "id 필요" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/announcements error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}
