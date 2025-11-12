// app/api/mypage/profile/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req as any);
    if (!token) return NextResponse.json({ ok: false, message: "로그인 필요" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ ok: false, message: "유효하지 않은 사용자" }, { status: 401 });

    const userId = payload.sub;
    const body = await req.json();
    const { name, password } = body;

    const data: any = {};
    if (typeof name === "string" && name.trim() !== "") data.name = name.trim();
    if (typeof password === "string" && password.length >= 6) data.password = await bcrypt.hash(password, 10);

    if (Object.keys(data).length === 0) return NextResponse.json({ ok: false, message: "변경할 내용이 없습니다." }, { status: 400 });

    const updated = await prisma.customer.update({ where: { id: userId }, data });
    return NextResponse.json({ ok: true, data: { id: updated.id, email: updated.email, name: updated.name } });
  } catch (err) {
    console.error("POST /api/mypage/profile error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}
