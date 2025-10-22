// prisma.config.js
/** @type {import('@prisma/internals').Config} */
module.exports = {
  // Prisma가 seed 명령을 실행할 때 사용할 커맨드
  seed: 'ts-node --transpile-only prisma/seed.ts',

  // (선택) 스키마 경로를 바꿨다면 지정
  // schema: './prisma/schema.prisma',
};

