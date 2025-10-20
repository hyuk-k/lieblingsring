import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: PG(Toss/Nicepay/아임포트 등) 결제 세션 생성 로직 연결
  // 1) 주문 PENDING 생성
  // 2) PG 세션/결제키 발급
  // 3) 클라이언트에 세션 정보 반환
  return res.status(200).json({ ok: true, message: "PG 연동 자리" });
}
