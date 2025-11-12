// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;

    const where = category ? { category } : undefined;
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, data: products });
  } catch (err) {
    console.error('GET /api/products error', err);
    return NextResponse.json({ ok: false, message: '서버 오류' }, { status: 500 });
  }
}
