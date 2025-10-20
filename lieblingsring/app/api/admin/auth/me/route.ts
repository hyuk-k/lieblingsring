import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const name = process.env.ADMIN_COOKIE_NAME || "admin_session";
  const isAdmin = cookies().get(name)?.value === "1";
  return NextResponse.json({ isAdmin });
}

