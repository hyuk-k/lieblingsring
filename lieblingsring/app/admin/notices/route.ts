// app/admin/notices/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME ?? "admin_session";

async function requireAdmin() {
  // ✅ Next 15: cookies()는 Promise
  const store = await cookies();
  const isAdmin = store.get(COOKIE_NAME)?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }
  return null as null;
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const items = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const item = await prisma.notice.create({
    data: {
      title: body.title ?? "",
      content: body.content ?? "",
    },
  });
  return NextResponse.json(item);
}
