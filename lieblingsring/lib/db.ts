// lieblingsring/lieblingsring/lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Next.js 핫 리로드 시 글로벌 prisma 중복 생성 방지
  // var __prisma?: PrismaClient; <-- 이 구문은 TS에서 허용되지 않음
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;