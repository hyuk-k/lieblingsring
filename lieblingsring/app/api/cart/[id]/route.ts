// app/api/cart/[id]/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const CART_COOKIE = "cart_v1"; // 프로젝트 전체에서 동일한 이름 사용 권장

type CartEntry = {
  id: string;
  [k: string]: unknown;
};

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } } // Next.js app routes에서 흔히 쓰이는 형태로 명시
) {
  const { id } = context.params ?? {};

  if (!id || typeof id !== "string") {
    return NextResponse.json({ ok: false, message: "유효한 id가 필요합니다." }, { status: 400 });
  }

  const jar = cookies();
  const raw = jar.get(CART_COOKIE)?.value ?? "[]";

  let list: CartEntry[];
  try {
    const parsed = JSON.parse(raw);
    list = Array.isArray(parsed) ? parsed : [];
  } catch {
    list = [];
  }

  const next = list.filter((it) => it && (it as any).id !== id);
  const removed = list.length - next.length;

  // 쿠키 저장: Next의 cookies().set({ name, value, ... }) 형식 사용
  try {
    jar.set({
      name: CART_COOKIE,
      value: JSON.stringify(next),
      path: "/",
      httpOnly: false, // 클라이언트에서 읽어야 하면 false, 보안상 서버 전용이면 true로 변경
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 필요시 설정
    });
  } catch (err) {
    console.error("cart cookie set error:", err);
    return NextResponse.json({ ok: false, message: "쿠키 저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, removed }, { status: 200 });
}