import { NextResponse } from "next/server";

let orders: any[] = [];

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newOrder = { id: Date.now().toString(), ...body, createdAt: new Date() };
  orders.push(newOrder);
  return NextResponse.json(newOrder);
}

