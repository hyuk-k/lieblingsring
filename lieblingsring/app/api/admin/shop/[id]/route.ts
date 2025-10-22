import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 상품 조회
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({ where: { id } });
  return NextResponse.json(product);
}

// 상품 수정
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.product.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

// 상품 삭제
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
