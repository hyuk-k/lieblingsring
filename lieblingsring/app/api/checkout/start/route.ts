import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { form, method, cart } = await req.json() as any;

    if (!cart?.items?.length) {
      return NextResponse.json({ message: "장바구니가 비어있습니다." }, { status: 400 });
    }

    const total = cart.items.reduce((s: number, it: any) => s + it.price * it.qty, 0);

    // 1) 주문 생성
    const order = await prisma.order.create({
      data: {
        email: form.email, name: form.name, phone: form.phone,
        zipcode: form.zipcode, addr1: form.addr1, addr2: form.addr2,
        totalAmount: total, payMethod: method,
        items: {
          create: cart.items.map((it: any) => ({
            productId: it.id, name: it.name, price: it.price, qty: it.qty
          }))
        }
      }
    });

    // 2) PG 결제 준비(네이버페이/토스) — 아래는 “리다이렉트 URL을 받는다”는 골격 예시
    let redirectUrl: string | undefined;

    if (method === "NAVERPAY") {
      // 실제: 네이버페이 결제준비 서버 API 호출 (가맹점 인증키/서명 필요)
      // const res = await fetch("https://.../naverpay/ready", { ... });
      // const data = await res.json();
      // redirectUrl = data.redirectUrl;
      redirectUrl = `/order/${order.id}?mock=naverpay`; // 데모용
    } else if (method === "TOSS") {
      // Toss Payments: 서버에서 paymentKey/결제창 url 생성 or client 위젯 사용
      // const res = await fetch("https://api.tosspayments.com/v1/payments", { ... });
      // redirectUrl = data.checkout.url;
      redirectUrl = `/order/${order.id}?mock=toss`; // 데모용
    }

    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "결제 시작 실패" }, { status: 500 });
  }
}

