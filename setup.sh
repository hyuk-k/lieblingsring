#!/usr/bin/env bash
set -e

APP_NAME="lieblingsring"

echo "1) Next.js 앱 생성"
npx create-next-app@latest $APP_NAME --ts --app --src-dir=false --import-alias "@/*" --use-npm --eslint

cd $APP_NAME

echo "2) 의존성 설치"
npm i prisma @prisma/client zod nodemailer
npm i -D ts-node

echo "3) 폴더 생성"
mkdir -p lib components prisma pages/api public styles app/products app/products/[slug] app/cart app/checkout app/inquiry app/inquiry/thanks

echo "4) 환경변수 예시 작성(.env.example)"
cat > .env.example << 'EOF'
# DB
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# Google Analytics
NEXT_PUBLIC_GA_ID=

# SMTP(문의 메일 발송)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
INQUIRY_TO=
EOF

echo "5) Prisma 초기화 파일 작성"
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = env("DB_PROVIDER")
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  price       Int
  salePrice   Int?
  status      ProductStatus @default(ACTIVE)
  isCustom    Boolean  @default(false)
  stock       Int      @default(10)
  summary     String?
  description String?
  images      String[] @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProductStatus {
  ACTIVE
  SOLD_OUT
  HIDDEN
}

model Order {
  id          String   @id @default(cuid())
  email       String
  lineItems   Json
  amount      Int
  currency    String   @default("KRW")
  status      OrderStatus @default(PENDING)
  pgSessionId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum OrderStatus {
  PENDING
  PAID
  CANCELED
  FAILED
}

model Inquiry {
  id          String   @id @default(cuid())
  name        String
  contact     String
  product     String?
  sku         String?
  type        String?
  message     String
  source      String?
  createdAt   DateTime @default(now())
}
EOF

cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { name:"Daily Plain Ring 2mm", slug:"daily-plain-2", price:39000, images:["/placeholder.jpg"], summary:"매일 끼는 베이직 링" },
      { name:"Daily Plain Ring 3mm", slug:"daily-plain-3", price:49000, images:["/placeholder.jpg"], summary:"존재감은 살리고, 부담은 덜고" },
      { name:"Twist Line Ring", slug:"twist-line", price:59000, images:["/placeholder.jpg"], summary:"트위스트 쉐입의 리듬감" },
      { name:"Couple Set Minimal", slug:"couple-set", price:220000, isCustom:true, images:["/placeholder.jpg"], summary:"커플 세트 - 상담 후 구매" },
      { name:"Bold Mirror Ring 4mm", slug:"bold-mirror-4", price:69000, images:["/placeholder.jpg"], summary:"유광의 깊이를 즐기는 볼드" },
      { name:"Signature Engrave Ring", slug:"signature-engrave", price:180000, isCustom:true, images:["/placeholder.jpg"], summary:"이니셜 각인 맞춤 제작" },
    ]
  });
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
EOF

echo "6) 라이브러리 파일 작성(lib)"
cat > lib/db.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
export const prisma = (global as any).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (global as any).prisma = prisma;
EOF

cat > lib/ga.ts << 'EOF'
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const gtag = {
  event: (action: string, params: Record<string, any> = {}) => {
    if (typeof window === "undefined" || !GA_ID) return;
    // @ts-ignore
    window.gtag("event", action, params);
  },
};
EOF

cat > lib/seo.ts << 'EOF'
export const defaultTitle = "LIEBLINGSRING | 매일의 순간에, 영원을 더하다";
export const defaultDesc =
  "미니멀 주얼리, 무료 사이즈 교환과 간편 결제. Daily/Pairs/Special 컬렉션을 만나보세요.";
EOF

cat > lib/mail.ts << 'EOF'
import nodemailer from "nodemailer";
export function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env as Record<string,string>;
  if (!SMTP_HOST) throw new Error("SMTP 설정이 필요합니다.");
  return {
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
    from: SMTP_FROM || SMTP_USER,
  };
}
EOF

