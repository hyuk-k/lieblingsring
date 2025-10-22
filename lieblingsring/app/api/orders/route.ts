// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  email?: string;
  name?: string;
  phone?: string;
  totalAmount: number;
  createdAt: string; // ISO string for JSON serialization
};

const orders: Order[] = [];

/**
 * GET /api/orders
 * - 간단한 페이징 지원: ?page=1&limit=20
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 20)));

    const start = (page - 1) * limit;
    const paged = orders.slice(start, start + limit);

    return NextResponse.json(
      { data: paged, meta: { total: orders.length, page, limit } },
      { status: 200 }
    );
  } catch (err) {
    console.error("orders GET error:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * body 예시:
 * {
 *   "items": [{ "productId":"p1", "name":"상품A", "price":1000, "qty":2 }],
 *   "email": "user@example.com",
 *   "name": "홍길동"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
    }

    const b = body as Partial<Order>;

    // items 기본 검증
    if (!Array.isArray((b as any).items) || (b as any).items.length === 0) {
      return NextResponse.json({ message: "주문 항목(items)이 필요합니다." }, { status: 400 });
    }

    const items = (b as any).items as unknown[];
    const parsedItems: OrderItem[] = [];

    for (const it of items) {
      if (
        typeof it === "object" &&
        it !== null &&
        typeof (it as any).productId === "string" &&
        typeof (it as any).name === "string" &&
        typeof (it as any).price === "number" &&
        typeof (it as any).qty === "number"
      ) {
        parsedItems.push({
          productId: (it as any).productId,
          name: (it as any).name,
          price: (it as any).price,
          qty: (it as any).qty,
        });
      } else {
        return NextResponse.json({ message: "주문 항목 형식이 올바르지 않습니다." }, { status: 400 });
      }
    }

    const totalAmount = parsedItems.reduce((s, it) => s + it.price * it.qty, 0);

    const newOrder: Order = {
      id: Date.now().toString(),
      items: parsedItems,
      email: typeof b.email === "string" ? b.email : undefined,
      name: typeof b.name === "string" ? b.name : undefined,
      phone: typeof b.phone === "string" ? b.phone : undefined,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err) {
    console.error("orders POST error:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}