// app/api/qna/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ ok: false, message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 토큰에서 사용자 식별
    const token = getTokenFromRequest(req as any);
    if (!token) {
      return NextResponse.json({ ok: false, message: '로그인 필요' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ ok: false, message: '유효하지 않은 사용자' }, { status: 401 });
    }
    const authorId = payload.sub as string;

    // 사용자 존재 확인(optional)
    const user = await prisma.customer.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ ok: false, message: '유효하지 않은 사용자' }, { status: 401 });
    }

    const created = await prisma.qna.create({
      data: {
        title,
        content,
        authorId,
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err) {
    console.error('POST /api/qna error:', err);
    return NextResponse.json({ ok: false, message: '서버 오류' }, { status: 500 });
  }
}