echo "7) 전역 스타일 덮어쓰기(styles/globals.css)"
cat > styles/globals.css << 'EOF'
:root { --black:#000; --gray:#666; --border:#e5e7eb; --bg:#fff; }
*{box-sizing:border-box}
html,body{padding:0;margin:0}
body{font-family:system-ui,"Noto Sans KR",sans-serif;color:#111;background:#fff;line-height:1.5}
a{color:inherit;text-decoration:none}
.container{max-width:1040px;margin:0 auto;padding:0 16px}
.btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:8px;border:1px solid transparent;transition:.2s;font-weight:600}
.btn-primary{background:#000;color:#fff}
.btn-outline{background:#fff;color:#000;border-color:#000}
.input,.textarea,select{width:100%;border:1px solid var(--border);padding:10px 12px;border-radius:8px}
.textarea{min-height:120px}
.prose h2{font-size:20px;margin:16px 0 8px}
.prose h3{font-size:18px;margin:14px 0 6px}
header{border-bottom:1px solid var(--border);background:#fff;position:sticky;top:0;z-index:10}
header .wrap{display:flex;align-items:center;gap:16px;justify-content:space-between;padding:10px 16px}
nav a{padding:8px 10px;border-radius:6px}
nav a:hover{background:#f5f5f5}
footer{border-top:1px solid var(--border);padding:20px 16px;margin-top:40px;color:#555}
img{max-width:100%;height:auto;display:block}
.grid{display:grid}
EOF

echo "8) 레이아웃/네비/푸터(app/layout.tsx 등)"
cat > app/layout.tsx << 'EOF'
import "./globals.css";
import { defaultTitle, defaultDesc } from "@/lib/seo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: defaultTitle,
  description: defaultDesc,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="ko">
      <head>
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{__html:`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: true });
`}} />
          </>
        )}
      </head>
      <body>
        <header>
          <div className="wrap container">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="LIEBLINGSRING 로고" style={{height:28}} />
            </a>
            <nav>
              <a href="/products">컬렉션</a>
              <a href="/inquiry" style={{marginLeft:8}}>고객센터(문의)</a>
              <a href="/cart" style={{marginLeft:8}}>장바구니</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
EOF

cat > components/Nav.tsx << 'EOF'
export default function Nav(){ return null; }
EOF

cat > components/Footer.tsx << 'EOF'
export default function Footer(){
  return (
    <footer>
      <div className="container">
        <div>고객센터: 010-0000-0000 · cs@lieblingsring.co.kr (평일 10:00~17:00)</div>
        <div style={{marginTop:6, fontSize:14}}>
          사업자정보/약관/개인정보 링크는 오픈 전 실제 정보로 교체해 주세요.
        </div>
      </div>
    </footer>
  );
}
EOF

echo "9) 홈/목록/카드(app/page.tsx, app/products/page.tsx, components/ProductCard.tsx)"
cat > app/page.tsx << 'EOF'
import Link from "next/link";

export default function Home() {
  return (
    <section className="py-16 text-center">
      <img src="/logo.svg" alt="LIEBLINGSRING 로고" style={{height:48, margin:"0 auto 12px"}} />
      <h1 style={{fontSize:28,fontWeight:700}}>매일의 순간에, 영원을 더하다</h1>
      <p style={{marginTop:8,color:"#666"}}>미니멀 주얼리 · 무료 사이즈 교환 · 간편 결제</p>
      <div style={{marginTop:18, display:"flex", justifyContent:"center", gap:12}}>
        <Link className="btn btn-primary" href="/products">오늘의 베스트 보기</Link>
        <Link className="btn btn-outline" href="/inquiry">상담 문의</Link>
      </div>
    </section>
  );
}
EOF

cat > app/products/page.tsx << 'EOF'
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function Products() {
  const products = await prisma.product.findMany({ where: { status: "ACTIVE" } });
  return (
    <div className="py-10 grid" style={{gap:24, gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))"}}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
EOF

cat > components/ProductCard.tsx << 'EOF'
import Link from "next/link";
import type { Product } from "@prisma/client";

export default function ProductCard({ product }: { product: Product }) {
  const price = product.salePrice ?? product.price;
  return (
    <div style={{border:"1px solid #e5e7eb", borderRadius:8, padding:12}}>
      <Link href={`/products/${product.slug}`}>
        <img src={product.images[0] || "/placeholder.jpg"} alt={`${product.name} 이미지`} style={{width:"100%", aspectRatio:"1/1", objectFit:"cover"}} />
        <h3 style={{marginTop:10, fontSize:18, fontWeight:600}}>{product.name}</h3>
      </Link>
      <div style={{marginTop:6}}>
        {product.salePrice ? (
          <>
            <span style={{color:"#dc2626", fontWeight:700}}>{price.toLocaleString()}원</span>
            <span style={{marginLeft:8, textDecoration:"line-through", color:"#9ca3af"}}>{product.price.toLocaleString()}원</span>
          </>
        ) : (
          <span style={{fontWeight:700}}>{price.toLocaleString()}원</span>
        )}
      </div>
      <div style={{marginTop:10}}>
        <Link href={`/products/${product.slug}`} className="btn btn-primary" style={{width:"100%"}}>바로구매</Link>
      </div>
    </div>
  );
}
EOF

echo "10) 상세 + 이중 CTA(app/products/[slug]/page.tsx, components/CTAButtons.tsx)"
cat > app/products/[slug]/page.tsx << 'EOF'
import { prisma } from "@/lib/db";
import CTAButtons from "@/components/CTAButtons";
import { notFound } from "next/navigation";

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product || product.status === "HIDDEN") return notFound();

  const isSoldOut = product.status === "SOLD_OUT";
  const inquiryPrimary = isSoldOut || product.isCustom || (product.price >= 200000);

  return (
    <div className="py-10" style={{display:"grid", gridTemplateColumns:"1fr", gap:24}}>
      <img src={product.images[0] || "/placeholder.jpg"} alt={`${product.name} 이미지`} style={{width:"100%", maxWidth:560, aspectRatio:"1/1", objectFit:"cover", margin:"0 auto"}} />
      <div>
        <h1 style={{fontSize:24, fontWeight:700}}>{product.name}</h1>
        <p style={{marginTop:8, color:"#666"}}>{product.summary}</p>
        <p style={{marginTop:12, fontSize:20, fontWeight:700}}>{(product.salePrice ?? product.price).toLocaleString()}원</p>

        <div style={{marginTop:16}}>
          <CTAButtons product={product} inquiryPrimary={inquiryPrimary} disabledBuy={isSoldOut} />
        </div>

        <section className="prose" style={{marginTop:28}}>
          <h2>상세 정보</h2>
          <p>{product.description || "소재/사이즈/케어/배송 정보를 확인하세요."}</p>
          <h3>배송/교환</h3>
          <ul>
            <li>오후 2시 이전 주문 당일 발송(영업일)</li>
            <li>7일 이내 사이즈 1회 교환</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
EOF

cat > components/CTAButtons.tsx << 'EOF'
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gtag } from "@/lib/ga";
import type { Product } from "@prisma/client";

export default function CTAButtons({
  product,
  inquiryPrimary,
  disabledBuy,
}: {
  product: Product;
  inquiryPrimary: boolean;
  disabledBuy?: boolean;
}) {
  const router = useRouter();
  const inquiryHref = `/inquiry?product=${encodeURIComponent(product.name)}&source=pdp`;

  const onAddToCart = () => {
    gtag.event("add_to_cart", {
      value: product.salePrice ?? product.price,
      currency: "KRW",
      items: [{ item_id: product.id, item_name: product.name }],
    });
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find((c: any) => c.id === product.id);
    if (found) found.qty += 1;
    else cart.push({ id: product.id, name: product.name, price: product.salePrice ?? product.price, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const buy = () => {
    if (disabledBuy) return;
    onAddToCart();
    gtag.event("begin_checkout", { items: [{ item_id: product.id, item_name: product.name }] });
    router.push("/checkout");
  };

  const BuyBtn = (
    <button className={`btn ${inquiryPrimary ? "btn-outline" : "btn-primary"}`} onClick={buy} disabled={disabledBuy} aria-disabled={disabledBuy}>
      {disabledBuy ? "품절" : "바로구매"}
    </button>
  );

  const InquiryBtn = (
    <Link href={inquiryHref} className={`btn ${inquiryPrimary ? "btn-primary" : "btn-outline"}`} onClick={() => gtag.event("select_content", { content_type: "inquiry", item_id: product.id, source: "pdp" })}>
      상담 문의
    </Link>
  );

  return <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>{inquiryPrimary ? (<>{InquiryBtn}{BuyBtn}</>) : (<>{BuyBtn}{InquiryBtn}</>)}</div>;
}
EOF

echo "11) 장바구니/결제(app/cart/page.tsx, app/checkout/page.tsx)"
cat > app/cart/page.tsx << 'EOF'
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  useEffect(() => { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); }, []);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  return (
    <div className="py-10">
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:12}}>장바구니</h1>
      {cart.length === 0 ? <p>담긴 상품이 없습니다.</p> : (
        <>
          <ul style={{display:"grid", gap:8}}>
            {cart.map((c, i) => (
              <li key={i} style={{display:"flex", justifyContent:"space-between", border:"1px solid #e5e7eb", padding:12, borderRadius:8}}>
                <span>{c.name} x {c.qty}</span>
                <span>{(c.price * c.qty).toLocaleString()}원</span>
              </li>
            ))}
          </ul>
          <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:20, fontWeight:700}}>합계 {total.toLocaleString()}원</span>
            <Link href="/checkout" className="btn btn-primary">결제하기</Link>
          </div>
        </>
      )}
    </div>
  );
}
EOF

cat > app/checkout/page.tsx << 'EOF'
"use client";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  useEffect(() => { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); }, []);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const onPay = async () => {
    const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ cart }) });
    if (res.ok) alert("결제 세션 생성(데모). 실제 PG 연동이 필요합니다.");
  };

  return (
    <div className="py-10">
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:12}}>결제</h1>
      <p style={{color:"#666", marginBottom:10}}>테스트 결제 화면입니다. PG 연동 후 실제 결제가 진행됩니다.</p>
      <ul style={{display:"grid", gap:8}}>
        {cart.map((c, i) => <li key={i} style={{display:"flex", justifyContent:"space-between"}}><span>{c.name} x {c.qty}</span><span>{(c.price*c.qty).toLocaleString()}원</span></li>)}
      </ul>
      <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{fontSize:20, fontWeight:700}}>합계 {total.toLocaleString()}원</span>
        <button className="btn btn-primary" onClick={onPay}>결제 진행</button>
      </div>
    </div>
  );
}
EOF

