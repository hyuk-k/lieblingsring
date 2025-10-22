import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function assertAdmin() {
  const store = await cookies(); // Next 15: Promise
  const ok = store.get(process.env.ADMIN_COOKIE_NAME ?? "admin_session")?.value === "1";
  if (!ok) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }
  return null;
}

