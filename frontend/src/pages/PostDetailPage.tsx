import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { API_BASE_URL } from '../config';
import { authFetch, SessionExpiredError } from '../lib/authFetch';
import { AuthStorage } from '../lib/auth';

import type { PostSummary } from '../types/board';

interface PostDetail extends PostSummary {
  content: string;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError('잘못된 게시글입니다.');
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authFetch(`${API_BASE_URL}/posts/${postId}/`);
        if (!response.ok) {
          const problem = await response.json().catch(() => ({ detail: '게시글을 불러오지 못했습니다.' }));
          throw new Error(problem.detail || '게시글을 불러오지 못했습니다.');
        }
        const data: PostDetail = await response.json();
        setPost(data);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          navigate('/login', { replace: true });
          return;
        }
        console.error(err);
        setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  if (isLoading) {
    return (
      <div className="page">
        <p className="info">게시글을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page">
        <p className="error">{error ?? '게시글을 찾을 수 없습니다.'}</p>
        <button type="button" className="primary" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{post.title}</h1>
          <p className="muted small">
            {post.author_name ?? post.author_email ?? 'admin@shashoo.com'} · {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
        <button type="button" className="primary outline" onClick={() => navigate(-1)}>
          목록으로
        </button>
      </header>

      <article className="post-detail">
        <pre>{post.content}</pre>
      </article>
    </div>
  );
}
