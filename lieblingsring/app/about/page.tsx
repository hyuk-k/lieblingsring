export default function AboutPage() {
  return (
    <section className="bias-left" style={{ padding: "24px 0" }}>
      <div /> {/* 왼쪽 여백 */}
      <article>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 16px" }}>About us</h1>
        <p style={{ whiteSpace: "pre-line" }}>
          리블링스링(Lieblingsring)은 독일어 단어로 '가장 좋아 하는 반지'라는 의미입니다.

	 리블링스링의 액세서리를 착용하시는 고객님들께 가장 좋아하는 애장품, 액세서리로 남길 바라는 마음을 담은 브랜드입니다.
	
	 또한 저희 브랜드는 전통의 재해석, 전통의 현대화를 통한 모던한 장신구를 제작하고 있습니다.
	
	 전통과 현대를 잇는 마음으로 손 끝으로 정성껏 엮은 전통매듭 장신구를 통해 전통의 미(美) 아름다움을 경험해 보세요
        </p>

        <div style={{ marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
          <b>고객센터</b>
          <div className="muted" style={{ marginTop: 6 }}>
            010-2608-0967 · lieblingsring@naver.com (평일 10:00~16:00, 주말/공휴일 휴무)
          </div>
        </div>
      </article>
      <div /> {/* 오른쪽 여백 */}
    </section>
  );
}
