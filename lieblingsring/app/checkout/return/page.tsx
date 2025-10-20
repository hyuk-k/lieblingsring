// app/checkout/return/page.tsx
export default function PayReturnPage() {
  // 필요하면 URL 파라미터를 읽어와 사용자 안내/주문번호 표시
  return (
    <section className="container" style={{padding:"28px 0"}}>
      <h1 style={{fontSize:24, fontWeight:800}}>결제가 완료되었습니다.</h1>
      <p style={{color:"#666"}}>마이페이지에서 주문내역을 확인하실 수 있습니다.</p>
      <a className="btn btn-primary" href="/mypage" style={{marginTop:12}}>마이페이지로</a>
    </section>
  );
}

