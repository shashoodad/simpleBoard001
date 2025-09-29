import { useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '../config';
import { authFetch, SessionExpiredError } from '../lib/authFetch';
import { AuthStorage } from '../lib/auth';

import type { BoardSummary } from '../types/board';
import type { UserSummary } from '../types/user';

interface AccessResponse {
  boards: BoardSummary[];
  users: UserSummary[];
  access: Record<string, number[]>;
}

export default function BoardAccessPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, number[]>>({});
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canManage = useMemo(() => Boolean(selectedUserId) && !isSaving, [selectedUserId, isSaving]);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/admin/board-access/`);
        if (!response.ok) {
          const problem = await response.json().catch(() => ({ detail: '권한 정보를 불러오지 못했습니다.' }));
          throw new Error(problem.detail || '권한 정보를 불러오지 못했습니다.');
        }
        const data: AccessResponse = await response.json();
        setBoards(data.boards);
        setUsers(data.users);
        setAccessMap(data.access ?? {});
        const firstUserId = data.users[0]?.id ? String(data.users[0].id) : '';
        if (firstUserId) {
          setSelectedUserId(firstUserId);
          setSelectedBoardIds(new Set(data.access?.[firstUserId] ?? []));
        }
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          window.location.href = '/login';
          return;
        }
        console.error(err);
        setError(err instanceof Error ? err.message : '권한 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccess();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedBoardIds(new Set());
      return;
    }
    setSelectedBoardIds(new Set(accessMap[selectedUserId] ?? []));
  }, [selectedUserId, accessMap]);

  const handleBoardToggle = (boardId: number) => {
    setSelectedBoardIds((prev) => {
      const next = new Set(prev);
      if (next.has(boardId)) {
        next.delete(boardId);
      } else {
        next.add(boardId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      setError('사용자를 선택해주세요.');
      return;
    }
    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/admin/board-access/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(selectedUserId),
          boardIds: Array.from(selectedBoardIds),
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({ detail: '권한을 저장하지 못했습니다.' }));
        throw new Error(problem.detail || '권한을 저장하지 못했습니다.');
      }

      setFeedback('권한이 성공적으로 업데이트되었습니다.');
      setAccessMap((prev) => ({ ...prev, [selectedUserId]: Array.from(selectedBoardIds) }));
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
        window.location.href = '/login';
        return;
      }
      console.error(err);
      setError(err instanceof Error ? err.message : '권한을 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <p className="info">권한 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>게시판 접근 권한 관리</h1>
          <p className="muted">사용자별로 열람 가능한 게시판을 설정합니다.</p>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {feedback ? <p className="info">{feedback}</p> : null}

      <section className="access-grid">
        <article className="access-card">
          <h2>사용자 선택</h2>
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            disabled={users.length === 0}
          >
            {users.length === 0 ? <option value="">등록된 사용자가 없습니다</option> : null}
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.role})
              </option>
            ))}
          </select>
        </article>

        <article className="access-card">
          <h2>게시판 접근 설정</h2>
          <div className="checkbox-list">
            {boards.length === 0 ? (
              <p className="muted">등록된 게시판이 없습니다.</p>
            ) : (
              boards.map((board) => (
                <label key={board.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedBoardIds.has(board.id)}
                    onChange={() => handleBoardToggle(board.id)}
                  />
                  <span>
                    {board.name}
                    <small className="muted"> ({board.visibility})</small>
                  </span>
                </label>
              ))
            )}
          </div>
          <button type="button" onClick={handleSave} disabled={!canManage}>
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </article>
      </section>
    </div>
  );
}
