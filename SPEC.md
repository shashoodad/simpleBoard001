# SimpleBoard001 시스템 사양서

## 1. 프로젝트 개요
- **목표**: React 프런트엔드와 Django 백엔드를 기반으로 한 카드/리스트형 게시판 서비스 구축.
- **범위**: 로그인 이후 이용 가능한 게시판, 멀티미디어 첨부, 관리자 승인 및 권한 관리, 프리미엄 구독형 메뉴 노출 제어.
- **핵심 가치**: 다양한 표현 방식(카드/리스트, 에디터, 유튜브 임베드)을 통한 콘텐츠 생산성 향상과 사용자 등급별 맞춤형 접근 제어.

## 2. 시스템 구성
- **프런트엔드**: React 18, TypeScript, Vite, React Query, React Router, Tailwind CSS.
- **백엔드**: Python 3.13, Django 5.x, Django REST Framework, django-allauth(소셜 확장 대비), django-ckeditor(또는 tiptap 통합 API), Celery(선택), PostgreSQL 15.
- **파일 스토리지**: 기본은 로컬, 운영 시 AWS S3 또는 사내 NAS 연동 옵션.
- **동영상 임베딩**: YouTube IFrame API; URL 입력 시 백엔드에서 유효성 검증 후 저장.
- **인증/인가**: 세션 기반 인증 + JWT 발급(프런트 SPA 연동), 사용자 역할(Role-Based Access Control).
- **배포 구조**: Nginx 리버스 프록시 → Gunicorn(Django) + React 정적 파일, Redis(Celery/세션 캐시) 옵션.

## 3. 사용자 유형 및 권한
| 구분 | 설명 | 권한 요약 |
| --- | --- | --- |
| 기본 유저 | 가입 승인된 일반 사용자 | 공개 게시판 열람, 본인 글 작성/수정, 기본 메뉴 접근 |
| 프리미엄 유저 | 관리자 또는 정산 시스템에서 프리미엄 권한 부여된 사용자 | 기본 권한 + 프리미엄 게시판/메뉴 열람, 특정 첨부 용량 상향 |
| 관리자 | 가입 승인/권한 부여 담당자 | 모든 게시판 열람/관리, 사용자 승인, 역할 변경, 메뉴 편집 |

## 4. 주요 사용자 시나리오
- 신청자가 가입 페이지에서 정보 입력 → 관리자 승인 → 로그인 후 서비스 이용.
- 사용자가 게시판에서 카드형/리스트형 뷰를 전환하며 게시글 탐색.
- 에디터로 텍스트·이미지·파일·유튜브 링크를 포함한 글 작성 후 업로드.
- 프리미엄 유저가 프리미엄 전용 게시판/메뉴 접근.
- 관리자가 가입 신청 조회, 승인/거절, 사용자 역할 조정 및 메뉴 접근 제어 설정.

## 5. 기능 요구사항
### 5.1 공통
- 반응형 UI(모바일, 태블릿, 데스크톱) 지원.
- 다국어 대비 구조(초기 한글, i18n 확장 포인트 정의).
- 접근 제어: 로그인 외부 접근 차단, 역할별 메뉴/게시판 노출 제어.

### 5.2 프런트엔드
- 메인 게시판 목록 카드형/리스트형 토글, 퍼시스턴스(localStorage).
- 게시글 상세: 제목, 본문, 첨부 파일(다운로드), 유튜브 임베드.
- 글쓰기: 리치 텍스트 에디터(이미지, 파일, 임베드), 임시저장, 첨부 업로드 진행률.
- 로그인/로그아웃, 패스워드 재설정, 권한 부족 알림.
- 가입 신청 폼: 기본 정보(이름, 이메일, 비밀번호, 소속, 이용 목적 등) + 이용 약관 동의.
- 프리미엄/관리자 메뉴: 권한에 따른 사이드바 구성, 접근 불가 시 안내 페이지.

