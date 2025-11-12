'use client';

import { useState } from 'react';
import axios from 'axios';

type Props = {
  onCreated?: (data: any) => void;
};

export default function QnaCreateClient({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/qna', {
        title: title.trim(),
        content: content.trim(),
      });

      if (res.data?.ok) {
        setTitle('');
        setContent('');
        setSuccessMsg('질문이 등록되었습니다.');
        if (onCreated) onCreated(res.data.data);
      } else {
        setError(res.data?.message || '서버 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || '서버 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qna-create" style={{ maxWidth: 720, margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={8}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {successMsg && <div style={{ color: 'green', marginBottom: 12 }}>{successMsg}</div>}
        <div>
          <button type="submit" disabled={loading}>
            {loading ? '등록 중...' : '작성하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
