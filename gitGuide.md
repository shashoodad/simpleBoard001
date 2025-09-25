# Git Guide

SimpleBoard001 저장소에서 일관된 협업을 위해 아래 규칙을 따른다.

## 1. 기본 설정
- Git 버전 확인: `git --version`
- 사용자 정보 설정:
  - `git config --global user.name "홍길동"`
  - `git config --global user.email "hong@example.com"`
- 기본 브랜치명을 `main`으로 지정하는 것을 권장: `git config --global init.defaultBranch main`

## 2. 브랜치 전략
- `main`: 서비스 운영(프로덕션)용. 운영 환경에 배포되는 소스만 존재해야 하며 직접 커밋 금지.
- `dev`: 통합 개발 환경. 모든 기능 개발과 통합 테스트는 dev에서 진행한 뒤 PR/리뷰를 거쳐 main에 병합.
- 기능 단위 브랜치: `feature/*`, `fix/*`, `chore/*` 등을 `dev`에서 분기하고 완료 후 다시 `dev`로 병합.
- 병합 절차: 기능 브랜치 → PR → `dev` 병합 → 충분한 검증 후 `main`에 병합.

## 3. 환경 분리 운영
- `dev`와 `main`은 서로 다른 인프라/설정 값을 가질 수 있다.
- 환경별 `.env` 파일을 분리 관리한다. 예) `backend/.env.dev`, `backend/.env.prod`, `frontend/.env.development`, `frontend/.env.production`.
- 소스 코드는 환경 변수를 통해 동작이 달라질 수 있음을 전제로 작성한다.
- 운영 반영 직전에는 `main`에서 사용하는 환경 변수 파일을 최신 상태로 검증하고 보안 저장소에 관리한다.

## 4. 커밋 & 푸시
- 상태 확인: `git status`
- 스테이징: `git add <파일>` 또는 `git add .`
- 커밋: `git commit -m "<type>: <subject>"`
- 푸시: `git push`
- 기본 메시지 타입 예: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `build`.

## 5. 변경 이력 문서화
- 모든 변경사항은 `releaseNote.md`에 작성한다. 형식 예시는 아래 “문서 관리 규칙” 참고.
- 작업 지시 및 대화 내역은 `promotHistory.md`에 순차 기록한다.

## 6. 문서 관리 규칙
- `releaseNote.md`: 날짜, 브랜치, 주요 변경, 배포 대상(DEV/MAIN) 등을 표 형태로 정리.
- `promotHistory.md`: 요청자, 요청 시각, 지시 내용, 조치 결과를 누적 기록하며, 모든 항목은 한국어로 작성한다.
- 문서를 갱신한 경우 반드시 함께 커밋하여 변경 내역을 추적한다.

## 7. 충돌 및 롤백
- 충돌 해결: 충돌 파일 수정 → `git add` → `git commit`
- 롤백:
  - 작업중 파일 되돌리기: `git restore <파일>`
  - 스테이징 해제: `git restore --staged <파일>`
  - 커밋 되돌리기: `git revert <커밋>`

## 8. 배포 준비 체크리스트
1. `dev`에서 최신 변경 사항 확인 및 테스트 통과 (`pnpm test`, `python manage.py test` 등).
2. `releaseNote.md`와 `promotHistory.md` 업데이트 여부 확인.
3. 환경 변수 파일(dev/prod)이 최신인지 검증.
4. PR 리뷰 및 승인을 거쳐 `main`으로 병합.
5. 배포 후 태그 생성: `git tag -a vX.Y.Z -m "릴리스 메모"` → `git push origin vX.Y.Z`.

## 9. 자주 쓰는 기타 명령
- 로그: `git log --oneline --graph --decorate --all`
- 원격 정보: `git remote -v`
- 원격 최신 동기화: `git fetch`, `git pull --rebase`

---

초기 세팅 요약
1. 저장소 생성 또는 복제: `git init` / `git clone <URL>`
2. 원격 연결: `git remote add origin <URL>`
3. 첫 푸시: `git push -u origin main`
