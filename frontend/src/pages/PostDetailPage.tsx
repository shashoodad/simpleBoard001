import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import 'react-markdown-editor-lite/lib/index.css';

import { API_BASE_URL } from '../config';
import { authFetch, SessionExpiredError } from '../lib/authFetch';
import { AuthStorage } from '../lib/auth';

import type { PostSummary } from '../types/board';

interface PostDetail extends PostSummary {
  board: number;
}

const MARKDOWN_PLACEHOLDER = '본문을 수정해 주세요. 마크다운과 이미지 붙여넣기를 지원합니다.';

const renderMarkdown = (markdown: string) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    urlTransform={(url) => url}
  >
    {markdown}
  </ReactMarkdown>
);

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [title, setTitle] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setRole(localStorage.getItem('userRole'));
    setEmail(localStorage.getItem('userEmail'));
  }, []);

  const canEdit = useMemo(() => {
    if (!post) return false;
    if (role === 'admin') return true;
    if (!email) return false;
    const authorEmail = post.author_email ?? null;
    return authorEmail ? authorEmail === email : false;
  }, [email, post, role]);

  useEffect(() => {
    if (!postId) {
      setError('잘못된 게시글입니다.');
      setIsLoading(false);
      return;
    }

    let ignore = false;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authFetch(`${API_BASE_URL}/boards/posts/${postId}/`);
        if (!response.ok) {
          const problem = await response.json().catch(() => ({ detail: '게시글을 불러오는 데 실패했습니다.' }));
          throw new Error(problem.detail || '게시글을 불러오는 데 실패했습니다.');
        }
        const data: PostDetail = await response.json();
        if (ignore) return;
        setPost(data);
        setTitle(data.title);
        setEditorValue(data.content);
        setUpdateMessage(null);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          navigate('/login', { replace: true });
          return;
        }
        console.error(err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : '게시글을 불러오는 데 실패했습니다.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      ignore = true;
    };
  }, [postId, navigate]);

  useEffect(() => {
    if (!isEditing && post) {
      setTitle(post.title);
      setEditorValue(post.content);
    }
  }, [isEditing, post]);

  const handleStartEdit = () => {
    if (!post) return;
    setTitle(post.title);
    setEditorValue(post.content);
    setUpdateError(null);
    setUpdateMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!post) return;
    setTitle(post.title);
    setEditorValue(post.content);
    setUpdateError(null);
    setIsEditing(false);
  };

  const handleImageUpload = async (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('이미지를 불러오지 못했습니다. 다시 시도해 주세요.'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post) return;

    const trimmedTitle = title.trim();
    const trimmedBody = editorValue.trim();

    if (!trimmedTitle || !trimmedBody) {
      setUpdateError('제목과 본문을 모두 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setUpdateError(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/boards/posts/${post.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedBody }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({ detail: '게시글 수정에 실패했습니다.' }));
        throw new Error(problem.detail || '게시글 수정에 실패했습니다.');
      }

      const updated: PostDetail = await response.json();
      setPost(updated);
      setTitle(updated.title);
      setEditorValue(updated.content);
      setIsEditing(false);
      setUpdateMessage('게시글이 수정되었습니다.');
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
        navigate('/login', { replace: true });
        return;
      }
      console.error(err);
      setUpdateError(err instanceof Error ? err.message : '게시글 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

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

  const authorLabel = post.author_name ?? post.author_email ?? 'admin@shashoo.com';
  const createdAtLabel = new Date(post.created_at).toLocaleString();
  const boardLabel = post.board_name ?? `#${post.board}`;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>게시글 상세</h1>
          <p className="muted small">{authorLabel} · {createdAtLabel}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="primary outline" onClick={() => navigate(-1)}>
            목록으로
          </button>
          {canEdit ? (
            isEditing ? (
              <button type="button" className="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                취소
              </button>
            ) : (
              <button type="button" className="primary" onClick={handleStartEdit}>
                수정하기
              </button>
            )
          ) : null}
        </div>
      </header>

      {!isEditing && updateMessage ? <p className="info">{updateMessage}</p> : null}
      {updateError && !isEditing ? <p className="error">{updateError}</p> : null}

      {isEditing ? (
        <form id="post-edit-form" className="editor-form" onSubmit={handleSubmit}>
          {updateError ? <p className="error">{updateError}</p> : null}
          <label htmlFor="edit-board">게시판</label>
          <p id="edit-board" className="read-only-field">{boardLabel}</p>

          <label htmlFor="edit-title">제목</label>
          <input
            id="edit-title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label htmlFor="edit-content">본문</label>
          <div id="edit-content" className="md-editor-wrapper">
            <MdEditor
              ref={editorRef}
              value={editorValue}
              style={{ height: '420px' }}
              renderHTML={(text) => renderMarkdown(text)}
              onChange={({ text }) => setEditorValue(text)}
              onImageUpload={handleImageUpload}
              view={{ menu: true, md: true, html: false }}
              placeholder={MARKDOWN_PLACEHOLDER}
            />
          </div>

          <button type="submit" disabled={isSaving}>
            {isSaving ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      ) : (
        <section className="editor-form read-only">
          <div className="form-field">
            <label>게시판</label>
            <p className="read-only-field">{boardLabel}</p>
          </div>
          <div className="form-field">
            <label>제목</label>
            <p className="read-only-field">{post.title}</p>
          </div>
          <div className="form-field">
            <label>본문</label>
            <div className="read-only-field multiline markdown-body">
              {renderMarkdown(post.content)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
