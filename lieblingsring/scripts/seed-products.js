// scripts/seed-products.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      title: '은빛 민자 반지',
      description: '심플한 은빛 민자 반지 - 모든 손가락에 잘 어울림',
      price: 25000,
      category: '장신구',
      imageUrl: '/images/products/ring1.jpg',
    },
    {
      title: '핸드메이드 캔들 홀더',
      description: '따뜻한 분위기의 핸드메이드 캔들 홀더',
      price: 18000,
      category: '소품',
      imageUrl: '/images/products/candle-holder.jpg',
    },
    {
      title: '다용도 트레이',
      description: '작은 소품을 정리할 수 있는 다용도 트레이',
      price: 12000,
      category: '기타',
      imageUrl: '/images/products/tray.jpg',
    },
  ];

  for (const p of items) {
    await prisma.product.upsert({
      where: { title: p.title },
      update: {},
      create: p,
    });
  }

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
