// app/api/cart/[id]/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const jar = cookies();
  const raw = jar.get("cart")?.value ?? "[]";

  let list: Array<{ id: string; [k: string]: unknown }>;
  try {
    list = JSON.parse(raw);
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }

  const next = list.filter((it) => it?.id !== id);
  const removed = list.length - next.length;

  jar.set("cart", JSON.stringify(next), {
    path: "/",
    httpOnly: false, // 클라이언트에서 읽을 수 있게 유지(필요에 따라 true로)
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true, removed });
}
