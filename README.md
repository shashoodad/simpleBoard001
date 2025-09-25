# SimpleBoard001

React 프런트엔드와 Django 백엔드를 기반으로 카드/리스트 전환형 게시판, 멀티미디어 첨부, 가입 승인 및 역할별 권한 관리를 제공하는 시스템을 목표로 합니다.

## 핵심 기능
- 로그인 이후 접근 가능한 권한 기반 게시판과 메뉴 노출 제어
- 카드형/리스트형 게시글 보기 전환 및 사용자 선호 저장
- 리치 텍스트 에디터를 이용한 게시글 작성, 모든 형식의 파일 첨부, 유튜브 영상 임베드
- 가입 신청 → 관리자 승인/반려 → 등급(기본/프리미엄/관리자) 부여 워크플로
- 관리자 대시보드에서 사용자 조회, 역할 변경, 메뉴/게시판 권한 설정
- API 문서(Swagger)와 테스트 자동화를 고려한 백엔드 구조

## 기술 스택
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query, React Router
- **Backend**: Python 3.13, Django 5, Django REST Framework, SimpleJWT, django-allauth
- **Database**: SQLite (개발 기본) → PostgreSQL 15 (운영 권장)
- **기타**: Docker Compose(향후), Redis(옵션), S3/NAS 파일 스토리지 연동 포인트

## 디렉터리 구조
- `frontend/` — React SPA 소스 (Vite + TypeScript)
- `backend/` — Django 프로젝트(`config`)와 앱(`apps.accounts`, `apps.boards`)
- `SPEC.md` — 상세 시스템 사양서
- `gitGuide.md` — 저장소 운영 가이드

## 빠른 시작
### 사전 준비
- Node.js 20 LTS 이상 (pnpm 또는 npm 사용 가능)
- Python 3.13 및 가상환경 도구(venv)
- (선택) PostgreSQL, Redis, Docker

### Backend 설정
```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env  # 환경 변수 필요 시 수정
python manage.py migrate
python manage.py createsuperuser  # 관리자 계정 생성 (선택)
python manage.py runserver
```
- 기본 개발 서버: `http://127.0.0.1:8000`
- Swagger 문서: `http://127.0.0.1:8000/api/docs/`

### Frontend 설정
```bash
cd frontend
pnpm install  # pnpm 미사용 시 npm install
pnpm dev  # 또는 npm run dev
```
- 개발 서버: `http://127.0.0.1:5173`
- 프런트엔드 dev 서버가 `/api` 요청을 Django(`localhost:8000`)로 프록시합니다.

## 테스트 & 품질
- Frontend: `pnpm test`, `pnpm lint`
- Backend: Django TestCase/pytest 도입 예정 (`python manage.py test`)
- pre-commit 훅, Storybook, CI 파이프라인은 추후 SPEC에 따라 확장합니다.

## 추가 문서
- `SPEC.md`: 요구사항, API, 데이터 모델 세부 내용
- `/backend/apps/*/`와 `/frontend/src/` 내 모듈별 주석과 TODO 확인

필요한 개선이나 추가 요구사항은 SPEC 업데이트 후 반영해주세요.
