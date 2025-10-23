// app/api/checkout/start/route.ts
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
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "잘못된 요청 형식입니다." }, { status: 400 });
    }

    const payload = body as Partial<CheckoutPayload>;

    // 구조 검증
    if (!payload.cart || !isCart(payload.cart)) {
      return NextResponse.json({ ok: false, message: "장바구니 정보가 유효하지 않습니다." }, { status: 400 });
    }
    if (!payload.form || !isForm(payload.form)) {
      return NextResponse.json({ ok: false, message: "주문자 이메일 등 폼 정보가 유효하지 않습니다." }, { status: 400 });
    }
    if (!payload.method || typeof payload.method !== "string") {
      return NextResponse.json({ ok: false, message: "결제 수단이 지정되지 않았습니다." }, { status: 400 });
    }

    const cart = payload.cart;
    if (!cart.items.length) {
      return NextResponse.json({ ok: false, message: "장바구니가 비어있습니다." }, { status: 400 });
    }

    // 필수 폼 필드(스키마 기준)
    const form = payload.form;
    const email = form.email.trim();
    const name = typeof form.name === "string" && form.name.trim().length > 0 ? form.name.trim() : null;
    const phone = typeof form.phone === "string" && form.phone.trim().length > 0 ? form.phone.trim() : null;
    const zipcode = typeof form.zipcode === "string" && form.zipcode.trim().length > 0 ? form.zipcode.trim() : null;
    const addr1 = typeof form.addr1 === "string" && form.addr1.trim().length > 0 ? form.addr1.trim() : null;
    const addr2 = typeof form.addr2 === "string" ? form.addr2.trim() : null;

    // schema에서 required인 필드는 서버에서 보장해야 함
    if (!name || !phone || !zipcode) {
      return NextResponse.json({ ok: false, message: "이름/전화번호/우편번호는 필수입니다." }, { status: 400 });
    }

    // 총합 계산
    const total = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
    if (total <= 0) {
      return NextResponse.json({ ok: false, message: "총 주문 금액이 유효하지 않습니다." }, { status: 400 });
    }

    // 상품 존재 및 가격 검증 (선택적 강검증)
    const productIds = [...new Set(cart.items.map((i) => i.id))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const it of cart.items) {
      const p = productMap.get(it.id);
      if (!p) {
        return NextResponse.json({ ok: false, message: `상품(${it.name})을 찾을 수 없습니다.` }, { status: 400 });
      }
      if (typeof p.price === "number" && p.price !== it.price) {
        return NextResponse.json({ ok: false, message: `상품(${it.name}) 가격이 변경되었습니다. 다시 시도하세요.` }, { status: 400 });
      }
    }

    // payMethod를 확실히 string으로 할당
    const method: string = String(payload.method);

    // DB 트랜잭션으로 주문과 주문아이템 생성
    const createdOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          email,
          name,
          phone,
          addr1: addr1 ?? "",
          addr2: addr2 ?? "",
          zipcode,
          totalAmount: total,
          payMethod: method,
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

      // 필요 시 재고 감소나 통계 처리 추가

      return ord;
    });

    // PG 연동(플레이스홀더)
    let redirectUrl: string | null = null;
    if (method === "NAVERPAY") {
      redirectUrl = `/order/${createdOrder.id}?mock=naverpay`;
    } else if (method === "TOSS") {
      redirectUrl = `/order/${createdOrder.id}?mock=toss`;
    } else {
      redirectUrl = `/order/${createdOrder.id}`;
    }

    return NextResponse.json({ ok: true, orderId: createdOrder.id, redirectUrl }, { status: 201 });
  } catch (err) {
    console.error("checkout start error:", err);
    return NextResponse.json({ ok: false, message: "결제 시작 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}