echo "12) 문의 폼/감사(app/inquiry/page.tsx, app/inquiry/thanks/page.tsx)"
cat > app/inquiry/page.tsx << 'EOF'
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function InquiryPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:"", contact:"", product: sp.get("product") || "", type:"상품", message:"", source: sp.get("source") || "direct"
  });

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/inquiry", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) router.push("/inquiry/thanks"); else alert("문의 접수 실패");
  };

  return (
    <div className="py-10" style={{maxWidth:640}}>
      <h1 style={{fontSize:24, fontWeight:700}}>상담 문의</h1>
      <p style={{color:"#666", marginTop:6}}>사이즈/재고/맞춤 제작 등 무엇이든 남겨주세요. 영업일 기준 24시간 내 답변드립니다.</p>
      <form onSubmit={submit} style={{marginTop:16, display:"grid", gap:10}}>
        <input required className="input" placeholder="이름" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input required className="input" placeholder="연락처(휴대전화 또는 이메일)" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})}/>
        <input className="input" placeholder="관심 상품" value={form.product} onChange={e=>setForm({...form, product:e.target.value})}/>
        <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
          <option>상품</option><option>사이즈</option><option>배송</option><option>맞춤 제작</option>
        </select>
        <textarea required className="textarea" placeholder="문의 내용" value={form.message} onChange={e=>setForm({...form, message:e.target.value})}/>
        <label style={{fontSize:12, color:"#666"}}>개인정보 수집·이용에 동의합니다(3년 보관).</label>
        <button className="btn btn-primary" disabled={loading}>{loading ? "전송 중..." : "문의 보내기"}</button>
      </form>
    </div>
  );
}
EOF

