// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type PayMethod = "NAVERPAY" | "TOSS";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    email: "", name: "", phone: "",
    zipcode: "", addr1: "", addr2: ""
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 1) 서버에서 장바구니 합계로 주문 생성 → orderId/amount 되돌려 받기
  const startPay = async () => {
    setLoading(true);
    try {
      const cart = await (await fetch("/api/cart")).json();           // { items: [...], total: number }
      const orderRes = await fetch("/api/orders/create", {            // 서버에서 order 생성
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cart, customer: form })
      });
      const order = await orderRes.json(); // { orderId, amount, goodname }
      if (!orderRes.ok) throw new Error(order.message || "주문 생성 실패");

      // 2) PayApp JS 파라미터 설정
      const userid = process.env.NEXT_PUBLIC_PAYAPP_USERID!;
      const shopname = process.env.NEXT_PUBLIC_SHOP_NAME || "LIEBLINGSRING";
      const openpaytype = process.env.NEXT_PUBLIC_PAYAPP_OPENPAYTYPE || ""; // "naverpay,tosspay" 등
      const returnurl = process.env.NEXT_PUBLIC_PAYAPP_RETURN_URL || "/checkout/return";

      // @ts-ignore - PayApp 전역 객체 (공식 JS)
      if (typeof window !== "undefined" && window.PayApp) {
        // 필수/권장 파라미터
        // 공식 문서: setParam으로 파라미터 설정 후 payrequest 호출 :contentReference[oaicite:6]{index=6}
        // userid(필수), shopname, goodname, price, recvphone, feedbackurl, returnurl, openpaytype 등
        // var1/var2 에 주문ID 등 커스텀 값 전달 가능
        // @ts-ignore
        window.PayApp.setParam("userid", userid);
        // @ts-ignore
        window.PayApp.setParam("shopname", shopname);
        // @ts-ignore
        window.PayApp.setParam("goodname", order.goodname || "LIEBLINGSRING 상품");
        // @ts-ignore
        window.PayApp.setParam("price", String(order.amount));
        // @ts-ignore
        window.PayApp.setParam("recvphone", form.phone || ""); // 선택
        // @ts-ignore
        window.PayApp.setParam("returnurl", returnurl);
        // @ts-ignore
        window.PayApp.setParam("feedbackurl", process.env.NEXT_PUBLIC_BASE_URL + "/api/payapp/feedback");
        // @ts-ignore
        window.PayApp.setParam("openpaytype", openpaytype); // 예: "naverpay,tosspay" :contentReference[oaicite:7]{index=7}
        // @ts-ignore
        window.PayApp.setParam("var1", order.orderId); // 서버 검증용으로 orderId 심기

        // 3) 결제창 호출 (공식 메서드)
        // @ts-ignore
        window.PayApp.payrequest();  // :contentReference[oaicite:8]{index=8}
      } else {
        alert("결제 스크립트 로드가 안됐어요. 새로고침 후 다시 시도해주세요.");
      }
    } catch (e: any) {
      alert(e.message || "결제 시작에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container" style={{ padding: "28px 0", maxWidth: 820 }}>
      {/* 공식 PayApp JS 로드 */}
      <Script src="https://lite.payapp.kr/public/api/v2/payapp-lite.js" strategy="afterInteractive" />
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>결제</h1>

      <div style={{ display: "grid", gap: 12 }}>
        <input className="input" name="email"   placeholder="이메일"   value={form.email}   onChange={onChange} />
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <input className="input" name="name"  placeholder="수령인"   value={form.name}    onChange={onChange} />
          <input className="input" name="phone" placeholder="연락처"   value={form.phone}   onChange={onChange} />
        </div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "180px 1fr" }}>
          <input className="input" name="zipcode" placeholder="우편번호" value={form.zipcode} onChange={onChange} />
          <input className="input" name="addr1"   placeholder="주소"     value={form.addr1}   onChange={onChange} />
        </div>
        <input className="input" name="addr2" placeholder="상세 주소" value={form.addr2} onChange={onChange} />
      </div>

      <div style={{ marginTop: 16, display:"flex", justifyContent:"flex-end" }}>
        <button className="btn btn-primary" onClick={startPay} disabled={loading}>
          {loading ? "요청 중..." : "네이버페이/토스로 결제하기"}
        </button>
      </div>
    </section>
  );
}
