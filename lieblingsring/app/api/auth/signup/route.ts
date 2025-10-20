import { NextResponse } from "next/server";
import { usersStore } from "../../_store/users";

export async function POST(req: Request) {
  const { email, password, name, phone } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "이메일/비밀번호는 필수입니다." }, { status: 400 });
  }
  const exists = usersStore.users.some(u => u.email === email);
  if (exists) {
    return NextResponse.json({ message: "이미 존재하는 이메일입니다." }, { status: 409 });
  }

  usersStore.users.push({
    id: String(Date.now()),
    email, password, name, phone
  });

  return NextResponse.json({ ok: true });
}

