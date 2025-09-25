import { FormEvent, useState } from 'react';

export default function RegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    // TODO: connect to registration API endpoint
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>가입 신청</h1>
        <label htmlFor="name">이름</label>
        <input id="name" name="name" required />

        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required />

        <label htmlFor="organization">소속</label>
        <input id="organization" name="organization" />

        <label htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required />

        <label htmlFor="purpose">이용 목적</label>
        <textarea id="purpose" name="purpose" rows={3} />

        <label className="checkbox">
          <input type="checkbox" name="terms" required />
          <span>이용 약관에 동의합니다.</span>
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '신청 중...' : '가입 신청'}
        </button>
      </form>
    </main>
  );
}
