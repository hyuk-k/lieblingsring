// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      name: "SILVER 국화매듭 목걸이",
      price: 99000,
      salePrice: null,
      slug: "silver-kukhwa-necklace",
      category: "장신구",
      summary: "전통 국화매듭 실버 목걸이",
      images: [
        "/model-black-blouse-key-necklace-right-profile-closeup.jpg",
        "/model-black-blouse-necklace-side-gaze.jpg",
        "/mirror-smile-earring-necklace-closeup.jpg",
      ],
    },
    {
      name: "SILVER 생쪽매듭 목걸이",
      price: 79000,
      salePrice: null,
      slug: "silver-saengjjok-necklace",
      category: "장신구",
      summary: "전통 생쪽매듭 실버 목걸이",
      images: [
        "/model-white-tee-key-necklace-smile-portrait.jpg",
        "/model-white-tee-necklace-tilt-smile-portrait.jpg",
        "/model-white-tee-necklace-topknot-gesture.jpg",
      ],
    },
    {
      name: "SILVER 공, 실타래 목걸이",
      price: 129000,
      salePrice: null,
      slug: "silver-gong-siltarae-necklace",
      category: "장신구",
      summary: "공 · 실타래 실버 목걸이",
      images: [
        "/layered-necklaces-key-and-bead-close-chest.jpg",
        "/neckline-key-necklace-left-profile-extreme-closeup.jpg",
        "/model-black-slip-wearing-earring-closeup.jpg",
      ],
    },
    {
      name: "SILVER 가지방석 열쇠 목걸이",
      price: 129000,
      salePrice: null,
      slug: "silver-gaji-yulsoe-necklace",
      category: "장신구",
      summary: "가지방석 매듭 열쇠 실버 목걸이",
      images: [
        "/model-black-blouse-key-necklace-looking-up.jpg",
        "/model-black-blouse-key-necklace-hand-near-mouth.jpg",
        "/model-black-dress-stand-smile-vintage-hangers.jpg",
      ],
    },
    {
      name: "알루미늄 반려동물 인식표",
      price: 5900,
      salePrice: null,
      slug: "aluminum-pet-tag",
      category: "소품",
      summary: "가벼운 알루미늄 인식표",
      images: ["/file.svg"], // 임시 이미지
    },
    {
      name: "전통매듭 꽃다발 브로치",
      price: 23000,
      salePrice: null,
      slug: "knot-bouquet-brooch",
      category: "장신구",
      summary: "전통매듭 꽃다발 브로치",
      images: ["/mirror-earring-wear-closeup-left-profile.jpg"],
    },
    {
      name: "색동 휴대폰 스트랩",
      price: 7900,
      salePrice: null,
      slug: "saekdong-phone-strap",
      category: "소품",
      summary: "색동 디테일 스트랩",
      images: ["/window.svg"], // 임시 이미지
    },
    {
      name: "쏘맥 수세미 세트(소주+맥주)",
      price: 15000,
      salePrice: null,
      slug: "somaek-susemi-set",
      category: "기타",
      summary: "쏘맥 콘셉트 수세미 세트",
      images: ["/globe.svg"], // 임시 이미지
    },
    {
      name: "김장 수세미 세트 (배추+당근+무)",
      price: 15000,
      salePrice: null,
      slug: "kimjang-susemi-set",
      category: "기타",
      summary: "김장 콘셉트 수세미 3종",
      images: ["/next.svg"], // 임시 이미지
    },
  ];

  for (const p of items) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, status: "ACTIVE" },
      create: { ...p, status: "ACTIVE" },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seed done.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

