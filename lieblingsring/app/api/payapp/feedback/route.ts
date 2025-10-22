// app/api/payapp/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const PAYMENT_SECRET = process.env.PAYMENT_SECRET || ""; // PG가 제공한 시크릿(예시)
const EXPECTED_RESPONSE = "SUCCESS";

function verifyHmac(rawBody: string, signature: string | null) {
  if (!signature || !PAYMENT_SECRET) return false;
  const h = crypto.createHmac("sha256", PAYMENT_SECRET).update(rawBody).digest("hex");
  return h === signature;
}

export async function POST(req: NextRequest) {
  const raw = await req.text(); // x-www-form-urlencoded raw
  const params = new URLSearchParams(raw);

  // (선택) 서명 검증: PG가 header 또는 파라미터로 서명 제공 시
  // 예: signature가 header 'x-pay-signature'로 왔다면 req.headers.get('x-pay-signature')
  const signature = req.headers.get("x-pay-signature") || params.get("signature");
  if (PAYMENT_SECRET) {
    const ok = verifyHmac(raw, signature);
    if (!ok) {
      console.warn("PayApp signature mismatch", { rawPreview: raw.slice(0,200) });
      // 문서상 재전송 방지 필요하면 성공 응답 반환하되 내부 로깅/알림
      return new Response(EXPECTED_RESPONSE, { status: 200 });
    }
  }

  const orderId = params.get("var1") || "";
  const result = params.get("result") || "";
  const price = parseInt(params.get("price") || "0", 10);
  const tid = params.get("tid") || "";
  const payMethod = params.get("paymethod") || "";

  if (!orderId) {
    console.warn("PayApp callback missing orderId", raw);
    return new Response(EXPECTED_RESPONSE, { status: 200 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.warn("PayApp callback: order not found", orderId);
      return new Response(EXPECTED_RESPONSE, { status: 200 });
    }

    // 이미 결제 완료된 경우: idempotency
    if (order.status === "PAID") {
      // 이미 처리된 결제: 로깅 후 성공 반환
      console.info("PayApp callback: order already PAID", orderId);
      return new Response(EXPECTED_RESPONSE, { status: 200 });
    }

    // 금액 비교 (DB 필드명 확인: totalAmount 사용 예시)
    const dbAmount = typeof (order as any).totalAmount === "number"
      ? (order as any).totalAmount
      : Number((order as any).amount ?? 0);

    // 트랜잭션으로 상태 업데이트 + 결제 로그 생성
    if (result === "OK" && price === dbAmount) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID", payMethod, pgTid: tid },
        });
        await tx.payment.create({
          data: {
            orderId,
            provider: "PAYAPP",
            providerTid: tid,
            amount: price,
            method: payMethod,
            status: "SUCCESS",
            raw: raw, // optional: raw callback 저장 (주의: 민감정보)
          },
        });
      });
    } else {
      // 금액 불일치 또는 실패 코드
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "FAILED", payMethod, pgTid: tid },
        });
        await tx.payment.create({
          data: {
            orderId,
            provider: "PAYAPP",
            providerTid: tid,
            amount: price,
            method: payMethod,
            status: "FAILED",
            raw: raw,
          },
        });
      });

      // 내부 모니터링/알림(선택): 이메일/슬랙 전송 등
      console.warn("PayApp payment verification failed", { orderId, result, price, dbAmount });
    }

    // PG에 문서상 기대하는 문자열 그대로 반환
    return new Response(EXPECTED_RESPONSE, { status: 200 });
  } catch (err) {
    console.error("PayApp callback processing error:", err);
    // 재전송 루프를 막기 위해 문서 규격에 맞춰 성공 문자열 반환할 수도 있음
    return new Response(EXPECTED_RESPONSE, { status: 200 });
  }
}