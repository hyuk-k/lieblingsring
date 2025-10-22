// lib/auth.ts
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";
export const COOKIE_NAME = process.env.COOKIE_NAME ?? "session";

export type JwtPayloadCustom = {
  sub: string;      // user id
  email?: string;
  name?: string;
};

export function signToken(payload: JwtPayloadCustom) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayloadCustom | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function cookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    // expires will be set when writing cookie (Date object) OR maxAge can be set
  };
}

export function getTokenFromRequest(req: NextRequest) {
  // NextRequest.cookies is available on server components/routes (Next 13+/app)
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return cookie ?? null;
}