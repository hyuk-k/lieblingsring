// app/api/inquiry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

type CreateInquiryBody = {
  name: string;
  contact: string;   // 이메일 또는 전화
  product?: string;
  sku?: string;
  type?: string;     // ex) "QNA" | "NOTICE" | "ETC"
  message: string;
  source?: string;   // referrer 등
};

// (선택) 이메일 발송기
async function sendMailIfConfigured(data: CreateInquiryBody) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, INQUIRY_TO } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !INQUIRY_TO) {
    // 이메일 설정이 없으면 그냥 패스 (DB만 저장)
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subject = `[문의 접수] ${data.name} (${data.contact})`;
  const html = `
    <h2>새 문의가 접수되었습니다</h2>
    <ul>
      <li><b>이름:</b> ${data.name}</li>
      <li><b>연락처:</b> ${data.contact}</li>
      ${data.product ? `<li><b>상품:</b> ${data.product}</li>` : ""}
      ${data.sku ? `<li><b>SKU:</b> ${data.sku}</li>` : ""}
      ${data.type ? `<li><b>유형:</b> ${data.type}</li>` : ""}
      ${data.source ? `<li><b>유입:</b> ${data.source}</li>` : ""}
    </ul>
    <pre style="padding:12px;border:1px solid #eee;border-radius:8px;white-space:pre-wrap;">${data.message}</pre>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to: INQUIRY_TO,
    subject,
    html,
  });
}

// POST /api/inquiry  : 문의 생성 + (옵션)메일 발송
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateInquiryBody;

    if (!body?.name || !body?.contact || !body?.message) {
      return NextResponse.json({ ok: false, message: "필수 항목 누락" }, { status: 400 });
    }

    // DB 저장
    const saved = await prisma.inquiry.create({
      data: {
        name: body.name,
        contact: body.contact,
        product: body.product || null,
        sku: body.sku || null,
        type: body.type || null,
        message: body.message,
        source: body.source || null,
      },
    });

    // (옵션) 메일 발송
    await sendMailIfConfigured(body);

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

// GET /api/inquiry?limit=20  : 최근 문의 목록(관리 페이지 등에서 사용)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 20);

  const items = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });

  return NextResponse.json({ ok: true, items });
}

