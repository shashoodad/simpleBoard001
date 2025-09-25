import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    // TODO: replace with mutation to backend login API
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>로그인</h1>
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