### 5.3 백엔드
- Django REST Framework 기반 API 제공, Swagger/OpenAPI 문서 자동화.
- 게시글 CRUD + 게시판/카테고리 관리 + 첨부 파일 업로드(모든 파일 형식, MIME 검증).
- 유튜브 링크 유효성 검사(도메인 필터, 영상 ID 정규식), 썸네일 메타데이터 캐시.
- 회원가입 신청 저장, 이메일 인증(선택), 관리자 승인 워크플로.
- 역할 관리: 기본/프리미엄/관리자, 사용자별 접근 가능한 메뉴·게시판 매핑 테이블 관리.
- 감사 로그: 로그인, 권한 변경, 게시글 삭제 등 주요 이벤트 저장.

### 5.4 관리자 기능
- 가입 신청 목록, 상태별 필터, 승인/반려 사유 기록.
- 사용자 계정 목록, 역할 변경, 프리미엄 기간 설정(옵션).
- 메뉴/게시판 별 권한 매트릭스 UI 연동 API.
- 공지사항, 운영자 문서 게시판 별도 운영.

### 5.5 파일/미디어 처리
- 파일 최대 크기 기본 50MB(환경 변수로 조정), 확장자 화이트리스트 미적용(모든 파일) 대신 바이러스 스캔 옵션 명시.
- 첨부 저장 경로: MEDIA_ROOT/uploads/<year>/<month>/.
- 이미지 썸네일 생성(Celery 비동기 처리 옵션).

## 6. 비기능 요구사항
- **성능**: 목록 조회 500ms 이내, 카드/리스트 전환 즉시 반응(캐싱 활용), 동시 사용자 200명 기준.
- **보안**: HTTPS 전제, CSRF & XSS 방지, 파일 업로드 시 바이러스 스캔 시스템 연동 포인트, 관리자 다중 인증 옵션.
- **확장성**: Docker 기반 컨테이너화, 수평 확장 고려(정적 파일 CDN, 백엔드 오토스케일러).
- **가용성**: 운영 환경 이중화, PostgreSQL 백업/복구 정책(일일 스냅샷 + PITR 옵션).
- **감사**: 주요 활동 감사 로그 유지 1년, Kibana/ELK 연동 가이드.

## 7. 화면 및 UX 설계 지침
- **레이아웃**: 헤더(로고/프로필), 좌측 사이드바(권한별 메뉴), 메인 콘텐츠.
- **목록 화면**: 카드형(썸네일, 제목, 요약), 리스트형(표 형태) 선택 토글.
- **글쓰기 화면**: 탭 구조(본문 작성, 첨부, 미리보기), 에디터 툴바 커스터마이징.
- **관리자 대시보드**: 가입 신청 위젯, 사용자 통계, 최근 게시글 목록.
- **접근성**: 키보드 내비게이션, 색 대비 WCAG AA 기준, 에디터 내 대체 텍스트 옵션.

## 8. 데이터 모델(초안)
| 테이블 | 필드 | 타입 | 설명 |
| --- | --- | --- | --- |
| User | id | UUID | PK |
|  | email | string | 로그인 ID, 고유 |
|  | password | string | hashed |
|  | name | string | 사용자 이름 |
|  | role | enum(asic,premium,dmin) | 권한 |
|  | status | enum(pending,pproved,ejected) | 가입 상태 |
|  | premiumUntil | datetime | 프리미엄 만료일(Null 허용) |
| Profile | userId | FK | 부가 정보(소속, 연락처 등) |
| Board | id | UUID | 게시판 정의 |
|  | name | string | 게시판명 |
|  | description | text | 설명 |
|  | visibility | enum(asic,premium,dmin) | 최소 접근 권한 |
| Post | id | UUID | 게시글 |
|  | boardId | FK | 게시판 연결 |
|  | authorId | FK | 작성자 |
|  | title | string | 제목 |
|  | content | richtext | 본문 |
|  | viewType | enum(card,list) | 기본 노출 형태(게시판 설정 상속 가능) |
| Attachment | id | UUID | 첨부 파일 |
|  | postId | FK | 게시글 |
|  | filePath | string | 저장 경로 |
|  | fileName | string | 원본명 |
|  | fileSize | int | 크기 |
|  | mimeType | string | MIME |
| YoutubeEmbed | id | UUID | 유튜브 링크 |
|  | postId | FK | 게시글 |
|  | videoId | string | 유튜브 영상 ID |
|  | title | string | 제목(캐시) |
| RoleMenu | id | UUID | 메뉴 권한 매핑 |
|  | role | enum | 역할 |
|  | menuKey | string | 메뉴 식별자 |

