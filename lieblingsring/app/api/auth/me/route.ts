// app/api/auth/me/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { verifyToken } from "@/lib/auth";

// export async function GET(req: NextRequest) {
//   try {
//     const cookieName = process.env.COOKIE_NAME ?? "auth_token";
//     const token = req.cookies.get(cookieName)?.value;
//     if (!token) return NextResponse.json({ ok: false, data: null });

//     const payload = await verifyToken(token);
//     if (!payload || !payload.sub) return NextResponse.json({ ok: false, data: null });

//     const user = await prisma.customer.findUnique({ where: { id: payload.sub as string } });
//     if (!user) return NextResponse.json({ ok: false, data: null });

//     const { password: _p, ...safe } = user as any;
//     return NextResponse.json({ ok: true, data: safe });
//   } catch (err) {
//     console.error("GET /api/auth/me error:", err);
//     return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
//   }
// }


// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTokenFromRequest, verifyToken, COOKIE_NAME } from "@/lib/auth";

/**
 * GET /api/auth/me
 * - 쿠키에서 토큰을 읽어 검증하고, 유효하면 사용자 정보를 반환합니다.
 * - 보안상 토큰 값을 그대로 반환하지 않습니다.
 */

export async function GET(req: Request) {
  try {
    // 토큰 추출 (lib/auth의 getTokenFromRequest 사용)
    const token = getTokenFromRequest(req as any);
    if (!token) {
      return NextResponse.json({ ok: false, message: "로그인 필요" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ ok: false, message: "유효하지 않은 토큰" }, { status: 401 });
    }

    // payload.sub를 user id로 사용
    const userId = payload.sub as string;
    const user = await prisma.customer.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: "사용자 없음" }, { status: 404 });
    }

    // 성공: 클라이언트는 ok/ user 정보로 로그인 여부 판단
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}