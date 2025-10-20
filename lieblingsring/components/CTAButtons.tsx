"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gtag } from "@/lib/ga";
import type { Product } from "@prisma/client";

export default function CTAButtons({
  product,
  inquiryPrimary,
  disabledBuy,
}: {
  product: Product;
  inquiryPrimary: boolean;
  disabledBuy?: boolean;
}) {
  const router = useRouter();
  const inquiryHref = `/inquiry?product=${encodeURIComponent(product.name)}&source=pdp`;

  const onAddToCart = () => {
    gtag.event("add_to_cart", {
      value: product.salePrice ?? product.price,
      currency: "KRW",
      items: [{ item_id: product.id, item_name: product.name }],
    });
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find((c: any) => c.id === product.id);
    if (found) found.qty += 1;
    else cart.push({ id: product.id, name: product.name, price: product.salePrice ?? product.price, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const buy = () => {
    if (disabledBuy) return;
    onAddToCart();
    gtag.event("begin_checkout", { items: [{ item_id: product.id, item_name: product.name }] });
    router.push("/checkout");
  };

  const BuyBtn = (
    <button className={`btn ${inquiryPrimary ? "btn-outline" : "btn-primary"}`} onClick={buy} disabled={disabledBuy} aria-disabled={disabledBuy}>
      {disabledBuy ? "품절" : "바로구매"}
    </button>
  );

  const InquiryBtn = (
    <Link href={inquiryHref} className={`btn ${inquiryPrimary ? "btn-primary" : "btn-outline"}`} onClick={() => gtag.event("select_content", { content_type: "inquiry", item_id: product.id, source: "pdp" })}>
      상담 문의
    </Link>
  );

  return <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>{inquiryPrimary ? (<>{InquiryBtn}{BuyBtn}</>) : (<>{BuyBtn}{InquiryBtn}</>)}</div>;
}