## 9. API 명세(1차)
| 메서드 | 엔드포인트 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- |
| POST | /api/auth/login | 로그인 | { email, password } | { accessToken, refreshToken, user } |
| POST | /api/auth/logout | 로그아웃 | - | 204 No Content |
| POST | /api/auth/refresh | 토큰 갱신 | { refreshToken } | { accessToken } |
| POST | /api/registrations | 가입 신청 | { name, email, password, organization, note } | { id, status } |
| GET | /api/admin/registrations | 가입 신청 목록 | ?status= | Registration[] |
| PATCH | /api/admin/registrations/:id | 승인/반려 | { status, reason } | { id, status } |
| GET | /api/boards | 게시판 목록 | - | Board[] |
| POST | /api/admin/boards | 게시판 생성 | { name, description, visibility } | Board |
| GET | /api/boards/:boardId/posts | 게시글 목록 | ?view=card|list&page= | { items, pagination } |
| POST | /api/boards/:boardId/posts | 게시글 작성 | multipart/form-data | Post |
| GET | /api/posts/:id | 게시글 상세 | - | Post + attachments + embeds |
| PATCH | /api/posts/:id | 게시글 수정 | multipart/form-data | Post |
| DELETE | /api/posts/:id | 게시글 삭제 | - | 204 |
| POST | /api/admin/users/:id/role | 역할 변경 | { role, premiumUntil } | User |
| GET | /api/admin/menus | 메뉴 권한 매핑 | - | RoleMenu[] |
| PUT | /api/admin/menus | 메뉴 권한 설정 | RoleMenu[] | RoleMenu[] |

## 10. 외부 연동/임베딩
- 유튜브 URL 입력 시 프런트에서 미리보기, 백엔드 검증 후 YoutubeEmbed 저장.
- 파일 첨부: 모든 확장자 허용, 업로드 후 AV 스캔 API 연동 인터페이스 정의.
- 이메일 발송: 가입 승인/거절 알림용 SMTP 또는 SendGrid 연동.

## 11. 개발 환경 및 도구
- **프런트엔드**: Node.js 20 LTS, pnpm, ESLint(airbnb+prettier), Vitest + Testing Library.
- **백엔드**: Poetry 또는 pip-tools, pytest, Django TestCase, DRF SimpleJWT.
- **공통**: Docker Compose 로컬 개발(웹, DB, Redis), pre-commit 훅(형식/테스트).
- **문서화**: OpenAPI(Swagger UI), Storybook(선택), ADR(Architecture Decision Record).

## 12. 배포 및 운영 전략
- 스테이징/프로덕션 이중 환경, GitHub Actions CI → 도커 이미지 빌드 → 레지스트리.
- 마이그레이션 자동화(python manage.py migrate) + 정적 파일 수집(collectstatic).
- 로깅/모니터링: Django LOGGING 설정, Sentry, Prometheus + Grafana.
- 백업: PostgreSQL 일일 백업, 미디어 파일 주간 증분 백업.

## 13. 로드맵(초안)
1. **1주차**: 요구사항 세부화, 디자인 시스템 확정, 기술 스택 설정.
2. **2-3주차**: 백엔드 인증/가입/게시판 API, 프런트 로그인·가입·목록 뷰.
3. **4-5주차**: 첨부/유튜브 임베드, 관리자 승인/권한 관리, 프리미엄 메뉴 노출.
4. **6주차**: 통합 테스트, 보안 점검, 배포 자동화, 문서 마감.

---
본 사양서는 MVP 범위를 기준으로 하며, 세부 정책은 개발 진행 중 추가 협의를 통해 보정한다.
