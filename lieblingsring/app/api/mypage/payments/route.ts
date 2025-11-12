// app/api/mypage/payments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req as any);
    if (!token) return NextResponse.json({ ok:false, message:'로그인 필요' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ ok:false, message:'유효하지 않은 사용자' }, { status: 401 });

    // 최근 결제 내역
    const payments = await prisma.payment.findMany({
      where: { order: { customerId: payload.sub } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ ok:true, data: payments });
  } catch (err) {
    console.error('GET /api/mypage/payments error', err);
    return NextResponse.json({ ok:false, message:'서버 오류' }, { status: 500 });
  }
}
