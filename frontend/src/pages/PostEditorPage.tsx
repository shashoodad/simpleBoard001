import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import 'react-markdown-editor-lite/lib/index.css';

import { API_BASE_URL } from '../config';
import { authFetch, SessionExpiredError } from '../lib/authFetch';
import { AuthStorage } from '../lib/auth';

import type { BoardSummary } from '../types/board';

const MARKDOWN_PLACEHOLDER = '내용을 입력해 주세요. 마크다운과 이미지 붙여넣기를 지원합니다.';

const renderMarkdown = (markdown: string) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    urlTransform={(url) => url}
  >
    {markdown}
  </ReactMarkdown>
);

export default function PostEditorPage() {
  const navigate = useNavigate();
    const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

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
          setSelectedBoardId(String(data[0].id));
        }
        setBoardsError(null);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          navigate('/login', { replace: true });
          return;
        }
        console.error(err);
        setBoardsError(err instanceof Error ? err.message : '게시판 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoadingBoards(false);
      }
    };

    fetchBoards();
  }, [navigate]);

  const canSubmit = useMemo(() => !isLoadingBoards && selectedBoardId !== '', [isLoadingBoards, selectedBoardId]);

  const handleImageUpload = async (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('이미지를 불러오지 못했습니다. 다시 시도해 주세요.'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    setSubmitError(null);
    setMessage(null);

    if (!canSubmit) {
      setSubmitError('먼저 게시판을 선택해 주세요.');
      return;
    }

    const boardId = Number(selectedBoardId);
    if (Number.isNaN(boardId) || boardId <= 0) {
      setSubmitError('유효한 게시판을 선택해 주세요.');
      return;
    }

    const formData = new FormData(form);
    const title = formData.get('title')?.toString().trim() ?? '';
    const markdown = content.trim();

    if (!title || !markdown) {
      setSubmitError('제목과 본문을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/boards/${boardId}/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content: markdown }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({ detail: '글 작성에 실패했습니다.' }));
        throw new Error(problem.detail || '글 작성에 실패했습니다.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedBoardId', String(boardId));
      }
      form.reset();
      setContent('');
      setSelectedBoardId(String(boardId));
      navigate('/', { replace: true });
      return;
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
        navigate('/login', { replace: true });
        return;
      }
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : '요청 처리 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>글 작성</h1>
      </header>
      <form className="editor-form" onSubmit={handleSubmit}>
        {boardsError ? <p className="error">{boardsError}</p> : null}
        {submitError ? <p className="error">{submitError}</p> : null}
        {message ? <p className="info">{message}</p> : null}

        <label htmlFor="boardId">게시판</label>
        <select
          id="boardId"
          name="boardId"
          value={selectedBoardId}
          onChange={(event) => setSelectedBoardId(event.target.value)}
          disabled={isLoadingBoards || boards.length === 0}
          required
        >
          {isLoadingBoards ? <option value="">게시판을 불러오는 중...</option> : null}
          {!isLoadingBoards && boards.length === 0 ? <option value="">등록된 게시판이 없습니다</option> : null}
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>

        <label htmlFor="title">제목</label>
        <input id="title" name="title" required placeholder="제목을 입력해 주세요" />

        <label htmlFor="content-editor">본문</label>
        <div id="content-editor" className="md-editor-wrapper">
          <MdEditor
            value={content}
            style={{ height: '420px' }}
            renderHTML={(text) => renderMarkdown(text)}
            onChange={({ text }) => setContent(text)}
            onImageUpload={handleImageUpload}
            view={{ menu: true, md: true, html: false }}
            placeholder={MARKDOWN_PLACEHOLDER}
          />
        </div>

        <button type="submit" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? '작성 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
