import { NextResponse } from "next/server";
import { cartStore } from "../../_store/cart";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const before = cartStore.items.length;
  cartStore.items = cartStore.items.filter((x) => x.id !== params.id);
  const removed = before - cartStore.items.length;
  return NextResponse.json({ ok: true, removed });
}
