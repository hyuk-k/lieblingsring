import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const list = await prisma.lookbook.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await prisma.lookbook.create({ data: body });
  return NextResponse.json(item);
}

