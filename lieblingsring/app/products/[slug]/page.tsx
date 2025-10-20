import { prisma } from "@/lib/db";
import Link from "next/link";
import ProductBuyBox from "@/components/ProductBuyBox";

type Props = { params: { slug: string } };

export default async function ProductDetail({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>상품을 찾을 수 없습니다.</h1>
        <Link href="/products" className="btn btn-outline" style={{ marginTop: 20 }}>
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/logo.svg"];
  const priceView = (product.salePrice ?? product.price).toLocaleString("ko-KR");

  // 추천 키워드 추출
  const KINDS = ["목걸이", "브로치", "스트랩", "수세미", "인식표"];
  const kind = KINDS.find(k => product.name.includes(k)) || "";

  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "ACTIVE",
      ...(kind ? { name: { contains: kind } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <section className="py-10">
      <div className="container" style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        {/* 좌측 이미지 */}
        <div>
          <img src={images[0]} alt={`${product.name} 대표 이미지`} style={{ width: "100%", borderRadius: 10 }} />
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              {images.slice(1).map((img, i) => (
                <img key={i} src={img} alt={`${product.name} 추가 이미지 ${i + 1}`}
                  style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
              ))}
            </div>
          )}
        </div>

        {/* 우측 정보 */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{product.name}</h1>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{priceView}원</div>
          {product.summary && <p style={{ color: "#555", marginTop: 10 }}>{product.summary}</p>}

          <ProductBuyBox
            productId={product.id}
            name={product.name}
            basePrice={product.price}
            salePrice={product.salePrice}
            slug={product.slug}
          />

          {/* 배송/고객센터 고정 안내 */}
          <div style={{ marginTop: 30, padding: 16, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fafafa", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
            <p><strong>배송정책:</strong> 70,000원 이상 무료 / 미만 4,000원 (우체국 택배)</p>
            <p><strong>고객센터:</strong> 010-2608-0967 / lieblingsring@naver.com (평일 10:00~16:00)</p>
          </div>
        </div>
      </div>

      {/* 추천 상품 */}
      {related.length > 0 && (
        <div className="container" style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>추천 상품</h2>
          <div className="grid" style={{ gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {related.map((p) => (
              <a key={p.id} href={`/products/${p.slug}`} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: "block" }}>
                <img src={p.images?.[0] || "/placeholder.jpg"} alt={`${p.name} 이미지`} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
                <h3 style={{ marginTop: 10, fontSize: 18, fontWeight: 600 }}>{p.name}</h3>
                <div style={{ marginTop: 6, fontWeight: 700 }}>{(p.salePrice ?? p.price).toLocaleString()}원</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 브랜드 소개 */}
      <div style={{ marginTop: 60, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>About Lieblingsring</h2>
        <p style={{ color: "#666", marginTop: 8, lineHeight: 1.7 }}>
          리블링스링은 전통 매듭과 미니멀 디자인을 결합한 수공예 주얼리 브랜드입니다.
        </p>
      </div>
    </section>
  );
}
