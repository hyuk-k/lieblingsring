import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CheckoutForm = {
  email: string;
  name?: string;
  phone?: string;
  zipcode?: string;
  addr1?: string;
  addr2?: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Cart = {
  items: CartItem[];
};

type CheckoutPayload = {
  form: CheckoutForm;
  method: string; // "NAVERPAY" | "TOSS" | other
  cart: Cart;
};

function isCartItem(obj: unknown): obj is CartItem {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.qty === "number"
  );
}

function isCart(obj: unknown): obj is Cart {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if (!Array.isArray(o.items)) return false;
  return o.items.every(isCartItem);
}

function isForm(obj: unknown): obj is CheckoutForm {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return typeof o.email === "string" && o.email.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    // 기본 구조 검증
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ message: "잘못된 요청 형식입니다." }, { status: 400 });
    }

    const payload = body as Partial<CheckoutPayload>;

    // 필수 필드 검사
    if (!payload.cart || !isCart(payload.cart)) {
      return NextResponse.json({ message: "장바구니 정보가 유효하지 않습니다." }, { status: 400 });
    }
    if (!payload.form || !isForm(payload.form)) {
      return NextResponse.json({ message: "주문자 이메일 등 폼 정보가 유효하지 않습니다." }, { status: 400 });
    }
    if (!payload.method || typeof payload.method !== "string") {
      return NextResponse.json({ message: "결제 수단이 지정되지 않았습니다." }, { status: 400 });
    }

    const cart = payload.cart;
    if (!cart.items.length) {
      return NextResponse.json({ message: "장바구니가 비어있습니다." }, { status: 400 });
    }

    // 총합 계산(타입 안전)
    const total = cart.items.reduce((s, it) => s + it.price * it.qty, 0);

    // 권장: 주문 생성 등 DB 작업은 트랜잭션으로 묶는 것이 안전합니다.
    // prisma.$transaction을 사용해 관련 작업을 묶을 것을 권장합니다.
    const order = await prisma.order.create({
      data: {
        email: payload.form.email,
        name: payload.form.name ?? null,
        phone: payload.form.phone ?? null,
        zipcode: payload.form.zipcode ?? null,
        addr1: payload.form.addr1 ?? null,
        addr2: payload.form.addr2 ?? null,
        totalAmount: total,
        payMethod: payload.method,
        items: {
          create: cart.items.map((it) => ({
            productId: it.id,
            name: it.name,
            price: it.price,
            qty: it.qty,
          })),
        },
      },
    });

    // 2) PG 결제 준비(네이버페이/토스) — 실제 연동 시 서버측 시크릿/인증 처리 필요
    let redirectUrl: string | undefined;

    if (payload.method === "NAVERPAY") {
      // TODO: 실제 네이버페이 결제준비 API 호출 및 응답에서 리다이렉트 URL 획득
      redirectUrl = `/order/${order.id}?mock=naverpay`;
    } else if (payload.method === "TOSS") {
      // TODO: Toss Payments 호출 또는 결제키 생성 후 checkout URL 반환
      redirectUrl = `/order/${order.id}?mock=toss`;
    }

    return NextResponse.json({ orderId: order.id, redirectUrl }, { status: 201 });
  } catch (err) {
    console.error("checkout start error:", err);
    // 내부 에러 메시지를 그대로 노출하지 않음
    return NextResponse.json({ message: "결제 시작 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}