export default function MyPage() {
  return (
    <section className="container" style={{padding:"28px 0 60px"}}>
      <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 14px"}}>마이페이지</h1>
      <ul style={{lineHeight:2}}>
        <li><a href="/order">주문내역</a></li>
        <li><a href="/cart">장바구니</a></li>
        <li><a href="/profile">회원정보 수정</a> (데모)</li>
      </ul>
      <p className="muted" style={{marginTop:8}}>※ 로그인/주문 연동은 추후 Prisma + Auth 붙이는 단계에서 연결</p>
    </section>
  );
}

