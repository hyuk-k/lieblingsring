export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CreateProductBody = {
  name?: unknown;
  price?: unknown;
  description?: unknown;
  imageUrls?: unknown;
};

// 간단한 slug 생성 함수: 이름을 소문자-영숫자/하이픈 형태로 변환
function makeSlug(input: unknown) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // 공백/언더스코어 -> 하이픈
    .replace(/[^\w\-]+/g, "") // 허용 문자(영숫자, 언더스코어, 하이픈) 이외 제거
    .replace(/\-+/g, "-") // 중복 하이픈 축소
    .replace(/^\-+|\-+$/g, ""); // 앞뒤 하이픈 제거
}

// TODO: 실제 관리자 인증 로직으로 교체하세요.
async function isAdmin(req: Request) {
  // 예: 쿠키/세션/헤더에서 토큰 검증
  return true;
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
    }

    const bodyRaw = await req.json().catch(() => null);
    if (!bodyRaw || typeof bodyRaw !== "object") {
      return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
    }

    const { name, price, description, imageUrls } = bodyRaw as CreateProductBody;

    // 필수값 검증
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, message: "상품명(name)이 필요합니다." }, { status: 400 });
    }

    // price 허용 형태: number 또는 숫자 문자열 -> 숫자로 변환 후 검사
    let priceNum: number | null = null;
    if (typeof price === "number") {
      priceNum = price;
    } else if (typeof price === "string" && price.trim() !== "") {
      const n = Number(price);
      if (!Number.isNaN(n)) priceNum = Math.floor(n);
    }
    if (priceNum === null || !Number.isFinite(priceNum) || priceNum <= 0) {
      return NextResponse.json({ ok: false, message: "유효한 가격(price)을 입력하세요." }, { status: 400 });
    }

    // 이미지 배열 보정: array이면 string[]으로 필터, 아니면 빈 배열
    let safeImageUrls: string[] = [];
    if (Array.isArray(imageUrls)) {
      safeImageUrls = imageUrls.filter((x) => typeof x === "string").map((s) => s.trim()).filter(Boolean);
    } else if (typeof imageUrls === "string" && imageUrls.trim() !== "") {
      // 클라이언트가 문자열로 콤마/세미콜론 구분된 URL을 보낼 경우 처리
      safeImageUrls = imageUrls
        .split(/;|,/)
        .map((s) => String(s).trim())
        .filter(Boolean);
    }

    // slug 생성: 기본적으로 name 기반으로 생성하되 충돌 방지(동일 slug가 있으면 -n suffix)
    const baseSlug = makeSlug(name);
    let slug = baseSlug || `product-${Date.now()}`;

    // 충돌 검사: 동일 slug가 있는 경우 숫자 suffix 추가 (안전: 최대 반복 제한)
    let collisionIndex = 0;
    while (true) {
      const exists = await prisma.product.findUnique({ where: { slug } });
      if (!exists) break;
      collisionIndex += 1;
      // 안전 방어: collisionIndex 너무 커지면 타임스탬프 붙임
      if (collisionIndex > 1000) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
      slug = `${baseSlug}-${collisionIndex}`;
    }

    // 실제 생성 (Prisma schema: Product.images: String[] 가 있어야 합니다)
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: priceNum,
        description: typeof description === "string" ? description : "",
        images: safeImageUrls, // schema에 images: String[] 로 되어 있는 경우
        slug,
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err: any) {
    console.error("create product error:", err);
    // 서버 내부 오류에 대해선 상세 메시지 노출을 최소화
    return NextResponse.json({ ok: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}