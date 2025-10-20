// app/api/payapp/feedback/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text(); // x-www-form-urlencoded
    const params = new URLSearchParams(raw);

    // PayApp에서 오는 주요 값들(이름은 매뉴얼 최신 문서를 확인하세요)
    const orderId   = params.get("var1") || "";         // 우리가 심어 보낸 값
    const result    = params.get("result");              // 예: "OK" 등
    const price     = Number(params.get("price") || 0);  // 결제 금액
    const tid       = params.get("tid") || "";           // 거래번호
    const payMethod = params.get("paymethod") || "";     // 실제 결제수단

    // 주문 조회
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return new Response("FAIL", { status: 200 });

    // 금액 검증 + 결과코드에 따라 상태 업데이트
    if (result === "OK" && price === order.amount) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", pgTid: tid, payMethod }
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED", pgTid: tid, payMethod }
      });
    }

    // 페이앱은 "SUCCESS" 문자열을 응답으로 기대 (문서 규정)
    return new Response("SUCCESS", { status: 200 });
  } catch (e) {
    // 실패해도 문자열은 SUCCESS로 마감해야 재전송 루프를 막을 수 있음(문서의 재시도 설명 참고)
    return new Response("SUCCESS", { status: 200 });
  }
}

