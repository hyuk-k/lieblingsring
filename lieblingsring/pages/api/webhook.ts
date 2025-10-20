import type { NextApiRequest, NextApiResponse } from "next";
// TODO: PG 웹훅(성공/실패) 수신 → 주문 상태 업데이트
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 시그니처 검증 후 Order.status 업데이트
  return res.status(200).json({ received: true });
}
