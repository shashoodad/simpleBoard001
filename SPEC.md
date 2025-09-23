# SimpleBoard001 시스템 사양서

## 1. 프로젝트 개요
- **목표**: 폐쇄형 환경에서도 동작 가능한 범용 게시판 웹 애플리케이션을 구축한다.
- **주요 기능**: 게시글 목록 조회, 게시글 작성, 게시글 상세 조회, (향후) 게시글 수정/삭제 및 댓글 관리.
- **운영 환경**: 인터넷이 제한되는 사내/내부망 환경. Windows, macOS, Linux를 포함한 범용 OS에서 동일한 동작을 목표로 한다.
- **개발 방식**: 단일 저장소(monorepo)에 프론트엔드와 백엔드를 분리된 패키지로 구성한다.

## 2. 제약 사항 및 고려 사항
- **OS 비종속성**: Node.js 기반 도구만 사용하며, 플랫폼에 특화된 의존성(예: bash 스크립트 전용 명령) 최소화.
- **네트워크 제약**: 외부 패키지 설치가 제한될 수 있으므로, 기본적으로 npm 레지스트리 mirror 또는 사내 캐시 사용을 전제한다.
- **패키지 버전**: 너무 최신도, 너무 구버전도 아닌 안정적인 LTS 버전 채택.
  - Node.js: 18.x (현재 LTS, 2025년에도 지원 중)
  - npm: Node.js 18에 포함된 버전 사용

## 3. 대상 사용자
- 게시판 시스템을 이용해 공지, Q&A, 커뮤니티 글을 관리하려는 일반 사용자
- 시스템 유지보수 및 운영을 담당하는 내부 개발/운영팀

## 4. 기능 요구 사항
### 4.1 필수 기능 (MVP)
- 게시글 목록 조회 (페이지네이션 포함)
- 게시글 상세 조회
- 게시글 작성 (제목, 내용, 작성자)
- 작성/조회 시 필수값 검증 및 기본 오류 메시지 처리

### 4.2 선택 기능 (향후)
- 게시글 수정/삭제 (권한 검증 포함)
- 댓글 작성/관리
- 첨부파일 업로드 (사내 파일 서버 연동 고려)
- 검색/필터 기능

## 5. 비기능 요구 사항
- **성능**: 기본 게시판 조회 1초 이내 응답, 동시 사용자 100명 이하 가정.
- **보안**: CSRF, XSS 대응. JWT 기반 인증(향후). 내부망 기준이지만 HTTPS 지원 고려.
- **유지보수성**: 모듈화된 코딩 컨벤션, 코드 스타일러 및 린터 적용.
- **테스트**: 단위 테스트 및 API 통합 테스트 기본 제공.

## 6. 시스템 구조
- **모노레포 루트**
  - `backend/`: Express 기반 REST API 서버
  - `frontend/`: React 기반 SPA (Vite 빌드 도구)
  - `shared/` (선택): 공통 타입 정의 또는 유틸리티
  - `package.json` 루트: 공용 스크립트, 워크스페이스 설정 (npm workspaces 사용 예정)

### 6.1 개발 스택
- **백엔드**
  - Node.js 18.x
  - Express 4.x
  - TypeScript 5.x
  - 데이터베이스: PostgreSQL 14.x (범용 DB, OS 무관)
  - ORM/쿼리 빌더: Prisma 5.x (TypeScript 친화적이며 멀티 OS 지원)
- **프론트엔드**
  - Node.js 18.x
  - React 18.x
  - Vite 5.x (ESBuild 기반, 빠르고 OS 중립)
  - TypeScript 5.x
  - 상태 관리: React Query (서버 상태), Context API (기본 상태)
- **공통 도구**
  - ESLint + Prettier (JavaScript/TypeScript 코드 스타일)
  - Jest (프론트/백 테스트 공통) + React Testing Library (프론트 전용)
  - Vitest (프론트 대체 테스트 러너로 고려)
  - dotenv (환경 변수 관리)

