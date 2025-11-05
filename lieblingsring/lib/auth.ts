// lib/auth.ts
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

export const COOKIE_NAME = process.env.COOKIE_NAME ?? "session";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";

export type JwtPayloadCustom = {
  sub: string; // user id
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
};


function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string" || secret.length === 0) {
    // 명확한 에러 메시지로 로그에 남기기 좋게 함
    throw new Error("Missing JWT secret. Set NEXTAUTH_SECRET or JWT_SECRET in environment variables.");
  }
  return secret;
}


export function signToken(payload: JwtPayloadCustom): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}


export function verifyToken(token: string): JwtPayloadCustom | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as JwtPayloadCustom;
    return decoded;
  } catch (err) {
    // 필요하면 여기서 로그 남기기 (민감 데이터 주의)
    // console.error("verifyToken error:", err);
    return null;
  }
}


export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  // maxAge 또는 expires는 쿠키를 설정할 때 상황에 맞게 지정하세요.
};


export function getTokenFromRequest(req: NextRequest | Request): string | null {
  // NextRequest의 경우 req.cookies.get 메서드 사용
  // 일반 Request의 경우 headers.get("cookie") 파싱
  try {
    // NextRequest 타입 판별 (NextRequest는 cookies.get 메서드가 있음)
    // @ts-ignore: 런타임 검사
    if (req && typeof (req as any).cookies === "object" && typeof (req as any).cookies.get === "function") {
      // NextRequest
      // @ts-ignore
      const cookie = (req as any).cookies.get(COOKIE_NAME);
      return cookie?.value ?? null;
    } else if (req instanceof Request) {
      // standard Request: headers에서 cookie 파싱
      const cookieHeader = req.headers.get("cookie");
      if (!cookieHeader) return null;
      const matched = cookieHeader
        .split(";")
        .map(s => s.trim())
        .find(s => s.startsWith(`${COOKIE_NAME}=`));
      if (!matched) return null;
      return decodeURIComponent(matched.split("=").slice(1).join("=")) || null;
    } else {
      return null;
    }
  } catch (err) {
    // 안전하게 null 반환
    return null;
  }
}