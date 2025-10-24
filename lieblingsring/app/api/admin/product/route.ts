// app/api/admin/product/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 간단한 slug 생성 함수: 이름을 소문자-알파벳/숫자/하이픈 형태로 변환
function makeSlug(input: unknown) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s\_]+/g, "-")       // 공백/언더스코어 -> 하이픈
    .replace(/[^\w\-]+/g, "")      // 허용 문자(영숫자, 언더스코어, 하이픈) 이외 제거
    .replace(/\-+/g, "-")          // 중복 하이픈 축소
    .replace(/^\-+|\-+$/g, "");    // 앞뒤 하이픈 제거
}

// TODO: 실제 관리자 인증 로직으로 대체하세요.
async function isAdmin(req: Request) {
  // 예: 쿠키/세션/헤더에서 토큰 검증
  return true;
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
    }

    const { name, price, description, imageUrls } = body as {
      name?: unknown;
      price?: unknown;
      description?: unknown;
      imageUrls?: unknown;
    };

    // 필수값 검증
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, message: "상품명(name)이 필요합니다." }, { status: 400 });
    }
    if (typeof price !== "number") {
      // 클라이언트가 문자열로 보낼 가능성이 있으면 Number()로 변환 후 검사해도 됩니다.
      return NextResponse.json({ ok: false, message: "가격(price)은 숫자여야 합니다." }, { status: 400 });
    }

    // imageUrls 안전 보정: 배열이면 string[]으로, 아니면 빈 배열
    let safeImageUrls: string[] = [];
    if (Array.isArray(imageUrls)) {
      safeImageUrls = imageUrls.filter((x) => typeof x === "string");
    }

    // slug 생성: 기본적으로 name 기반으로 생성하되 충돌 방지(동일 slug가 있으면 -n suffix)
    const baseSlug = makeSlug(name);
    let slug = baseSlug || `product-${Date.now()}`;

    // 충돌 검사: 동일 slug가 있는 경우 숫자 suffix 추가
    let collisionIndex = 0;
    while (true) {
      const exists = await prisma.product.findUnique({ where: { slug } });
      if (!exists) break;
      collisionIndex += 1;
      slug = `${baseSlug}-${collisionIndex}`;
    }

    // 실제 생성
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        description: typeof description === "string" ? description : "",
        imageUrls: safeImageUrls,
        slug,
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("create product error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}