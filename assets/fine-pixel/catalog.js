const CHARACTERS = [
  {
    "id": "hero_elementary",
    "label": "초등학생 · 미남",
    "group": "주인공",
    "target": "images/hero_elementary.png"
  },
  {
    "id": "hero_elementary_plain",
    "label": "초등학생 · 평범",
    "group": "주인공",
    "target": "images/hero_elementary_plain.png"
  },
  {
    "id": "hero_elementary_ugly",
    "label": "초등학생 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_elementary_ugly.png"
  },
  {
    "id": "hero_middle",
    "label": "중학생 · 미남",
    "group": "주인공",
    "target": "images/hero_middle.png"
  },
  {
    "id": "hero_middle_plain",
    "label": "중학생 · 평범",
    "group": "주인공",
    "target": "images/hero_middle_plain.png"
  },
  {
    "id": "hero_middle_ugly",
    "label": "중학생 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_middle_ugly.png"
  },
  {
    "id": "hero_high",
    "label": "고등학생 · 미남",
    "group": "주인공",
    "target": "images/hero_high.png"
  },
  {
    "id": "hero_high_plain",
    "label": "고등학생 · 평범",
    "group": "주인공",
    "target": "images/hero_high_plain.png"
  },
  {
    "id": "hero_high_ugly",
    "label": "고등학생 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_high_ugly.png"
  },
  {
    "id": "hero_college",
    "label": "대학생 · 미남",
    "group": "주인공",
    "target": "images/hero_college.png"
  },
  {
    "id": "hero_college_plain",
    "label": "대학생 · 평범",
    "group": "주인공",
    "target": "images/hero_college_plain.png"
  },
  {
    "id": "hero_college_ugly",
    "label": "대학생 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_college_ugly.png"
  },
  {
    "id": "hero_pro",
    "label": "프로 선수 · 미남",
    "group": "주인공",
    "target": "images/hero_pro.png"
  },
  {
    "id": "hero_pro_plain",
    "label": "프로 선수 · 평범",
    "group": "주인공",
    "target": "images/hero_pro_plain.png"
  },
  {
    "id": "hero_pro_ugly",
    "label": "프로 선수 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_pro_ugly.png"
  },
  {
    "id": "hero_mlb",
    "label": "메이저리거 · 미남",
    "group": "주인공",
    "target": "images/hero_mlb.png"
  },
  {
    "id": "hero_mlb_plain",
    "label": "메이저리거 · 평범",
    "group": "주인공",
    "target": "images/hero_mlb_plain.png"
  },
  {
    "id": "hero_mlb_ugly",
    "label": "메이저리거 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_mlb_ugly.png"
  },
  {
    "id": "hero_injured",
    "label": "부상 · 미남",
    "group": "주인공",
    "target": "images/hero_injured.png"
  },
  {
    "id": "hero_injured_plain",
    "label": "부상 · 평범",
    "group": "주인공",
    "target": "images/hero_injured_plain.png"
  },
  {
    "id": "hero_injured_ugly",
    "label": "부상 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_injured_ugly.png"
  },
  {
    "id": "hero_slump",
    "label": "슬럼프 · 미남",
    "group": "주인공",
    "target": "images/hero_slump.png"
  },
  {
    "id": "hero_slump_plain",
    "label": "슬럼프 · 평범",
    "group": "주인공",
    "target": "images/hero_slump_plain.png"
  },
  {
    "id": "hero_slump_ugly",
    "label": "슬럼프 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_slump_ugly.png"
  },
  {
    "id": "hero_victory",
    "label": "승리 · 미남",
    "group": "주인공",
    "target": "images/hero_victory.png"
  },
  {
    "id": "hero_victory_plain",
    "label": "승리 · 평범",
    "group": "주인공",
    "target": "images/hero_victory_plain.png"
  },
  {
    "id": "hero_victory_ugly",
    "label": "승리 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_victory_ugly.png"
  },
  {
    "id": "hero_retired",
    "label": "은퇴 · 미남",
    "group": "주인공",
    "target": "images/hero_retired.png"
  },
  {
    "id": "hero_retired_plain",
    "label": "은퇴 · 평범",
    "group": "주인공",
    "target": "images/hero_retired_plain.png"
  },
  {
    "id": "hero_retired_ugly",
    "label": "은퇴 · 외모 1–3",
    "group": "주인공",
    "target": "images/hero_retired_ugly.png"
  },
  {
    "id": "heroine1_meet",
    "label": "윤하나 · 만남",
    "group": "히로인",
    "target": "images/heroine1_meet.png"
  },
  {
    "id": "heroine1_lover",
    "label": "윤하나 · 연인",
    "group": "히로인",
    "target": "images/heroine1_lover.png"
  },
  {
    "id": "heroine1_wedding",
    "label": "윤하나 · 결혼식",
    "group": "히로인",
    "target": "images/heroine1_wedding.png"
  },
  {
    "id": "heroine1_spouse",
    "label": "윤하나 · 배우자",
    "group": "히로인",
    "target": "images/heroine1_spouse.png"
  },
  {
    "id": "heroine2_meet",
    "label": "서지안 · 만남",
    "group": "히로인",
    "target": "images/heroine2_meet.png"
  },
  {
    "id": "heroine2_lover",
    "label": "서지안 · 연인",
    "group": "히로인",
    "target": "images/heroine2_lover.png"
  },
  {
    "id": "heroine2_wedding",
    "label": "서지안 · 결혼식",
    "group": "히로인",
    "target": "images/heroine2_wedding.png"
  },
  {
    "id": "heroine2_spouse",
    "label": "서지안 · 배우자",
    "group": "히로인",
    "target": "images/heroine2_spouse.png"
  },
  {
    "id": "heroine3_meet",
    "label": "한채윤 · 만남",
    "group": "히로인",
    "target": "images/heroine3_meet.png"
  },
  {
    "id": "heroine3_lover",
    "label": "한채윤 · 연인",
    "group": "히로인",
    "target": "images/heroine3_lover.png"
  },
  {
    "id": "heroine3_wedding",
    "label": "한채윤 · 결혼식",
    "group": "히로인",
    "target": "images/heroine3_wedding.png"
  },
  {
    "id": "heroine3_spouse",
    "label": "한채윤 · 배우자",
    "group": "히로인",
    "target": "images/heroine3_spouse.png"
  },
  {
    "id": "heroine4_meet",
    "label": "유하린 · 만남",
    "group": "히로인",
    "target": "images/heroine4_meet.png"
  },
  {
    "id": "heroine4_lover",
    "label": "유하린 · 연인",
    "group": "히로인",
    "target": "images/heroine4_lover.png"
  },
  {
    "id": "heroine4_wedding",
    "label": "유하린 · 결혼식",
    "group": "히로인",
    "target": "images/heroine4_wedding.png"
  },
  {
    "id": "heroine4_spouse",
    "label": "유하린 · 배우자",
    "group": "히로인",
    "target": "images/heroine4_spouse.png"
  },
  {
    "id": "heroine5_meet",
    "label": "최다온 · 만남",
    "group": "히로인",
    "target": "images/heroine5_meet.png"
  },
  {
    "id": "heroine5_lover",
    "label": "최다온 · 연인",
    "group": "히로인",
    "target": "images/heroine5_lover.png"
  },
  {
    "id": "heroine5_wedding",
    "label": "최다온 · 결혼식",
    "group": "히로인",
    "target": "images/heroine5_wedding.png"
  },
  {
    "id": "heroine5_spouse",
    "label": "최다온 · 배우자",
    "group": "히로인",
    "target": "images/heroine5_spouse.png"
  },
  {
    "id": "heroine6_meet",
    "label": "릴리 하퍼 · 만남",
    "group": "히로인",
    "target": "images/heroine6_meet.png"
  },
  {
    "id": "heroine6_lover",
    "label": "릴리 하퍼 · 연인",
    "group": "히로인",
    "target": "images/heroine6_lover.png"
  },
  {
    "id": "heroine6_wedding",
    "label": "릴리 하퍼 · 결혼식",
    "group": "히로인",
    "target": "images/heroine6_wedding.png"
  },
  {
    "id": "heroine6_spouse",
    "label": "릴리 하퍼 · 배우자",
    "group": "히로인",
    "target": "images/heroine6_spouse.png"
  },
  {
    "id": "rival",
    "label": "백도현 · 라이벌",
    "group": "조연",
    "target": "images/rival.png"
  },
  {
    "id": "parents",
    "label": "부모님",
    "group": "조연",
    "target": "images/parents.png"
  },
  {
    "id": "coach_little",
    "label": "오만석 · 리틀야구 감독",
    "group": "조연",
    "target": "images/coach_little.png"
  },
  {
    "id": "coach_high",
    "label": "구태환 · 고교 감독",
    "group": "조연",
    "target": "images/coach_high.png"
  },
  {
    "id": "buddy",
    "label": "장두식 · 단짝",
    "group": "조연",
    "target": "images/buddy.png"
  },
  {
    "id": "manager_pro",
    "label": "마철웅 · 프로 감독",
    "group": "조연",
    "target": "images/manager_pro.png"
  },
  {
    "id": "agent",
    "label": "제이슨 리 · 에이전트",
    "group": "조연",
    "target": "images/agent.png"
  },
  {
    "id": "child",
    "label": "우리 아이",
    "group": "조연",
    "target": "images/child.png"
  },
  {
    "id": "interpreter",
    "label": "송유진 · 통역",
    "group": "조연",
    "target": "images/interpreter.png"
  },
  {
    "id": "mlb_teammate",
    "label": "마커스 벨 · 빅리그 동료",
    "group": "조연",
    "target": "images/mlb_teammate.png"
  },
  {
    "id": "teammate",
    "label": "오재치 · 동료",
    "group": "조연",
    "target": "images/teammate.png"
  },
  {
    "id": "heroine7",
    "label": "한지우 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine7.png"
  },
  {
    "id": "heroine7_lover",
    "label": "한지우 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine7_lover.png"
  },
  {
    "id": "heroine7_wedding",
    "label": "한지우 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine7_wedding.png"
  },
  {
    "id": "heroine7_wife",
    "label": "한지우 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine7_wife.png"
  },
  {
    "id": "heroine8",
    "label": "서미래 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine8.png"
  },
  {
    "id": "heroine8_lover",
    "label": "서미래 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine8_lover.png"
  },
  {
    "id": "heroine8_wedding",
    "label": "서미래 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine8_wedding.png"
  },
  {
    "id": "heroine8_wife",
    "label": "서미래 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine8_wife.png"
  },
  {
    "id": "heroine9",
    "label": "윤채아 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine9.png"
  },
  {
    "id": "heroine9_lover",
    "label": "윤채아 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine9_lover.png"
  },
  {
    "id": "heroine9_wedding",
    "label": "윤채아 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine9_wedding.png"
  },
  {
    "id": "heroine9_wife",
    "label": "윤채아 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine9_wife.png"
  },
  {
    "id": "heroine10",
    "label": "강민서 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine10.png"
  },
  {
    "id": "heroine10_lover",
    "label": "강민서 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine10_lover.png"
  },
  {
    "id": "heroine10_wedding",
    "label": "강민서 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine10_wedding.png"
  },
  {
    "id": "heroine10_wife",
    "label": "강민서 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine10_wife.png"
  },
  {
    "id": "heroine11",
    "label": "백소율 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine11.png"
  },
  {
    "id": "heroine11_lover",
    "label": "백소율 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine11_lover.png"
  },
  {
    "id": "heroine11_wedding",
    "label": "백소율 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine11_wedding.png"
  },
  {
    "id": "heroine11_wife",
    "label": "백소율 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine11_wife.png"
  },
  {
    "id": "heroine12",
    "label": "오하린 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine12.png"
  },
  {
    "id": "heroine12_lover",
    "label": "오하린 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine12_lover.png"
  },
  {
    "id": "heroine12_wedding",
    "label": "오하린 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine12_wedding.png"
  },
  {
    "id": "heroine12_wife",
    "label": "오하린 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine12_wife.png"
  },
  {
    "id": "heroine13",
    "label": "정예린 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine13.png"
  },
  {
    "id": "heroine13_lover",
    "label": "정예린 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine13_lover.png"
  },
  {
    "id": "heroine13_wedding",
    "label": "정예린 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine13_wedding.png"
  },
  {
    "id": "heroine13_wife",
    "label": "정예린 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine13_wife.png"
  },
  {
    "id": "heroine14",
    "label": "에밀리 워커 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine14.png"
  },
  {
    "id": "heroine14_lover",
    "label": "에밀리 워커 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine14_lover.png"
  },
  {
    "id": "heroine14_wedding",
    "label": "에밀리 워커 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine14_wedding.png"
  },
  {
    "id": "heroine14_wife",
    "label": "에밀리 워커 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine14_wife.png"
  },
  {
    "id": "heroine15",
    "label": "제이든 박 · 첫 만남",
    "group": "히로인",
    "new": true,
    "target": "images/heroine15.png"
  },
  {
    "id": "heroine15_lover",
    "label": "제이든 박 · 연인",
    "group": "히로인",
    "new": true,
    "target": "images/heroine15_lover.png"
  },
  {
    "id": "heroine15_wedding",
    "label": "제이든 박 · 결혼식",
    "group": "히로인",
    "new": true,
    "target": "images/heroine15_wedding.png"
  },
  {
    "id": "heroine15_wife",
    "label": "제이든 박 · 배우자",
    "group": "히로인",
    "new": true,
    "target": "images/heroine15_wife.png"
  }
];
