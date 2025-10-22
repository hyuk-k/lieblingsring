import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CART_COOKIE = "cart_v1";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readCart(): CartItem[] {
  try {
    const raw = cookies().get(CART_COOKIE)?.value ?? "[]";
    const parsed = safeParse(raw);
    if (!Array.isArray(parsed)) return [];
    // 최소 필드 검증
    const items: CartItem[] = parsed
      .filter((it): it is CartItem => {
        if (typeof it !== "object" || it === null) return false;
        const o = it as any;
        return typeof o.id === "string" && typeof o.name === "string" && typeof o.price === "number" && typeof o.qty === "number";
      })
      .map((it) => ({
        id: (it as any).id,
        name: (it as any).name,
        price: (it as any).price,
        qty: (it as any).qty,
        image: (it as any).image ?? null,
      }));
    return items;
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  try {
    cookies().set({
      name: CART_COOKIE,
      value: JSON.stringify(items),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30일
    });
  } catch (err) {
    console.error("writeCart error:", err);
  }
}

function total(items: CartItem[]) {
  return items.reduce((s, it) => s + it.price * it.qty, 0);
}

/** GET: 장바구니 조회 */
export async function GET() {
  const items = readCart();
  return NextResponse.json({ items, total: total(items) }, { status: 200 });
}

/**
 * POST: 담기
 * expected body: { id: string, name: string, price: number, qty?: number, image?: string | null }
 */
export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json().catch(() => ({}));
    if (typeof raw !== "object" || raw === null) {
      return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
    }
    const body = raw as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name : "";
    const price = typeof body.price === "number" ? body.price : NaN;
    const qty = Number.isFinite(Number(body.qty ?? 1)) ? Math.max(1, Number(body.qty ?? 1)) : 1;
    const image = typeof body.image === "string" ? body.image : null;

    if (!id || !name || Number.isNaN(price)) {
      return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
    }

    const items = readCart();
    const i = items.findIndex((x) => x.id === id);
    if (i >= 0) {
      items[i].qty = Math.max(1, items[i].qty + qty);
    } else {
      items.push({ id, name, price, qty, image });
    }

    writeCart(items);
    return NextResponse.json({ ok: true, items, total: total(items) }, { status: 201 });
  } catch (err) {
    console.error("cart POST error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/**
 * PATCH: 수량 변경
 * expected body: { id: string, qty: number }
 */
export async function PATCH(req: NextRequest) {
  try {
    const raw: unknown = await req.json().catch(() => ({}));
    if (typeof raw !== "object" || raw === null) {
      return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
    }
    const body = raw as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    const qty = typeof body.qty === "number" ? Math.max(1, Math.floor(body.qty)) : NaN;
    if (!id || Number.isNaN(qty)) {
      return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
    }

    const items = readCart().map((x) => (x.id === id ? { ...x, qty } : x));
    writeCart(items);
    return NextResponse.json({ ok: true, items, total: total(items) }, { status: 200 });
  } catch (err) {
    console.error("cart PATCH error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}

/**
 * DELETE: 항목 제거 또는 전체 비우기
 * optional body: { id?: string } -> 있으면 해당 항목만 제거, 없으면 전체 비움
 */
export async function DELETE(req: NextRequest) {
  try {
    let id: string | undefined;
    try {
      const body = await req.json().catch(() => ({}));
      if (typeof body === "object" && body !== null) id = (body as any).id;
    } catch {
      // body가 없을 수 있음
    }

    if (id) {
      const items = readCart().filter((x) => x.id !== id);
      writeCart(items);
      return NextResponse.json({ ok: true, items, total: total(items) }, { status: 200 });
    } else {
      writeCart([]);
      return NextResponse.json({ ok: true, items: [], total: 0 }, { status: 200 });
    }
  } catch (err) {
    console.error("cart DELETE error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}