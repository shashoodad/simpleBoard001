import { FormEvent, useState } from 'react';

import { API_BASE_URL } from '../config';

export default function RegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const acceptedTerms = formData.get('terms') === 'on';
    if (!acceptedTerms) {
      setFeedback('이용 약관에 동의해야 가입 신청이 가능합니다.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.get('name')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      organization: formData.get('organization')?.toString() ?? '',
      purpose: formData.get('purpose')?.toString() ?? '',
      memo: '',
    };

    // TODO: 비밀번호 입력값은 관리자 승인 시 별도로 처리하는 정책 정의 필요

    try {
      const response = await fetch(`${API_BASE_URL}/auth/registrations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('가입 신청 접수에 실패했습니다. 환경 구성을 확인해주세요.');
      }

      setFeedback('가입 신청이 접수되었습니다. 관리자 승인을 기다려주세요.');
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>가입 신청</h1>
        {feedback ? <p className="info">{feedback}</p> : null}
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
