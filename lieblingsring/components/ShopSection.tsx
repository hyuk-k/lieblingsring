"use client";
import Link from "next/link";

export default function ShopSection() {
  const products = [
    { id: 1, name: "Silver Ring", img: "/mirror-smile-earring-necklace-closeup.jpg", price: 32000 },
    { id: 2, name: "Key Necklace", img: "/model-black-blouse-key-necklace-right-profile-closeup.jpg", price: 45000 },
    { id: 3, name: "Earring Set", img: "/earring-stud-closeup-right-ear.jpg", price: 28000 },
  ];

  return (
    <>
      <h2 style={{ fontSize: 32, marginBottom: 24 }}>Our Collection</h2>
      <div className="shop-grid">
        {products.map(p => (
          <Link key={p.id} href={`/products/${p.id}`} className="card">
            <img src={p.img} alt={p.name} />
            <h3>{p.name}</h3>
            <p style={{ fontWeight: 700 }}>{p.price.toLocaleString()}원</p>
          </Link>
        ))}
      </div>
    </>
  );
}

