import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("/admin/login");
  res.cookies.delete("admin");
  return res;
}

