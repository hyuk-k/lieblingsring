// app/api/inquiry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import he from "he"; // HTML escape (설치: npm i he)

/**
 * 환경변수(선택값)는 sendMailIfConfigured에서 확인하므로 앱 시작 시 강제하지 않습니다.
 * - CAPTCHA / rate-limit은 프론트·인프라(Cloudflare, Vercel Edge)와 연계 권장
 */

type CreateInquiryBody = {
  name: string;
  contact: string;   // 이메일 또는 전화
  product?: string | null;
  sku?: string | null;
  type?: string | null;     // ex) "QNA" | "NOTICE" | "ETC"
  message: string;
  source?: string | null;   // referrer 등
};

function isCreateInquiryBody(obj: unknown): obj is CreateInquiryBody {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return typeof o.name === "string" && typeof o.contact === "string" && typeof o.message === "string";
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isPhone(s: string) {
  // 간단한 숫자/하이픈 체크 (국가별 포맷은 별도 처리)
  return /^[0-9+\-()\s]{7,20}$/.test(s);
}

async function sendMailIfConfigured(data: CreateInquiryBody) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, INQUIRY_TO } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !INQUIRY_TO) {
    // 이메일 설정이 없으면 패스
    console.info("sendMailIfConfigured: SMTP not configured, skipping mail");
    return;
  }

  // 안전: HTML 인젝션 방지(escape)
  const esc = (s?: string | null) => (s ? he.encode(s) : "");

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subject = `[문의 접수] ${esc(data.name)} (${esc(data.contact)})`;
  const html = `
    <h2>새 문의가 접수되었습니다</h2>
    <ul>
      <li><b>이름:</b> ${esc(data.name)}</li>
      <li><b>연락처:</b> ${esc(data.contact)}</li>
      ${data.product ? `<li><b>상품:</b> ${esc(data.product)}</li>` : ""}
      ${data.sku ? `<li><b>SKU:</b> ${esc(data.sku)}</li>` : ""}
      ${data.type ? `<li><b>유형:</b> ${esc(data.type)}</li>` : ""}
      ${data.source ? `<li><b>유입:</b> ${esc(data.source)}</li>` : ""}
    </ul>
    <pre style="padding:12px;border:1px solid #eee;border-radius:8px;white-space:pre-wrap;">${esc(data.message)}</pre>
  `;

  try {
    // 메일 발송은 블로킹이므로, 운영에서는 큐(예: Bull, native background job) 권장
    await transporter.sendMail({
      from: SMTP_FROM,
      to: INQUIRY_TO,
      subject,
      html,
    });
    console.info("Inquiry email sent");
  } catch (err) {
    // 메일 실패는 치명적 아님: 로그 남기고 넘어감 (추후 재시도 큐에 넣기 권장)
    console.error("Failed to send inquiry email:", err);
  }
}

// POST /api/inquiry  : 문의 생성 + (옵션)메일 발송
export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json().catch(() => ({}));
    if (!isCreateInquiryBody(raw)) {
      return NextResponse.json({ ok: false, message: "필수 항목 누락 또는 형식 오류" }, { status: 400 });
    }

    const body = raw as CreateInquiryBody;

    // 서버측 추가 검증: 길이 제한 등
    if (body.name.length > 100) return NextResponse.json({ ok: false, message: "이름이 너무 깁니다" }, { status: 400 });
    if (body.message.length > 5000) return NextResponse.json({ ok: false, message: "메시지 길이 초과" }, { status: 400 });

    // contact 형식 기본 체크 (이메일 또는 전화)
    const contactIsEmail = isEmail(body.contact);
    const contactIsPhone = isPhone(body.contact);
    if (!contactIsEmail && !contactIsPhone) {
      return NextResponse.json({ ok: false, message: "연락처 형식(이메일 또는 전화)을 확인해 주세요" }, { status: 400 });
    }

    // DB 저장
    const saved = await prisma.inquiry.create({
      data: {
        name: body.name,
        contact: body.contact,
        product: body.product ?? null,
        sku: body.sku ?? null,
        type: body.type ?? null,
        message: body.message,
        source: body.source ?? null,
      },
    });

    // 메일 발송은 비동기로 격리 (await 해도 되지만 실패가 저장을 막지 않도록 try/catch 내부)
    sendMailIfConfigured(body).catch((err) => {
      console.error("sendMailIfConfigured error (background):", err);
      // 필요시 재시도 큐에 넣기
    });

    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (e) {
    console.error("POST /api/inquiry error:", e);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

// GET /api/inquiry?limit=20&page=1  : 최근 문의 목록(관리 페이지 등에서 사용)
// 권한: 관리용 엔드포인트라면 인증 체크 필요 (간단 예: 관리자 쿠키 또는 JWT)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 100);
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    // TODO: 관리자 인증 추가 (예: req.cookies 또는 Authorization header)
    const items = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.inquiry.count();

    return NextResponse.json({ ok: true, data: items, meta: { total, page, limit } });
  } catch (e) {
    console.error("GET /api/inquiry error:", e);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}