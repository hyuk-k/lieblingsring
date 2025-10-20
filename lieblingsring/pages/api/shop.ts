import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

const map: Record<string,string[]> = {
  "장신구": ["SILVER","전통","목걸이","브로치","반지","스트랩"],
  "소품": ["수세미","쏘맥","김장","인식표"],
  "기타": ["기타"]
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cat = String(req.query.cat || "장신구");
  const keywords = map[cat] || [];
  const where = {
    OR: keywords.map(k => ({ OR: [{ name: { contains: k } }, { summary: { contains: k } }] })),
    status: "ACTIVE" as const
  };
  const items = await prisma.product.findMany({
    where: keywords.length ? (where as any) : { status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });
  res.json({ items });
}
