// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ user: null }, { status: 200 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ user: null }, { status: 200 });

    // 권장: 토큰 페이로드만 쓰지 말고 DB에서 최신 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true }, // 민감정보 제외
    });

    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("auth me error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}