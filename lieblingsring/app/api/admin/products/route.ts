// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 관리자 상품 생성 API
 * - 요청 body: { title, description, price, category, imageUrl }
 * - 내부적으로는 Prisma Product 모델의 필드명(name, slug, description, price, subcategory, images 등)에 맞춰 변환합니다.
 */

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 클라이언트에서 title로 보낼 경우 서버에서 name으로 매핑
    const title = typeof body.title === "string" ? body.title.trim() : (typeof body.name === "string" ? body.name.trim() : "");
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const price = body.price !== undefined ? Number(body.price) : null;
    const category = typeof body.category === "string" ? body.category.trim() : null; // subcategory 필드에 저장
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : null;

    // 기본 검증
    if (!title) return NextResponse.json({ ok: false, message: "상품명(title)이 필요합니다." }, { status: 400 });
    if (!price || Number.isNaN(price)) return NextResponse.json({ ok: false, message: "유효한 가격(price)을 입력하세요." }, { status: 400 });

    const slug = makeSlug(title);

    // images: Product 스키마는 images: String[] 으로 되어 있으므로 배열로 넣음
    const images = imageUrl ? [imageUrl] : [];

    // 실제 Prisma 필드명에 맞춰서 생성 (name, slug, description, price, subcategory, images)
    const created = await prisma.product.create({
      data: {
        name: title,
        slug,
        summary: description ?? undefined,
        description: description ?? undefined,
        price: Math.floor(price),
        salePrice: null,
        images,
        subcategory: category ?? undefined,
        status: "ACTIVE", // enum ProductStatus에 맞는 값
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err) {
    console.error("POST /api/admin/products error", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}