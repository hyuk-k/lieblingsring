// app/api/admin/product/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, description, imageUrls } = body;

    if (!name || typeof price !== "number") {
      return NextResponse.json({ ok: false, message: "필수 값 누락" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        description: description ?? "",
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("create product error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}