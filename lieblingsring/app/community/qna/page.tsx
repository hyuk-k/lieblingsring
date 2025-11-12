// app/community/qna/page.tsx
import QnaCreateClient from './QnaCreateClient';
import { prisma } from '@/lib/db';
import type { Qna } from '@prisma/client';

export const revalidate = 0; // 필요에 따라 조절

export default async function QnaPage() {
  let qnas: Qna[] = [];
  try {
    qnas = await prisma.qna.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (e) {
    console.error('QnaPage prisma error', e);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Q&A</h1>
      <section style={{ marginBottom: 24 }}>
        <h2>질문 등록</h2>
        <QnaCreateClient onCreated={() => { /* 목록 갱신 로직 추가 가능 */ }} />
      </section>

      <section>
        <h2>최근 질문</h2>
        <ul>
          {qnas.length === 0 ? (
            <li>질문이 없습니다.</li>
          ) : (
            qnas.map((q) => (
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