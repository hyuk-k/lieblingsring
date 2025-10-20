// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CART_COOKIE = "cart_v1";

type CartItem = {
  id: string;          // 제품 id (slug 또는 prisma id)
  name: string;        // 제품명
  price: number;       // 단가
  qty: number;         // 수량
  image?: string | null; // 썸네일(선택)
};

function readCart(): CartItem[] {
  try {
    const raw = cookies().get(CART_COOKIE)?.value ?? "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  cookies().set(CART_COOKIE, JSON.stringify(items), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // 개발 단계에서는 maxAge 짧게 두셔도 OK
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
}

function total(items: CartItem[]) {
  return items.reduce((s, it) => s + it.price * it.qty, 0);
}

// GET: 장바구니 조회
export async function GET() {
  const items = readCart();
  return NextResponse.json({ items, total: total(items) });
}

/**
 * POST: 담기
 * body: { id, name, price, qty?, image? }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, name, price, qty = 1, image = null } = body || {};
  if (!id || !name || typeof price !== "number") {
    return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
  }

  const items = readCart();
  const i = items.findIndex((x) => x.id === id);
  if (i >= 0) items[i].qty += qty;
  else items.push({ id, name, price, qty, image });

  writeCart(items);
  return NextResponse.json({ ok: true, items, total: total(items) });
}

/**
 * PATCH: 수량 변경
 * body: { id, qty }
 */
export async function PATCH(req: Request) {
  const { id, qty } = await req.json().catch(() => ({}));
  if (!id || typeof qty !== "number") {
    return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
  }
  const items = readCart().map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x));
  writeCart(items);
  return NextResponse.json({ ok: true, items, total: total(items) });
}

/**
 * DELETE: 항목 제거 또는 전체 비우기
 * body(optional): { id } -> 있으면 해당 항목만 제거, 없으면 전체 비움
 */
export async function DELETE(req: Request) {
  let id: string | undefined;
  try {
    const body = await req.json();
    id = body?.id;
  } catch { /* body 없을 수 있음 */ }

  if (id) {
    const items = readCart().filter((x) => x.id !== id);
    writeCart(items);
    return NextResponse.json({ ok: true, items, total: total(items) });
  } else {
    writeCart([]);
    return NextResponse.json({ ok: true, items: [], total: 0 });
  }
}
