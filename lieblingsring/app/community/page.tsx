'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QnaCreateClient from './qna/QnaCreateClient';

type Tab = 'notice' | 'qna';

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('notice');
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  // 간단한 로그인 상태 확인: /api/auth/me 를 호출해 확인
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          setIsLogged(false);
          return;
        }
        const data = await res.json();
        setIsLogged(Boolean(data?.ok && data?.user));
      } catch (err) {
        setIsLogged(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreateClick = () => {
    if (isLogged === null) {
      // 아직 확인 중이면 잠시 대기하거나 로그인 페이지로 이동
      return;
    }
    if (!isLogged) {
      // 로그인 유도
      router.push('/login');
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreated = (createdItem: any) => {
    // 작성 완료 콜백: 모달 닫기, 목록 갱신 로직 추가 가능
    setShowCreateModal(false);
    // TODO: 목록을 새로 불러오도록 구현(예: SWR mutate 등)
    console.log('Q&A created', createdItem);
  };

  return (
    <section className="container" style={{ padding: '28px 0', maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>community</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="tabs" style={{ display: 'flex', gap: 8 }}>
          <button
            className={`tab ${tab === 'notice' ? 'is-active' : ''}`}
            onClick={() => setTab('notice')}
            aria-pressed={tab === 'notice'}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: tab === 'notice' ? '1px solid #000' : '1px solid #eee',
              background: tab === 'notice' ? '#000' : '#fff',
              color: tab === 'notice' ? '#fff' : '#000'
            }}
          >
            공지사항
          </button>
          <button
            className={`tab ${tab === 'qna' ? 'is-active' : ''}`}
            onClick={() => setTab('qna')}
            aria-pressed={tab === 'qna'}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: tab === 'qna' ? '1px solid #000' : '1px solid #eee',
              background: tab === 'qna' ? '#000' : '#fff',
              color: tab === 'qna' ? '#fff' : '#000'
            }}
          >
            Q&A
          </button>
        </div>

        <div>
          <Link href="/community/announcements">
            <button style={{ marginRight: 8 }}>공지사항 페이지</button>
          </Link>
          <button onClick={handleCreateClick} style={{ background: '#000', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            질문 작성하기
          </button>
        </div>
      </div>

      {tab === 'notice' ? (
        <ul style={{ display: 'grid', gap: 10 }}>
          {/* 공지 리스트 (예시) - 실제로는 서버에서 데이터를 받아 렌더링하세요 */}
          <li style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
            <b>[공지] 배송 안내</b>
            <div className="muted" style={{ marginTop: 6 }}>배송비 / 출고일 변경 안내</div>
          </li>

          <li style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
            <b>[공지] 이벤트 안내</b>
            <div className="muted" style={{ marginTop: 6 }}>연말 할인 이벤트 안내</div>
          </li>
        </ul>
      ) : (
        <ul style={{ display: 'grid', gap: 10 }}>
          {/* Q&A 리스트 (예시) - 실제로는 서버에서 데이터를 받아 렌더링하세요 */}
          <li style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
            <b>반지 사이즈 문의</b>
            <div className="muted" style={{ marginTop: 6 }}>정사이즈 추천 / 교환 안내</div>
          </li>

          <li style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
            <b>배송지 변경 가능한가요?</b>
            <div className="muted" style={{ marginTop: 6 }}>결제 이전에는 변경 가능합니다.</div>
          </li>
        </ul>
      )}

      {/* 작성 모달 (간단 구현) */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', zIndex: 9999, padding: 16
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 8, padding: 16, width: '100%', maxWidth: 720 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Q&A 작성</h2>
              <button onClick={() => setShowCreateModal(false)}>닫기</button>
            </div>

            {/* QnaCreateClient 컴포넌트 사용 (작성 완료 시 onCreated 콜백으로 처리) */}
            <QnaCreateClient onCreated={handleCreated} />
          </div>
        </div>
      )}
    </section>
  );
}