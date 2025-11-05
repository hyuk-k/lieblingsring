// lieblingsring/lieblingsring/app/api/shop/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 클라이언트에서 ?cat=장신구 또는 ?cat=소품 또는 ?cat=기타 로 보냄
 * 각 한글 탭명에 대해 검색 키워드 배열(map)을 두고,
 * name 또는 summary 필드에 키워드가 포함되는지(대소문자 무시)로 검색합니다.
 *
 * ALLOWED_TAB: 클라이언트에서 보내는 값(한글)
 * MAP: 각 탭에 대해 검색할 키워드 배열
 */

const MAP: Record<string, string[]> = {
  "장신구": ["SILVER", "전통", "목걸이", "브로치", "반지", "스트랩"],
  "소품": ["수세미", "쏘맥", "김장", "인식표"],
  "기타": ["기타"],
};

const ALLOWED_TABS = Object.keys(MAP);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cat = String(url.searchParams.get("cat") ?? "장신구"); // 기본 탭: 장신구

    // 허용된 탭인지 확인
    const keywords = MAP[cat] ?? [];

    // Prisma where 조립: keywords가 있으면 OR 조건으로 name 또는 summary에 contains (case-insensitive)
    let where: any = { status: "ACTIVE" as const };

    if (keywords.length > 0) {
      // 각 키워드마다 (name contains OR summary contains) 를 만들고,
      // 최종적으로 OR: [ { OR: [...] }, { OR: [...] }, ... ] 형태로 설정
      where = {
        AND: [
          { status: "ACTIVE" },
          {
            OR: keywords.map((k) => ({
              OR: [
                { name: { contains: k, mode: "insensitive" } },
                { summary: { contains: k, mode: "insensitive" } },
              ],
            })),
          },
        ],
      };
    }

    const items = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        images: true,
        summary: true,
        createdAt: true,
        subcategory: true,
      },
    });

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("api/shop GET error:", err);
    return NextResponse.json({ ok: false, message: err?.message ?? "서버 오류" }, { status: 500 });
  }
}