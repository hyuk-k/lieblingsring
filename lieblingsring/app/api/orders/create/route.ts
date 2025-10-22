import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CartItemPayload = {
  id: string;     // product id
  qty: number;
};

type CreateOrderPayload = {
  cart: {
    items: CartItemPayload[];
  };
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
    zipcode?: string;
    addr1?: string;
    addr2?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    // 기본 구조 및 타입 검사
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ message: "잘못된 요청 형식입니다." }, { status: 400 });
    }
    const payload = body as CreateOrderPayload;

    if (!payload.cart || !Array.isArray(payload.cart.items) || payload.cart.items.length === 0) {
      return NextResponse.json({ message: "장바구니가 비어있습니다." }, { status: 400 });
    }

    // 유효한 항목만 필터링 및 검증
    const items = payload.cart.items
      .map((it) => ({
        id: it?.id,
        qty: Number(it?.qty ?? 0),
      }))
      .filter((it) => typeof it.id === "string" && it.id.length > 0 && Number.isFinite(it.qty) && it.qty > 0);

    if (items.length === 0) {
      return NextResponse.json({ message: "유효한 장바구니 항목이 없습니다." }, { status: 400 });
    }

    // DB에서 상품 가격을 조회하여 총액 계산 (서버 신뢰 원칙)
    const productIds = items.map((i) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });

    // 상품 매핑
    const priceMap = new Map<string, { name: string; price: number }>();
    for (const p of products) {
      priceMap.set(p.id, { name: p.name, price: p.price });
    }

    // 누락된 상품 체크
    const missing = items.filter((it) => !priceMap.has(it.id));
    if (missing.length > 0) {
      return NextResponse.json({ message: "장바구니에 없는 상품이 포함되어 있습니다." }, { status: 400 });
    }

    // 총금액 계산
    const totalAmount = items.reduce((sum, it) => {
      const info = priceMap.get(it.id)!;
      return sum + info.price * it.qty;
    }, 0);

    // 주문과 주문항목을 트랜잭션으로 생성
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          email: payload.customer?.email ?? "",
          name: payload.customer?.name ?? "",
          phone: payload.customer?.phone ?? "",
          zipcode: payload.customer?.zipcode ?? "",
          addr1: payload.customer?.addr1 ?? "",
          addr2: payload.customer?.addr2 ?? "",
          totalAmount: totalAmount,
          payMethod: "UNKNOWN", // 실제 결제 수단은 이후 결제 프로세스에서 업데이트
          status: "PENDING",
          items: {
            create: items.map((it) => {
              const info = priceMap.get(it.id)!;
              return {
                productId: it.id,
                name: info.name,
                price: info.price,
                qty: it.qty,
              };
            }),
          },
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: totalAmount,
        goodname: "LIEBLINGSRING 상품",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("orders/create error:", err);
    return NextResponse.json({ message: "주문 생성 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}