export default function Thanks() {
  return (
    <div className="py-16" style={{textAlign:"center"}}>
      <h1 style={{fontSize:24, fontWeight:700}}>문의가 접수되었습니다</h1>
      <p style={{marginTop:6, color:"#666"}}>영업일 기준 24시간 내 답변드릴게요.</p>
      <a className="btn btn-primary" href="/products" style={{marginTop:16}}>베스트 보러가기</a>
    </div>
  );
}
