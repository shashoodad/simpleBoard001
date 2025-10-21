# 프로젝트 실행 설명서

## 1. 사전 준비
- **Node.js**: 20 LTS 이상 (npm 또는 pnpm 사용 가능).
- **Python**: 3.11 이상.
- **데이터베이스**: 개발 기본값은 SQLite, 운영 시 PostgreSQL 권장.
- **프록시 환경**: API 호출은 반드시 `/api` 프록시를 사용하며, 직접 `localhost:8000`을 호출하지 않습니다.

## 2. 공통 환경 변수
| 구분 | 키 | 예시 값 | 설명 |
| --- | --- | --- | --- |
| 프런트엔드 | `VITE_API_BASE_URL` | `/api` | 모든 API 요청 기본 경로 |
| 백엔드 | `DJANGO_SETTINGS_MODULE` | `config.settings.local` | 로컬 실행용 설정 |
| 백엔드 | `.env` | `DATABASE_URL=...` | 데이터베이스, JWT 시크릿 등 관리 |

## 3. 백엔드 실행 절차
1. 가상환경 생성 및 활성화  
   ```bash
   cd backend
   python -m venv .venv
   # Windows PowerShell
   .venv\Scripts\Activate.ps1
   # macOS/Linux
   source .venv/bin/activate
   ```
2. 패키지 설치  
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. 환경변수 설정(.env)과 데이터베이스 준비  
   - 기본 SQLite 사용 시 별도 설정 없이 `db.sqlite3` 사용.
   - 설정 변경 시 `DATABASE_URL`, `MEDIA_ROOT`, `ALLOWED_HOSTS` 등을 `.env`에 정의.
4. 마이그레이션 및 관리자 계정  
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # 필요 시
   ```
5. 개발 서버 실행  
   ```bash
   python manage.py runserver
   ```
   - 기본 주소: `http://127.0.0.1:8000`
   - API 문서(Swagger): `/api/docs/`

## 4. 프런트엔드 실행 절차
1. 의존성 설치  
   ```bash
   cd frontend
   npm install    # 또는 pnpm install
   ```
2. 환경 변수 설정  
   - `.env` 또는 `.env.local` 에 `VITE_API_BASE_URL=/api` 설정.
   - 프록시 서버나 배포 환경에서도 동일한 경로를 유지.
3. 개발 서버 실행  
   ```bash
   npm run dev
   ```
   - 기본 주소: `http://127.0.0.1:5173`
   - 프록시 설정은 `vite.config.ts` 의 `/api` 프록시를 통해 백엔드로 전달됩니다.

## 5. 빌드 및 품질 검증
- **프런트엔드**  
  ```bash
  npm run lint
  npm run build
  ```
- **백엔드**  
  ```bash
  python manage.py check
  python manage.py test   # 필요 시
  ```
- 주요 변경 후에는 두 빌드/점검 명령을 모두 실행해 품질을 확인합니다.

## 6. 배포 시 고려사항
- **프런트엔드**: `npm run build` 결과물(`dist/`)을 웹 서버 또는 CDN에 올리고, `/api` 프록시가 백엔드로 연결되도록 리버스 프록시 설정(Nginx 등)을 구성합니다.
- **백엔드**: Gunicorn + Nginx 조합 권장. 정적/미디어 파일을 별도 스토리지(S3/NAS)에 제공하고, HTTPS를 적용합니다.
- **환경 분리**: `config/settings/<env>.py` 구성을 사용해 개발/운영 설정을 분리하고, 시크릿 값은 환경 변수나 시크릿 매니저에 보관합니다.

## 7. 문제 해결 팁
- **마이그레이션 불일치**: `python manage.py makemigrations`, `python manage.py migrate`를 순차적으로 실행 후 마이그레이션 파일을 커밋합니다.
- **CORS/프록시 오류**: 프런트엔드의 API 경로가 `/api`로 유지되는지 확인하고, 백엔드 `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` 값을 점검합니다.
- **JWT 만료**: 프런트엔드는 Refresh 토큰으로 자동 갱신 로직을 유지하고, 만료 시 로그아웃 안내를 제공합니다.

## 8. 문서 및 로그
- 작업하거나 정책을 변경할 때마다 `releaseNote.md`, `promptHistory.md`를 즉시 갱신합니다.
- 서버 로그는 Django LOGGING 설정 또는 외부 APM(Sentry 등)을 활용해 중앙 집중화합니다.