## 7. 데이터 모델 (초안)
| 엔터티 | 필드 | 타입 | 설명 |
| --- | --- | --- | --- |
| User | id | UUID | PK, 사용자 식별자 |
| | username | string | 로그인/표시용 이름 |
| | passwordHash | string | Bcrypt 해시 |
| | role | enum(`user`,`admin`) | 권한 |
| Post | id | UUID | PK |
| | title | string | 게시글 제목 |
| | content | text | 게시글 내용 |
| | authorId | UUID | User FK |
| | createdAt | datetime | 생성일 |
| | updatedAt | datetime | 수정일 |
| Comment (향후) | id | UUID | PK |
| | postId | UUID | Post FK |
| | authorId | UUID | User FK |
| | content | text | 댓글 내용 |
| | createdAt | datetime | 생성일 |

## 8. API 명세 (MVP)
| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
| --- | --- | --- | --- | --- |
| GET | `/api/posts` | 게시글 목록 조회 | - | `{ items: Post[], pagination: {...} }` |
| GET | `/api/posts/:id` | 게시글 상세 조회 | - | `Post` |
| POST | `/api/posts` | 게시글 생성 | `{ title, content, authorId }` | `Post` |

> 추후 인증/인가가 추가될 경우 `/api/auth/login`, `/api/auth/logout`, JWT 토큰 검증 미들웨어 도입 예정.

## 9. 프론트엔드 화면 구성 (MVP)
- **레이아웃**: 헤더(로고/타이틀) + 주요 콘텐츠 영역
- **페이지**
  - 게시글 목록 페이지: 제목/작성자/작성일 표시, 페이지네이션
  - 게시글 작성 페이지: 폼 (제목, 내용, 제출 버튼)
  - 게시글 상세 페이지: 본문, 작성 정보, 목록으로 돌아가기 링크
- **상태 관리**
  - React Query로 서버 데이터 캐싱
  - Form 관리: React Hook Form 7.x (경량, 검증 지원)

## 10. 개발 워크플로우
1. Node.js 18.x 설치 (플랫폼별 nvm 또는 설치 프로그램 활용)
2. 저장소 클론 후 `npm install` (workspace 의존성 설치)
3. 백엔드 개발 시 `npm run dev:backend` → nodemon / ts-node-dev 기반
4. 프론트엔드 개발 시 `npm run dev:frontend` → Vite dev server
5. 통합 실행을 위해 프록시 설정 또는 `npm run dev` (concurrently 실행 예정)
6. 코드 수정 후 ESLint/Prettier 포맷 적용 (`npm run lint`, `npm run format`)

## 11. 테스트 전략
- **백엔드**: Jest + Supertest를 사용해 REST API 테스트, Prisma 테스트 DB는 SQLite 인메모리 사용
- **프론트엔드**: Vitest/RTL로 컴포넌트 및 페이지 테스트
- **CI/CD**: 사내 GitLab CI 또는 Jenkins 기준, Node.js 18 컨테이너 실행 환경 가정

## 12. 배포 전략 (초기)
- 패키징: 백엔드 Express 앱은 Docker 또는 PM2 기반 서비스로 패키징 가능 (폐쇄망 환경에서의 이미지 배포 고려)
- 프론트엔드: 빌드 결과물을 정적 파일로 제공 (`npm run build:frontend`), NGINX 등 기본 웹서버에 업로드
- 환경 변수는 `.env` 파일과 사내 시크릿 관리 솔루션 병행 사용

## 13. 운영/모니터링
- 로그 관리: Winston 기반 파일 로깅, 운영 환경에서는 로그 로테이션 적용
- 모니터링: 폐쇄망 내 Prometheus/Grafana 또는 OS 로그 기반 모니터링 고려
- 백업: DB 정기 백업 스케줄 수립 (pg_dump)

## 14. 향후 확장 항목
- 인증/인가 강화 (SSO 연동, LDAP 등)
- 알림 기능 (이메일/사내 메신저 연동)
- 첨부파일 바이러스 스캔 및 저장소 분리
- 다국어 지원 (i18n 라이브러리 도입)
- 접근성 향상 (WCAG 준수)

---

위 사양서를 바탕으로 다음 단계에서는 디렉터리 스캐폴딩, 공용 `package.json`, `backend`/`frontend` 초기 설정 등을 진행할 수 있다.

