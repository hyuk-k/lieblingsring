import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 주문 조회
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return NextResponse.json(order);
}

// 주문 수정 (예: 상태 변경)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.order.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

// 주문 삭제
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
