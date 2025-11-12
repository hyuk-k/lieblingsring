// app/api/mypage/points/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req as any);
    if (!token) return NextResponse.json({ ok:false, message:'로그인 필요' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ ok:false, message:'유효하지 않은 사용자' }, { status: 401 });

    const p = await prisma.point.findUnique({ where: { customerId: payload.sub } });
    return NextResponse.json({ ok: true, data: p });
  } catch (err) {
    console.error('GET /api/mypage/points error', err);
    return NextResponse.json({ ok:false, message: '서버 오류' }, { status: 500 });
  }
}
