import { FormEvent, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '../config';
import type { BoardSummary, ViewMode } from '../types/board';

export default function PostEditorPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [viewType, setViewType] = useState<ViewMode>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setBoardsError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      setIsLoadingBoards(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

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
        if ((err as DOMException)?.name === 'AbortError') {
          return;
        }
        console.error(err);
        setBoardsError(err instanceof Error ? err.message : '게시판 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoadingBoards(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const canSubmit = useMemo(() => !isLoadingBoards && selectedBoardId !== '', [isLoadingBoards, selectedBoardId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    setSubmitError(null);
    setMessage(null);

    if (!canSubmit) {
      setSubmitError('등록 가능한 게시판이 없습니다. 먼저 게시판을 선택하거나 생성해주세요.');
      return;
    }

    const boardId = Number(selectedBoardId);
    if (Number.isNaN(boardId) || boardId <= 0) {
      setSubmitError('유효한 게시판을 선택해주세요.');
      return;
    }

    const formData = new FormData(form);
    const payload = {
      title: formData.get('title')?.toString()?.trim() ?? '',
      content: formData.get('content')?.toString()?.trim() ?? '',
      view_type: viewType,
    };

    if (!payload.title || !payload.content) {
      setSubmitError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인 정보가 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/posts/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({ detail: '글 작성에 실패했습니다.' }));
        throw new Error(problem.detail || '글 작성에 실패했습니다.');
      }

      setMessage('글이 성공적으로 등록되었습니다.');
      form.reset();
      setSelectedBoardId(String(boardId));
      setViewType('card');
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>게시글 작성</h1>
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
          {!isLoadingBoards && boards.length === 0 ? <option value="">게시판이 없습니다</option> : null}
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>

        <label htmlFor="title">제목</label>
        <input id="title" name="title" required placeholder="제목을 입력하세요" />

        <label htmlFor="content">내용</label>
        <textarea id="content" name="content" rows={10} required placeholder="본문을 입력하세요" />

        <label htmlFor="viewType">기본 노출</label>
        <select id="viewType" name="viewType" value={viewType} onChange={(event) => setViewType(event.target.value as ViewMode)}>
          <option value="card">카드형</option>
          <option value="list">리스트형</option>
        </select>

        <button type="submit" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