cat > app/inquiry/thanks/page.tsx << 'EOF'
export default function Thanks() {
  return (
    <div className="py-16" style={{textAlign:"center"}}>
      <h1 style={{fontSize:24, fontWeight:700}}>문의가 접수되었습니다</h1>
      <p style={{marginTop:6, color:"#666"}}>영업일 기준 24시간 내 답변드릴게요.</p>
      <a className="btn btn-primary" href="/products" style={{marginTop:16}}>베스트 보러가기</a>
    </div>
  );
}
EOF

echo "13) API(문의/결제 자리) 작성(pages/api)"
cat > pages/api/inquiry.ts << 'EOF'
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
EOF

cat > pages/api/checkout.ts << 'EOF'
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: PG(Toss/Nicepay/아임포트 등) 결제 세션 생성 로직 연결
  // 1) 주문 PENDING 생성
  // 2) PG 세션/결제키 발급
  // 3) 클라이언트에 세션 정보 반환
  return res.status(200).json({ ok: true, message: "PG 연동 자리" });
}
EOF

cat > pages/api/webhook.ts << 'EOF'
import type { NextApiRequest, NextApiResponse } from "next";
// TODO: PG 웹훅(성공/실패) 수신 → 주문 상태 업데이트
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 시그니처 검증 후 Order.status 업데이트
  return res.status(200).json({ received: true });
}
EOF

