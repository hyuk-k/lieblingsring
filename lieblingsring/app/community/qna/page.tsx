import QnaCreateClient from './QnaCreateClient';
import { prisma } from '@/lib/db';

export const revalidate = 0; // 필요시 조절

export default async function QnaPage() {
  // 서버에서 최신 Q&A 목록을 가져올 수 있음 (필요하면 사용)
  let qnas = [];
  try {
    qnas = await prisma.qna.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (e) {
    // DB 에러여도 페이지 렌더링은 유지
    console.error('QnaPage prisma error', e);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Q&A</h1>
      <section style={{ marginBottom: 24 }}>
        <h2>질문 등록</h2>
        <QnaCreateClient onCreated={() => { /* 필요시 목록 갱신 로직 추가 */ }} />
      </section>

      <section>
        <h2>최근 질문</h2>
        <ul>
          {qnas.length === 0 ? (
            <li>질문이 없습니다.</li>
          ) : (
            qnas.map((q: any) => (
              <li key={q.id} style={{ marginBottom: 12 }}>
                <strong>{q.title}</strong>
                <div style={{ color: '#666', fontSize: 13 }}>{new Date(q.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 6 }}>{q.content}</div>
                {q.answered && <div style={{ marginTop: 6, color: 'green' }}>답변: {q.answer}</div>}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
