import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getTransport } from "@/lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, contact, product, sku, type, message, source } = req.body || {};
  if (!name || !contact || !message) return res.status(400).json({ error: "필수값 누락" });

  await prisma.inquiry.create({ data: { name, contact, product, sku, type, message, source } });

  try {
    const { transporter, from } = getTransport();
    await transporter.sendMail({
      from,
      to: process.env.INQUIRY_TO || from,
      subject: `[LIEBLINGSRING] 상담 문의 접수 - ${name}`,
      text: `이름: ${name}\n연락처: ${contact}\n상품: ${product || "-"}\n유형: ${type || "-"}\n내용:\n${message}\nsource: ${source || "-"}`,
    });
  } catch (e) {
    console.error("메일 전송 실패:", e);
  }

  return res.status(200).json({ ok: true });
}
