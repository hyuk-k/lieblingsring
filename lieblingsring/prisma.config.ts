// prisma.config.ts
import type { Config } from '@prisma/internals';

const config: Config = {
  // seed 스크립트 위치를 Prisma에 알려줍니다.
  // `npm run seed` -> `prisma db seed`가 이 파일을 참조
  seed: 'ts-node --transpile-only prisma/seed.ts',
};

export default config;