echo "14) 로고/플레이스홀더(public)"
cat > public/logo.svg << 'EOF'
<svg width="240" height="32" viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path d="M40 20c10-20 40-20 50 0 8 16-4 30-25 48C44 50 32 36 40 20Z" stroke="white" stroke-width="8"/>
  <rect x="0" y="0" width="600" height="80" fill="black"/>
  <text x="80" y="55" fill="white" font-size="40" font-family="serif">LIEBLINGSRING</text>
</svg>
EOF

cat > public/placeholder.jpg << 'EOF'
(This is a placeholder. Replace with real product images.)
EOF

echo "15) 홈 레이아웃이 전역 스타일을 쓰도록(app/globals.css -> styles/globals.css 연결)"
# Next 14는 app/globals.css 경로를 사용합니다. 이미 app/layout.tsx에서 ./globals.css를 import했으므로, 프로젝트 루트에 globals.css 심볼릭/복사
cp styles/globals.css app/globals.css 2>/dev/null || true

echo "16) Prisma 초기화 및 시드"
cp .env.example .env
sed -i.bak 's/DB_PROVIDER=.*/DB_PROVIDER=sqlite/' .env || true
sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env || true

npx prisma generate
npx prisma migrate dev --name init --create-only
npx prisma migrate dev --name seed-ready
npx ts-node prisma/seed.ts

echo "17) 완료 안내"
echo "설치 완료! 실행 명령: npm run dev"
echo "브라우저에서 http://localhost:3000 확인하세요."