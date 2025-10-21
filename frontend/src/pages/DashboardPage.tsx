import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL, APP_ENV } from '../config';
import { authFetch, SessionExpiredError } from '../lib/authFetch';
import { AuthStorage } from '../lib/auth';

import type { BoardSummary, PostSummary, ViewMode } from '../types/board';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('selectedBoardId') ?? '';
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'card';
    return (localStorage.getItem('boardViewMode') as ViewMode) || 'card';
  });
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUserRole(localStorage.getItem('userRole'));
  }, []);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/boards`);
        if (!response.ok) {
          const problem = await response.json().catch(() => ({ detail: '게시판 목록을 불러오지 못했습니다.' }));
          throw new Error(problem.detail || '게시판 목록을 불러오지 못했습니다.');
        }
        const data: BoardSummary[] = await response.json();
        setBoards(data);
        if (data.length > 0) {
          const storedId = typeof window !== 'undefined' ? localStorage.getItem('selectedBoardId') : null;
          const fallbackId = String(data[0].id);
          const initialId = storedId && data.some((board) => String(board.id) === storedId) ? storedId : fallbackId;
          setSelectedBoardId(initialId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('selectedBoardId', initialId);
          }
        }
        setError(null);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          navigate('/login', { replace: true });
          return;
        }
        console.error(err);
        setError(err instanceof Error ? err.message : '게시판 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoadingBoards(false);
      }
    };

    fetchBoards();
  }, [navigate]);

  useEffect(() => {
    if (!selectedBoardId) {
      setPosts([]);
      return;
    }

    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      setError(null);
      try {
        const response = await authFetch(`${API_BASE_URL}/boards/${selectedBoardId}/posts/`);
        if (!response.ok) {
          const problem = await response.json().catch(() => ({ detail: '게시글을 불러오지 못했습니다.' }));
          throw new Error(problem.detail || '게시글을 불러오지 못했습니다.');
        }
        const data: PostSummary[] = await response.json();
        setPosts(data);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          navigate('/login', { replace: true });
          return;
        }
        console.error(err);
        setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [selectedBoardId, navigate]);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boardViewMode', mode);
    }
  };

  const handleBoardChange = (event: FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    setSelectedBoardId(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBoardId', value);
    }
  };

  const displayedPosts = useMemo(() => posts, [posts]);

  const summarise = (raw: string, limit = 140) => {
    const normalized = raw.replace(/!\[[^\]]*\]\([^\)]*\)/g, ' [이미지] ').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized;
  };

  const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString();


  const handleOpenPost = (postId: number) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>게시판</h1>
          <p className="muted">현재 실행 환경: {APP_ENV}</p>
        </div>
        <div className="page-actions">
          <select
            value={selectedBoardId}
            onChange={handleBoardChange}
            disabled={isLoadingBoards || boards.length === 0}
            className="board-select"
          >
            {isLoadingBoards ? <option value="">게시판을 불러오는 중...</option> : null}
            {!isLoadingBoards && boards.length === 0 ? <option value="">게시판이 없습니다</option> : null}
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
          <div className="view-controls">
            <label htmlFor="viewMode" className="sr-only">보기 방식</label>
            <select
              id="viewMode"
              className="board-select compact"
              value={viewMode}
              onChange={(event) => handleViewChange(event.currentTarget.value as ViewMode)}
            >
              <option value="card">카드형</option>
              <option value="list">리스트형</option>
            </select>
            <button type="button" className="primary" onClick={() => navigate('/posts/new')}>
              글쓰기
            </button>
            {isAdmin ? (
              <button type="button" className="primary outline" onClick={() => navigate('/admin/board-access')}>
                게시판 권한 관리
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}

      {isLoadingPosts ? (
        <p className="info">게시글을 불러오는 중...</p>
      ) : displayedPosts.length === 0 ? (
        <p className="muted">표시할 게시글이 없습니다.</p>
      ) : viewMode === 'card' ? (
        <section className="card-grid">
          {displayedPosts.map((post) => (
            <article key={post.id} className="card card-clickable" onClick={() => handleOpenPost(post.id)}>
              <h2>{post.title}</h2>
              <p className="card-summary">{summarise(post.content) || '내용이 아직 등록되지 않았습니다.'}</p>
              <div className="card-meta">
                <span className="card-author">{post.author_name ?? post.author_email ?? 'admin@shashoo.com'}</span>
                <span className="card-date">{formatDateTime(post.created_at)}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {displayedPosts.map((post) => (
              <tr key={post.id} className="clickable-row" onClick={() => handleOpenPost(post.id)}>
                <td>{post.title}</td>
                <td>{post.author_name ?? post.author_email ?? 'admin@shashoo.com'}</td>
                <td>{formatDateTime(post.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

