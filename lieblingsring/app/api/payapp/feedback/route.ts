// app/api/payapp/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * PAYAPP 피드백(예시) 처리
 * - body: { orderId, status, tid, amount, ... }
 * - Order.payTxId, Payment.txId 스키마 필드 사용
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const orderId = typeof body.orderId === "string" ? body.orderId : null;
    const status = typeof body.status === "string" ? body.status : null;
    const tid = typeof body.tid === "string" ? body.tid : null;
    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount || 0);

    if (!orderId || !status) {
      return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ ok: false, message: "order not found" }, { status: 404 });
    }

    // Idempotency: 이미 PAID면 재처리하지 않음
    if (order.status === "PAID" && status === "PAID") {
      return NextResponse.json({ ok: true, message: "already paid" });
    }

    // 트랜잭션으로 안전하게 처리: Order 업데이트 + Payment 생성
    await prisma.$transaction(async (tx) => {
      const newStatus = status === "PAID" ? "PAID" : status === "CANCEL" ? "FAILED" : status;

      // Order 업데이트 (payTxId 필드 사용)
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as any,
          payMethod: order.payMethod ?? "PAYAPP",
          payTxId: tid ?? undefined,
        },
      });

      // Payment 생성: relation으로 order 연결 + status 필드 포함
      await tx.payment.create({
        data: {
          order: { connect: { id: orderId } }, // relation connect
          provider: "PAYAPP",
          amount,
          txId: tid ?? undefined,
          status: newStatus as string, // schema에 status 필드가 있으면 저장
          raw: body as any,
        } as any,
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("payapp/feedback error:", err);
    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}