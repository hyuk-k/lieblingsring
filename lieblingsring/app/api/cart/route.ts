// lieblingsring/lieblingsring/app/api/cart/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 흐름(최적안):
 * - 클라이언트는 userId(또는 customerId)와 productId, qty를 전송
 * - 서버는 userId로 Cart를 찾거나 생성한 뒤 CartItem을 cartId로 생성
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, message: "잘못된 요청" }, { status: 400 });

    const { productId, qty = 1, userId } = body as { productId?: string; qty?: number; userId?: string };
    if (!productId) return NextResponse.json({ ok: false, message: "productId 필요" }, { status: 400 });

    // 1) userId -> Cart 찾기(없으면 생성)
    //    만약 로그인 기반이 아니라면 클라이언트쪽에서 localStorage로 cart 관리 권장
    let cartId: string | null = null;
    if (userId) {
      let cart = await prisma.cart.findFirst({ where: { customerId: userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { customerId: userId } });
      }
      cartId = cart.id;
    } else {
      // userId가 없으면 임시 오류 처리(또는 클라이언트 로컬 저장 권장)
      return NextResponse.json({ ok: false, message: "로그인한 사용자만 서버에 카트 저장 가능합니다." }, { status: 400 });
    }

    // 2) 상품 정보를 일부 읽어오고(이름/가격) CartItem 생성
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ ok: false, message: "product를 찾을 수 없습니다." }, { status: 404 });

    const item = await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId: null,
        name: product.name,
        price: product.price,
        qty: typeof qty === "number" && qty > 0 ? Math.floor(qty) : 1,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("cart POST error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ ok: false, items: [] });

    // userId로 Cart 찾고 그 cart의 items 반환
    const cart = await prisma.cart.findFirst({ where: { customerId: userId } });
    if (!cart) return NextResponse.json({ ok: true, items: [] });

    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("cart GET error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}