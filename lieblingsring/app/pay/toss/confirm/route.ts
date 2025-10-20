import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    // (선택) 주문금액/상태 사전검증
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ message: "주문 없음" }, { status: 404 });
    if (order.totalAmount !== amount) {
      return NextResponse.json({ message: "금액 불일치" }, { status: 400 });
    }

    // 토스 Confirm API 호출
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

    const confirmRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, amount, paymentKey }),
      cache: "no-store",
    });

    const confirmData = await confirmRes.json();
    if (!confirmRes.ok) {
      return NextResponse.json(confirmData, { status: 400 });
    }

    // 승인 성공 → 주문 상태 업데이트
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", payTxId: confirmData.paymentKey }
    });

    return NextResponse.json({ ok: true, orderId });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "서버 오류" }, { status: 500 });
  }
}

