# 축구판에서 선별한 야구 편의성 개선

## 비교 기준과 범위

- 읽기 전용 Footballlife main: `821d2bc` (PR #9).
- 수정 대상 baseball-life main: `c80fd63` (PR #34).
- 작업 브랜치: `feat/football-quality-of-life`.
- 양쪽 저장소에 AGENTS.md 및 .agents/skills/SKILL.md 없음. CLAUDE.md와 개발노트.md 확인. 기본 탑재 저장소와 축구판 파일은 변경하지 않음.

적용: 축구판 `save-transfer.js`의 파일 이동/검증/미리보기/복구 개념을 야구 포지션·시즌 기록·선수 수첩·기존 v1 저장에 맞춰 적용. 자동 저장 오류 알림과 메모리의 최신 진행 내보내기 포함. 자유행동에서 포지션 능력치 직접 선택, 현재값→결과값 안내, 상한/되돌아가기/메뉴 이동 직후 연타 보호 추가.

이미 존재: 시즌 목표·선수 수첩·라이벌/인연 기억·계약·은퇴 진로/엔딩 도감, 10종 미니게임과 상태를 바꾸지 않는 연습장, 컷인/효과음/음소거/움직임 줄이기, 본편 미니게임 취소/입력 보호. 중복 구현하지 않음.

제외: 축구 14종 미니게임은 종목별 조작 설계가 필요함. 시즌 구간별 정산은 야구 출전/계약/기록 밸런스를 바꾸므로 제외. 결과 전후 수치 세분화·복수 특별엔딩은 후속 후보이며 이번에는 저장 편의와 작은 훈련 선택 개선에 집중함.

## 사용과 호환성

- `python3 -m http.server 8173 --bind 127.0.0.1` 후 `http://127.0.0.1:8173/` 접속. 기존처럼 index.html 직접 열기도 가능. 빌드·패키지 설치는 게임 실행에 불필요.
- 시작 화면/메뉴 → 저장 이동·복구 → JSON 내보내기 또는 파일 선택 → 미리보기 → 확인. 미리보기/취소/Esc는 상태를 바꾸지 않음. 잘못된 새 파일 선택 시 이전 미리보기의 확인 버튼을 제거함.
- 가져오기는 경력·도감·보너스를 **교체**함(병합 아님). 파일 2 MiB 제한, 형식/버전/야구 능력치/주요 구조/위험 속성 검사. 축구 파일은 거절.
- 기존 `baseball-life-save-v1`, `baseball-life-collection`, `baseball-life-bonus-looks` 유지. 선수 수첩 등 기존 E.load의 구버전 보정 유지. 음소거·움직임 설정은 이동 대상에서 제외.
- 가져오기 직전 사본 `baseball-life-recovery-v1`과 마지막 저장 시각 `baseball-life-saved-at-v1`만 추가. 매 턴 복구 이력을 쌓지 않음. 손상된 기존 JSON은 `baseball-life-damaged-v1`에 원문 보존. 그 원문은 자동 복구 UI 대상이 아님.
- 저장 실패 시 알림을 보여 주며 최신 메모리 진행을 파일로 내보낼 수 있음. 가져오기 중 쓰기 오류는 기존 활성 키와 메모리 상태를 원복. 브라우저가 원복 쓰기까지 거절하면 완전 원복을 보장할 수 없으므로 중요한 진행은 파일로도 보관.
- 자유행동 연습의 기존 +1/턴/나이/기록 규칙 유지. 전 능력치 상한이면 멘탈 +1(최대 100), 멘탈도 상한이면 돌아가기만 표시. 불러온 옛 자유행동 카드는 현재 선택 화면으로 갱신됨.

## 검증

실행 환경: Node 24.19.0, 설치된 Playwright 및 Chromium. 새 유료 서비스/의존성 도입 없음.

```sh
node tools/run-checks.js /tmp/baseball-qol-full
node tools/player-stories-check.js
node -r ./tools/helpers/browser-preload.cjs tools/minigames-more-check.js /tmp/baseball-qol-more
node -r ./tools/helpers/browser-preload.cjs tools/new-minigame-art-check.js
node -r ./tools/helpers/browser-preload.cjs tools/career-flow-ui-check.js /tmp/baseball-qol-career
# 별도 터미널에서 체험 서버를 실행한 뒤:
node tools/player-stories-preview.cjs 8772
node -r ./tools/helpers/browser-preload.cjs tools/player-stories-ui-check.js /tmp/baseball-qol-stories http://127.0.0.1:8772/
```

기존 전체 회귀 20개 통과(자동 플레이 200판, 성장 균형 1000판 포함). 새 `qol-check.js`, `qol-ui-check.js`도 통과했고 전체 실행기에 추가함. 새 검사는 전 포지션 저장, 기존 v1 보정, 손상/잘못된 종목/버전/과대 파일, 부분 쓰기 실패, 현재 메모리 내보내기, 복구, 파일 다운로드, 시작 화면 가져오기, 미리보기/취소, 능력 선택/상한/재개/연타와 320·390·1280px 화면을 확인함. 12회 커리어 진행 중 파일 형식 검증도 수행.

추가 검사: 선수 스토리 엔진/8개 브라우저 체험, 10종 연습 저장 보존, 새 4종 4등급/터치/키보드/시간 초과/취소/컷인, 은퇴 10진로·20후일담. 결과 로그와 스크린샷은 위 /tmp 출력 폴더에 저장. 소리/움직임 설정 보존 및 기존 AudioContext/연출 회귀 검사 포함.

빌드 명령 없음: index.html의 스크립트 66개 문법, 정적 참조 72개 존재, git diff --check 검사. 실제 휴대폰/iOS Safari, 사람의 청음, 원격 배포 환경은 미실행. 브라우저 저장은 계정 동기화가 아님. 원격 푸시/PR/머지/배포 미실행.
