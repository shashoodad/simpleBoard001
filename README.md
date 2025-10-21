# SimpleBoard001
역할 기반 접근 제어와 멀티미디어 게시 기능을 갖춘 React + Django 협업 게시판입니다.

## 핵심 기능
- JWT 인증과 가입 심사 흐름을 통한 안전한 사용자 관리
- 카드형/리스트형 게시판과 게시글, 첨부 파일, Youtube 임베드 지원
- Role 및 BoardAccess 기반 세밀한 접근 통제
- Swagger(OpenAPI) 기반 API 문서 제공

## 기술 스택
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Python 3.11+, Django 5, Django REST Framework, SimpleJWT, drf-spectacular
- **Database**: 개발 기본 SQLite, 운영 PostgreSQL 권장

## 문서 모음
- [`docs/architecture.md`](docs/architecture.md) – 아키텍처 및 기능 설명서
- [`docs/run-guide.md`](docs/run-guide.md) – 실행 및 배포 가이드
- [`docs/git-guide.md`](docs/git-guide.md) – Git 사용 안내
- [`releaseNote.md`](releaseNote.md) – 버전별 변경 사항
- [`promptHistory.md`](promptHistory.md) – 프롬프트 기록

## 시작하기
프로젝트 설정과 실행 절차는 `docs/run-guide.md`를 참고하세요. 주요 변경 후에는 `npm run build`와 `python manage.py check`로 빌드·시스템 점검을 수행합니다.
