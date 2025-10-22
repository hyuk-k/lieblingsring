import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * ✅ Lookbook 단건 조회 (GET)
 * /api/admin/lookbook/[id]
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ Promise 해제 (Next.js 15 대응)
  const look = await prisma.lookbook.findUnique({ where: { id } });
  return NextResponse.json(look);
}

/**
 * ✅ Lookbook 수정 (PUT)
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.lookbook.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

/**
 * ✅ Lookbook 삭제 (DELETE)
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.lookbook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
