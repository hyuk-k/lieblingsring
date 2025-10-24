// app/pay/toss/success/page.tsx

export default function TossSuccessPage() {

  // 토스 결제는 더이상 지원하지 않음을 안내하고 페이앱 이용 안내

  return (
    <main style={{ padding: 40 }}>
      <h1>결제 수단 변경 안내</h1>
      <p>현재 토스 결제는 지원하지 않습니다. 페이앱으로 결제해 주세요.</p>
      <p>
        결제 관련 문의는 <a href="/inquiry">문의 페이지</a>를 이용해 주세요.
      </p>
    </main>
  );
}