import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../config';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => ({ detail: '응답 파싱에 실패했습니다.' }));

      if (!response.ok) {
        throw new Error(result.detail || '로그인에 실패했습니다. 입력 정보를 다시 확인하세요.');
      }

      const accessToken = result.accessToken ?? result.access ?? '';
      const refreshToken = result.refreshToken ?? result.refresh ?? '';

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      if (accessToken) {
        try {
          const meResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (meResponse.ok) {
            const me = await meResponse.json();
            localStorage.setItem('userRole', me.role ?? 'basic');
            localStorage.setItem('userEmail', me.email ?? email);
          }
        } catch (fetchError) {
          console.error('현재 사용자 정보를 가져오지 못했습니다.', fetchError);
        }
      }

      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>로그인</h1>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
        <label htmlFor="email">이메일</label>
        <input id="email" type="email" name="email" required autoComplete="email" />

        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" name="password" required autoComplete="current-password" />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}
