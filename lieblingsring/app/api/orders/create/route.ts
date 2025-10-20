// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // 프로젝트의 Prisma 경로에 맞춰 수정

export async function POST(req: NextRequest) {
  try {
    const { cart, customer } = await req.json();

    // TODO: cart.items를 서버에서 검증/가격조회하여 total 계산
    const amount = Math.max(0, Number(cart?.total || 0));

    // 주문 생성 (상태: PENDING)
    const order = await prisma.order.create({
      data: {
        amount,
        status: "PENDING",
        buyerEmail: customer?.email || "",
        buyerName: customer?.name || "",
        buyerPhone: customer?.phone || "",
        shipZip: customer?.zipcode || "",
        shipAddr1: customer?.addr1 || "",
        shipAddr2: customer?.addr2 || "",
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      goodname: "LIEBLINGSRING 상품",
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "주문 생성 실패" }, { status: 400 });
  }
}

