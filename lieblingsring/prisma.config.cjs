/**
 * 안전한 CommonJS 구성 - Prisma가 읽을 수 있는 최소형
 * (UTF-8 without BOM, LF)
 */
module.exports = {
  schema: "./prisma/schema.prisma",
  // seed는 프로덕션에서 자동 실행하지 않으려면 주석 처리하세요.
  seed: "ts-node --transpile-only prisma/seed.ts",
};
