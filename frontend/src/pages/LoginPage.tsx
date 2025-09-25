import { FormEvent, useState } from 'react';

import { API_BASE_URL } from '../config';

export default function LoginPage() {
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

      if (!response.ok) {
        throw new Error('로그인에 실패했습니다. 환경 변수를 확인하세요.');
      }

      // TODO: 토큰 저장 및 사용자 정보 갱신 처리
      console.info('로그인 성공', await response.json());
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
