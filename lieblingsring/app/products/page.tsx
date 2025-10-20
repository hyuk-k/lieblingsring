// app/products/page.tsx
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function Products({ searchParams }: { searchParams?: { kw?: string; cate?: string } }) {
  const kw = (searchParams?.kw ?? "").trim();
  const cate = (searchParams?.cate ?? "").trim();

  const where: any = { status: "ACTIVE" };
  if (kw) {
    where.OR = [
      { name: { contains: kw, mode: "insensitive" } },
      { summary: { contains: kw, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="py-10 max-w-6xl mx-auto px-4">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>products</h1>

	<div className="product-grid">
	  {products.map(p => (
	    <a key={p.id} href={`/products/${p.slug}`} style={{border:"1px solid #e5e7eb",borderRadius:8,padding:12,display:"block"}}>
	      <img src={(p.images?.[0]) || "/logo.svg"} alt={`${p.name} 이미지`} className="card-img" />
	      <h3 style={{marginTop:10,fontSize:18,fontWeight:600}}>{p.name}</h3>
	      <div style={{marginTop:6,fontWeight:700}}>{((p as any).salePrice ?? p.price).toLocaleString()}원</div>
	    </a>
	  ))}
	</div>

      {products.length === 0 && (
        <p style={{ color: "#666", marginTop: 16 }}>
          검색 결과가 없습니다. 다른 키워드로 검색하거나, 카테고리를 변경해 보세요.
        </p>
      )}
    </section>
  );
}
