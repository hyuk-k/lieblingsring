import { NextResponse } from "next/server";
import { usersStore } from "../../_store/users";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = usersStore.users.find(u => u.email === email && u.password === password);
  if (!user) return NextResponse.json({ message: "이메일 또는 비밀번호가 잘못되었습니다." }, { status: 401 });

  const res = NextResponse.json({ ok: true, email: user.email, name: user.name });
  res.cookies.set("session", user.email, { httpOnly: true, path: "/" });
  return res;
}

