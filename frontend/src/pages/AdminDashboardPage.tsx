import { APP_ENV } from '../config';

export default function AdminDashboardPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>관리자 대시보드</h1>
          <p className="muted">현재 실행 환경: {APP_ENV}</p>
        </div>
      </header>
      <section className="admin-grid">
        <article className="card">
          <h2>가입 신청</h2>
          <p>가입 신청 목록과 승인/거절 기능 연결 예정.</p>
        </article>
        <article className="card">
          <h2>사용자 권한</h2>
          <p>사용자 역할 변경 및 프리미엄 만료일 설정 기능 통합 예정.</p>
        </article>
        <article className="card">
          <h2>권한별 메뉴 관리</h2>
          <p>메뉴-역할 매핑을 편집하는 UI/API와 연동.</p>
        </article>
      </section>
    </div>
  );
}

