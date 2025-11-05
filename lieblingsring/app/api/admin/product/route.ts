// lieblingsring/lieblingsring/app/api/admin/product/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function isAdmin(req: Request) {
  // 실제 인증 로직으로 교체하세요
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

    const { name, price, description, images, subcategory } = body as {
      name?: unknown;
      price?: unknown;
      description?: unknown;
      images?: unknown;
      subcategory?: unknown;
    };

    if (!name || typeof name !== "string") {
      return NextResponse.json({ ok: false, message: "상품명 필요" }, { status: 400 });
    }

    let priceNum: number | null = null;
    if (typeof price === "number") priceNum = price;
    else if (typeof price === "string" && price.trim() !== "") {
      const n = Number(price);
      if (!Number.isNaN(n)) priceNum = Math.floor(n);
    }
    if (priceNum === null) {
      return NextResponse.json({ ok: false, message: "유효한 가격 필요" }, { status: 400 });
    }

    // subcategory 안전값 보정: 허용 값만 통과시키기 (안전)
    const allowed = ["jewelry", "smallitem", "other"];
    let safeSub = undefined as string | undefined;
    if (typeof subcategory === "string" && allowed.includes(subcategory)) safeSub = subcategory;

    const safeImages: string[] = Array.isArray(images) ? images.filter((x) => typeof x === "string") : [];

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: priceNum,
        description: typeof description === "string" ? description : "",
        images: safeImages,
        subcategory: safeSub,
        slug: name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""),
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err: any) {
    console.error("admin product create error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}