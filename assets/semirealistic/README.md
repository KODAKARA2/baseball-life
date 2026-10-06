# 야구 인생 — 반실사 그림 모음

사용자가 승인한 주인공과 릴리 하퍼 샘플의 화풍으로 게임 그림 **74장**을 다시 그렸습니다. 저장일: 2026-10-06.

[전체 갤러리 열기](index.html) · [생성 프롬프트와 파일 대응표](prompts.json)

| 종류 | 수량 | 형식 |
|---|---:|---|
| 주인공 | 30 | 10개 시기·상태 × 외모 3종 |
| 히로인 | 24 | 6명 × 만남·연인·결혼식·배우자 |
| 조연 | 11 | 감독·가족·동료 등 |
| 장소 | 9 | 경기장·거리·실내·학교 등 |

- 인물: **1024 × 1536 PNG**, 투명 배경.
- 장소: **1536 × 1024 PNG**, 불투명 배경.
- 파일은 모두 `images/` 안에 있습니다. 전체 약 138 MiB.
- 기존 게임의 `../../images/` 파일은 보존했습니다. 새 파일은 아직 게임에 연결하지 않았습니다.
- 갤러리에서 분류·검색, 기존 그림과 전환, 밝고 어두운 바탕 확인, 개별 PNG 저장을 할 수 있습니다. 파일을 직접 열거나 게임의 로컬 서버에서 열 수 있습니다.
- 원래 JPG였던 장소 6장도 이번 결과는 PNG입니다. 게임에 적용할 때 확장자와 경로를 함께 변경해야 합니다.
- 원본 해상도로 보관했습니다. 게임에 적용할 때 휴대폰 로딩을 고려해 표시 크기에 맞춘 배포용 사본을 준비하세요.

## 제작 기록

내장 이미지 생성 도구(`image_gen`)로 원본 그림을 참고하여 화풍을 변경했습니다. 외부 API나 별도 생성 CLI는 사용하지 않았습니다. 처음에는 승인된 샘플 2장을 포함하고 나머지 72장을 같은 방향으로 제작했습니다.

릴리 하퍼 4장은 사용자 피드백에 따라 두 차례 수정했습니다. 성인 설정을 유지하며 부드러운 얼굴선·옅은 분홍빛 화장·가벼운 금발 웨이브로 바꾸고, 보조개와 입가의 깊은 음영을 줄여 입을 다문 미소로 마무리했습니다. [릴리 그림만 보기](index.html?q=%EB%A6%B4%EB%A6%AC). `prompts.json`의 `history`와 `referenceVersions`에 각 수정의 프롬프트와 참고 그림 버전(Git 커밋 또는 생성 파일 식별자)을 기록했습니다.

마지막 얼굴 수정 중 생성 도구가 만남·연인 장면의 노출을 제한했습니다. 만남은 가슴을 덮는 보트넥과 짧은 소매, 트임 없는 빨간 드레스로, 연인은 가슴과 배를 덮도록 여민 흰 셔츠와 흰 반바지로 조정했습니다.

`prompts.json`에는 성공한 결과에 실제 사용한 최종 프롬프트, 참고 이미지, 원본과 결과의 대응 관계를 적었습니다. 참고 경로는 이 폴더 기준 상대 경로입니다. `progress.json`은 완료 목록, `validation.json`은 크기·용량·SHA-256·64픽셀 간격의 알파 표본 검사 결과입니다. 알파 표본의 최댓값은 전체 픽셀의 정확한 최댓값을 뜻하지 않습니다.

릴리 하퍼의 결혼식·배우자 그림은 생성 제한으로 의상을 조정했습니다. 결혼식은 안감이 있는 보트넥 드레스와 짧은 소매, 배우자는 긴소매 크림색 니트 드레스로 표현했습니다.

검수: 74개 파일의 크기·중복 여부와 모든 원본·참고 경로를 확인했습니다. Edge에서 분류별 수량, 검색, 기존 그림 전환, 새 그림 저장 링크, 320·390·1280px 가로 넘침을 검사했고 브라우저 오류가 없었습니다.

## 원본 배경 출처

아래 작품을 참고하여 반실사 스타일로 AI 재작화했습니다. 구도와 장소 디자인을 바탕으로 만든 수정본이며, 원작자의 보증이나 참여를 의미하지 않습니다. 기존 프로젝트의 출처와 라이선스 표기를 이어서 제공합니다.

| 새 파일 | 원본 작품·작가 | 원본 라이선스 |
|---|---|---|
| `bg_classroom.png` | [Classroom 002 — Midnight68](https://opengameart.org/content/classroom-002) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `bg_school.png` | [Anime school background — Homunculus](https://opengameart.org/content/anime-school-background) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `bg_home.png`, `bg_room.png` | [Visual Novel House Backgrounds — Spiral Atlas](https://opengameart.org/content/visual-novel-house-backgrounds) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `bg_office.png` | [Visual Novel Tutorial Set — DasBilligeAlien](https://opengameart.org/content/visual-novel-tutorial-set) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `bg_hall.png` | [Visual Novel Background: Auditorium — frances](https://opengameart.org/content/visual-novel-background-auditorium) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

`bg_stadium`, `bg_street`, `bg_indoor`는 기존 프로젝트의 코드로 그린 배경을 참고했습니다. 인물들은 기존 게임의 가상 캐릭터입니다.
