// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;

    // Prisma Product 모델에서 실제 필드명이 `subcategory`이면 여기서 매핑
    // (schema.prisma에서 Product.subcategory 를 사용하신 것으로 확인되어 매핑 처리)
    const where = category ? { subcategory: category } : undefined;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: products });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}