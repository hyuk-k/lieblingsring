// app/pay/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type ConfirmBody = {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const { paymentKey, orderId, amount } = body as ConfirmBody;

    // 1) 요청 유효성 검사
    if (!paymentKey || typeof paymentKey !== "string" || !orderId || typeof orderId !== "string" || typeof amount !== "number") {
      return NextResponse.json({ message: "유효하지 않은 요청입니다." }, { status: 400 });
    }

    // 2) 주문 조회 및 사전검증
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ message: "주문을 찾을 수 없습니다." }, { status: 404 });

    // 이미 결제된 주문이면 아이덴포텐시 처리: 성공 응답으로 무시하거나 상세 로그 남김
    if (order.status === "PAID") {
      // 이미 PAID인 경우, 재시도일 수 있으니 성공으로 응답
      return NextResponse.json({ ok: true, orderId, note: "already paid" });
    }

    // DB 필드명이 totalAmount인지 amount인지 프로젝트 스키마에 따라 확인하세요
    const dbAmount = (order as any).totalAmount ?? (order as any).amount ?? 0;
    if (Number(dbAmount) !== amount) {
      return NextResponse.json({ message: "금액 불일치" }, { status: 400 });
    }

    // 3) Toss Secret Key 확인
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      console.error("TOSS_SECRET_KEY not configured");
      return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
    }

    const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

    // 4) Toss Confirm 호출
    const confirmRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, amount, paymentKey }),
      cache: "no-store",
    });

    // 5) Toss 응답 파싱 및 검증
    const confirmData = await confirmRes.json().catch(() => null);

    if (!confirmRes.ok || !confirmData) {
      // Toss API 자체 오류 또는 파싱 실패
      console.error("Toss confirm failed", { status: confirmRes.status, bodyPreview: JSON.stringify(confirmData)?.slice(0, 500) });
      return NextResponse.json({ message: "결제 확인 실패" }, { status: 400 });
    }

    // confirmData의 성공 판별 로직은 Toss 문서에 맞춰 조정하세요.
    // 예: confirmData.status === "DONE" 또는 confirmData.paymentKey 존재 등
    const confirmed = (confirmData.status === "DONE") || !!confirmData.paymentKey || !!confirmData.paymentKey;
    if (!confirmed) {
      console.warn("Toss confirm returned non-success", { confirmData });
      // 결제 실패 처리: 주문 상태 실패로 반영(옵션)
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED", payTxId: confirmData.paymentKey ?? confirmData.tid ?? null },
      });
      return NextResponse.json({ message: "결제 승인 실패" }, { status: 400 });
    }

    // 6) 승인 성공 → 트랜잭션으로 주문 상태 업데이트 및 결제 로그 생성 권장
    const payTxId = confirmData.paymentKey ?? confirmData.tid ?? paymentKey;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID", payTxId },
      });

      // (선택) 결제 로그를 저장하는 payment 테이블이 있으면 생성
      if ((tx as any).payment) {
        await (tx as any).payment.create({
          data: {
            orderId,
            provider: "TOSS",
            providerTxId: payTxId,
            amount,
            raw: confirmData,
            status: "SUCCESS",
          },
        });
      }
    });

    return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("toss/confirm error:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}