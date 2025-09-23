# Git Guide

간단한 Git 사용 가이드입니다. 내부 폐쇄망/사내 Git 서버와 외부 GitHub 모두에 적용 가능한 범용 흐름을 정리했습니다.

## 1. 최초 설정
- Git 설치 확인: `git --version`
- 사용자 정보 설정:
  - `git config --global user.name "홍길동"`
  - `git config --global user.email "hong@example.com"`
- 편집기/기본 브랜치 설정(선택):
  - `git config --global core.editor "code --wait"`
  - `git config --global init.defaultBranch main`

## 2. 저장소 만들기 / 가져오기
- 새 저장소 초기화: `git init`
- 기존 원격 저장소 가져오기: `git clone <REMOTE_URL>`
- 원격 추가/조회/변경:
  - 추가: `git remote add origin <REMOTE_URL>`
  - 조회: `git remote -v`
  - 변경: `git remote set-url origin <NEW_REMOTE_URL>`

## 3. 기본 워크플로우
- 상태 확인: `git status`
- 변경 파일 스테이징: `git add <파일>` 또는 `git add .`
- 커밋: `git commit -m "메시지"`
- 로그 확인: `git log --oneline --graph --decorate --all`
- 브랜치 목록/이동/생성:
  - 목록: `git branch` (원격 포함: `git branch -a`)
  - 생성: `git checkout -b feature/awesome`
  - 이동: `git checkout main`

## 4. 원격과 동기화
- 최초 푸시(메인 브랜치 연결):
  - `git push -u origin main`
- 이후 푸시: `git push`
- 원격 변경 가져오기: `git fetch`
- 병합 갱신: `git pull` (기본은 fetch+merge)
- 리베이스로 갱신(권장 상황에서만): `git pull --rebase`

## 5. 브랜치 전략(권장)
- 기본: `main`은 배포 가능한 안정 브랜치
- 작업: `feature/*`, `fix/*`, `chore/*` 형태로 분기
- 병합은 Pull Request/Merge Request를 통해 코드리뷰 후 진행

## 6. 커밋 메시지 컨벤션(예시)
- 형식: `<type>: <subject>`
- 타입 예: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`
- 예시: `feat: 게시글 목록 API 추가`

## 7. 변경 되돌리기(기본)
- 워킹 디렉터리 변경 되돌리기: `git restore <파일>`
- 스테이징 해제: `git restore --staged <파일>`
- 최근 커밋 수정: `git commit --amend`
- 특정 커밋 되돌리기: `git revert <커밋해시>`

## 8. 충돌 해결 요령
- 충돌 표시 확인: `<<<<<<<`, `=======`, `>>>>>>>`
- 파일 내 수동 수정 후 스테이징: `git add <파일>`
- 병합 완료 커밋: `git commit`

## 9. 태그와 릴리스
- 태그 생성(주석 포함): `git tag -a v1.0.0 -m "첫 릴리스"`
- 태그 푸시: `git push origin v1.0.0`
- 모든 태그 푸시: `git push --tags`

## 10. 사내(폐쇄망) 환경 팁
- 사내 Git 서버 URL 예: `http(s)://git.company.local/group/repo.git`
- 인증: 토큰/계정 기반. 필요 시 `git credential-manager` 또는 SSH 키 사용
- 프록시/미러: 필요 시 `git config --global http.proxy http://proxy.local:8080`

## 11. 자주 쓰는 단축 명령(옵션)
- 보기 좋은 로그 alias:
  - `git config --global alias.lg "log --oneline --graph --decorate --all"`
  - 사용: `git lg`

---

빠른 시작 예시
1) 저장소 초기화 및 최초 커밋
- `git init`
- `git add .`
- `git commit -m "chore: bootstrap repo"`

2) 원격 연결 후 푸시
- `git remote add origin <REMOTE_URL>`
- `git push -u origin main`
