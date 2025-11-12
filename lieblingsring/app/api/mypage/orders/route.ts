// app/api/mypage/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req as any);
    if (!token) return NextResponse.json({ ok:false, message:'로그인 필요' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ ok:false, message:'유효하지 않은 사용자' }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { customerId: payload.sub },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ok: true, data: orders });
  } catch (err) {
    console.error('GET /api/mypage/orders error', err);
    return NextResponse.json({ ok: false, message: '서버 오류' }, { status: 500 });
  }
}
