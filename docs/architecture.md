# SimpleBoard001 아키텍처 및 기능 설명서

## 1. 시스템 개요
- **목표**: 기업 내 프로젝트/카드형 게시물을 통합 관리하고, 사용자 등급에 따라 접근 권한을 제어하는 협업 게시판 플랫폼.
- **구성**: React + Vite 기반 SPA 프런트엔드와 Django REST Framework 기반 백엔드가 `/api` 프록시를 통해 통신하며 JWT 인증을 사용.
- **핵심 가치**: 빠른 온보딩, 역할별 정보 접근 제어, 멀티미디어 콘텐츠 게시 및 관리의 자동화.

## 2. 전체 아키텍처
```
[사용자 브라우저]
        │
        ▼
[프런트엔드 SPA (frontend/)]
        │  REST API 호출 (기본 경로: /api)
        ▼
[백엔드 API (backend/)]
        │
 ┌──────┴─────────┐
 │                │
[관계형 DB]   [미디어 스토리지]
```
- 프런트엔드는 Vite dev server 또는 정적 배포 환경에서 동작하며 API 호출은 반드시 `/api`를 기본 경로로 사용.
- 백엔드는 Django 5 + DRF 구성으로 `apps.accounts`, `apps.boards` 앱을 중심으로 JWT 인증, 게시판, 첨부 파일, Youtube 임베드 기능을 제공.
- 스토리지는 개발 기본값으로는 `MEDIA_ROOT` 로컬 디렉터리, 운영은 S3/NAS 등을 고려.

## 3. 프런트엔드 구조
- **기술 스택**: React 18, TypeScript, Tailwind CSS.
- **주요 디렉터리**
  - `src/components` : 공통 UI 컴포넌트, 게시판/카드형 UI.
  - `src/features` : 인증, 게시판, 게시글 등 도메인 모듈.
  - `src/api` : axios 기반 HTTP 클라이언트, `/api` 프록시 기준 URL 관리.
  - `src/routes` : 라우팅 정의, 인증 가드.
  - `src/config.ts` : `VITE_API_BASE_URL` 등 환경 변수 추상화.
- **상태 관리**: React Query(데이터 패칭)와 React Context/훅 조합으로 인증 상태 및 UI 상태를 관리.
- **권한 처리**: 사용자 역할 정보를 `me` 엔드포인트로부터 받아 라우트 보호 및 기능 토글에 활용.

## 4. 백엔드 구조
- **프로젝트 루트**: `backend/config/` (settings, URL, WSGI/ASGI 설정).
- **주요 앱**
  - `apps.accounts`: 사용자/조직/승인 흐름, JWT 발급 및 토큰 갱신, Role 기반 권한.
  - `apps.boards`: 게시판(Board), 게시글(Post), 첨부파일(Attachment), YoutubeEmbed, BoardAccess 관리.
- **API 설계**
  - `api/auth/*`: 로그인, 토큰 갱신, 자기 프로필, 가입 신청/승인, 역할 변경.
  - `api/boards/*`: 게시판 CRUD, 게시글 CRUD, 게시판 접근권 관리.
- **인증/보안**
  - `REST_FRAMEWORK`에 SimpleJWT 구성, Access/Refresh 토큰을 발급.
  - DRF 권한 클래스로 역할별 권한 제어, Swagger(drfspectacular) 기반 API 문서화.

## 5. 데이터 모델 핵심 요약
| 테이블 | 주요 필드 | 설명 |
| --- | --- | --- |
| User | role(enum), status(enum), premium_until | 역할/승인 흐름/프리미엄 만료일 관리 |
| Registration | status(enum), decided_by(FK) | 가입 신청 및 승인 이력 |
| Board | visibility(enum) | 게시판 기본 접근 레벨 |
| BoardAccess | board(FK), user(FK), can_view | 특정 사용자에 대한 접근 예외 설정 |
| Post | view_type(enum), attachments | 게시글 본문/카드형 보기 유형 |
| Attachment | file, mime_type, file_size | 업로드 파일 메타데이터 |
| YoutubeEmbed | video_id, thumbnail_url | 게시글 내 Youtube 링크 캐시 |

## 6. 주요 기능 흐름
1. **가입 신청 및 승인**
   - 사용자는 `/api/auth/registrations/`로 신청 → 관리자는 `/admin/registrations/` API로 승인/거절.
2. **JWT 인증**
   - 로그인 시 `/api/auth/login/`에서 Access/Refresh 발급, Refresh 토큰으로 `/api/auth/refresh/` 호출.
3. **게시판/게시글**
   - 게시판은 역할별 가시성을 설정하고, 필요 시 `BoardAccess`로 세부 권한 부여.
   - 게시글은 카드/목록형 뷰 타입을 설정, 첨부파일 업로드와 Youtube 임베드를 지원.
4. **역할 기반 메뉴 노출**
   - 프런트엔드는 사용자 역할에 따라 관리 메뉴 및 승인 기능을 조건부 렌더링.

## 7. 역할 및 권한 정책
| 역할 | 주요 권한 |
| --- | --- |
| basic | 공개/기본 게시판 열람, 본인 게시글 CRUD |
| premium | premium 게시판 접근, 확장된 첨부/임베드 한도 |
| admin | 사용자 관리, 게시판 편집, BoardAccess 설정 |
- 승인 상태(status)가 `approved`가 아닐 경우 핵심 기능 접근이 제한되며, `pending/rejected` 상태 사용자에 대한 안내 메시지를 프런트엔드에서 처리.

## 8. 품질 및 운영 고려사항
- **테스트**: 백엔드 `python manage.py test`, 프런트엔드 `npm run test`(추가 시) 및 `npm run lint`.
- **빌드 검증**: 주요 변경 후 `npm run build`, `python manage.py check` 실행.
- **배포**: 프런트는 정적 빌드 산출물을 CDN/웹서버에 배포, 백엔드는 Gunicorn+Nginx 조합 권장.
- **로그/모니터링**: Django LOGGING 설정, Sentry 등 APM 연동 고려.
- **보안**: HTTPS 종단, JWT 만료/재발급 관리, 업로드 파일 MIME 및 크기 제한 필터.
