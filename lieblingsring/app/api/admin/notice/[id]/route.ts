import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 공지/Q&A 조회
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const notice = await prisma.inquiry.findUnique({ where: { id } });
  return NextResponse.json(notice);
}

// 공지/Q&A 수정
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.inquiry.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

// 공지/Q&A 삭제
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.inquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
