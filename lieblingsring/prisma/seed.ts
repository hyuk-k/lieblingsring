// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(k: string) {
  return k
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function main() {
  const items = [
    {
      name: "SILVER 국화매듭 목걸이",
      price: 99000,
      salePrice: null,
      summary: "세트 옵션: 귀걸이 추가 +79,000원",
      images: [
        "/model-white-tee-key-necklace-smile-portrait.jpg",
        "/neckline-key-necklace-left-profile-extreme-closeup.jpg",
      ],
    },
    {
      name: "SILVER 생쪽매듭 목걸이",
      price: 79000,
      salePrice: null,
      summary: "세트 옵션: 귀걸이 추가 +59,000원",
      images: [
        "/model-black-blouse-key-necklace-looking-up.jpg",
        "/model-white-tee-necklace-topknot-gesture.jpg",
      ],
    },
    {
      name: "SILVER 공, 실타래 목걸이",
      price: 129000,
      salePrice: null,
      summary: "세트 옵션: 귀걸이 추가 +59,000원",
      images: [
        "/layered-necklaces-key-and-bead-close-chest.jpg",
        "/model-black-slip-wearing-earring-closeup.jpg",
      ],
    },
    {
      name: "SILVER 가지방석 열쇠 목걸이",
      price: 129000,
      salePrice: null,
      summary: null,
      images: [
        "/model-black-slip-key-necklace-front-smile-hands-together.jpg",
        "/model-black-slip-key-necklace-front-crossed-arms.jpg",
      ],
    },
    {
      name: "알루미늄 반려동물 인식표",
      price: 5900,
      salePrice: null,
      summary: null,
      images: ["/mirror-smile-earring-necklace-closeup.jpg"],
    },
    {
      name: "전통매듭 꽃다발 브로치",
      price: 23000,
      salePrice: null,
      summary: null,
      images: ["/model-black-blouse-holding-earring-vintage-wall.jpg"],
    },
    {
      name: "색동 휴대폰 스트랩",
      price: 7900,
      salePrice: null,
      summary: null,
      images: ["/earring-stud-closeup-right-ear.jpg"],
    },
    {
      name: "쏘맥 수세미 세트(소주+맥주)",
      price: 15000,
      salePrice: null,
      summary: null,
      images: ["/model-black-slip-sitting-bed-smile-wide.jpg"],
    },
    {
      name: "김장 수세미 세트 (배추+당근+무)",
      price: 15000,
      salePrice: null,
      summary: null,
      images: ["/model-black-dress-stand-smile-vintage-hangers.jpg"],
    },
  ];

  for (const it of items) {
    const slug = slugify(it.name);

    try {
      await prisma.product.upsert({
        where: { slug },
        update: {
          price: it.price,
          salePrice: it.salePrice ?? null,
          summary: it.summary ?? null,
          images: it.images,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
        create: {
          name: it.name,
          slug,
          price: it.price,
          salePrice: it.salePrice ?? null,
          summary: it.summary ?? null,
          images: it.images,
          status: "ACTIVE",
        },
      });

      console.log(`✔ Product upserted: ${it.name} (slug: ${slug})`);
    } catch (e: any) {
      // 에러가 나면 로깅하고 다음 항목으로 진행
      console.error(`✖ Failed to upsert product: ${it.name} (slug: ${slug})`);
      console.error(e);
    }
  }
}

main()
  .then(async () => {
    console.log("✅ Seed done");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Fatal seed error:");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });