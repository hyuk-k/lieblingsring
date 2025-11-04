// lieblingsring/lieblingsring/app/api/admin/product/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Body = {
  name?: unknown;
  price?: unknown;
  description?: unknown;
  images?: unknown;
};

async function isAdmin(req: Request) {
  // 실제 인증 로직으로 교체하세요 (쿠키/헤더 검증 등)
  return true;
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "잘못된 요청" }, { status: 400 });
    }

    const { name, price, description, images } = body as Body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, message: "상품명(name)이 필요합니다." }, { status: 400 });
    }

    let priceNum: number | null = null;
    if (typeof price === "number") priceNum = price;
    else if (typeof price === "string" && price.trim() !== "") {
      const n = Number(price);
      if (!Number.isNaN(n)) priceNum = Math.floor(n);
    }
    if (priceNum === null) {
      return NextResponse.json({ ok: false, message: "유효한 가격(price)을 입력하세요." }, { status: 400 });
    }

    let safeImages: string[] = [];
    if (Array.isArray(images)) {
      safeImages = images.filter((x) => typeof x === "string");
    } else if (typeof images === "string" && images.trim() !== "") {
      safeImages = [images];
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: priceNum,
        description: typeof description === "string" ? description : "",
        images: safeImages,
        slug: (name as string).toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""),
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err: any) {
    console.error("create product error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}