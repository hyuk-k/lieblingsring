// app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function isAdmin(req: Request) {
  // 실제 인증 로직으로 변경하세요
  return true;
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) return NextResponse.json({ ok:false, message:'권한 없음' }, { status:403 });
    const body = await req.json();
    const { title, description, price, category, imageUrl } = body;
    const created = await prisma.product.create({ data: { title, description, price: Number(price), category, imageUrl } });
    return NextResponse.json({ ok:true, data:created });
  } catch (err) {
    console.error('POST /api/admin/products error', err);
    return NextResponse.json({ ok:false, message:'서버 오류' }, { status:500 });
  }
}
