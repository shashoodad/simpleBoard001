import { useState } from 'react';

type ViewMode = 'card' | 'list';

const mockPosts = [
  { id: '1', title: '프로젝트 시작 안내', excerpt: 'SimpleBoard001 기획 개요 요약입니다.' },
  { id: '2', title: '프리미엄 게시판 소개', excerpt: '프리미엄 유저 혜택을 정리했습니다.' },
];

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  return (
    <main className="page">
      <header className="page-header">
        <h1>게시판</h1>
        <div className="view-toggle">
          <button
            type="button"
            className={viewMode === 'card' ? 'active' : ''}
            onClick={() => setViewMode('card')}
          >
            카드형
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            리스트형
          </button>
        </div>
      </header>

      {viewMode === 'card' ? (
        <section className="card-grid">
          {mockPosts.map((post) => (
            <article key={post.id} className="card">
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </section>
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>요약</th>
            </tr>
          </thead>
          <tbody>
            {mockPosts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.excerpt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
