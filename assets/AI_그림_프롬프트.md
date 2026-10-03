# AI 그림 프롬프트 목록 (Grok Imagine용)

게임의 인물 그림 36장을 같은 그림체로 다시 만들기 위한 프롬프트입니다.
각 회색 상자 오른쪽 위의 복사 버튼을 눌러 Grok에 그대로 붙여 넣으면 됩니다.

## 만드는 순서 (얼굴과 그림체를 맞추는 방법)

1. **기준 그림 먼저**: `hero_high`(주인공)와 히로인 5명의 `_meet` 그림을 먼저 만듭니다. 마음에 드는 얼굴이 나올 때까지 다시 뽑으세요.
2. **참고 그림으로 이어 그리기**: 나머지 그림은 기준 그림을 Grok에 **참고 그림으로 올린 뒤** 프롬프트를 붙여 넣습니다. (프롬프트에 "uploaded reference image" 문구가 있는 것들)
   - 주인공 그림 → `hero_high` 를 올림
   - 히로인 `_lover`, `_spouse` → 그 히로인의 `_meet` 을 올림
   - 조연 → 그림체를 맞추기 위해 `hero_high` 를 올림 (얼굴은 따라 하지 않도록 프롬프트에 적혀 있음)
3. **비율**: 세로 **2:3**을 고르세요. 없으면 가장 비슷한 세로 비율(3:4 등)도 괜찮습니다.
4. **배경**: 초록 단색 배경으로 만들어 주세요. 제가 나중에 지워서 게임 배경(교실·거실 등)이 비치게 합니다. 배경이 초록이 아니면 "Make the background a solid flat green (#00B140)" 라고 다시 요청하세요.
5. **저장 · 올리기**: 아래 제목의 파일 이름(예: `hero_high.png`)으로 저장해 `assets/raw/` 폴더에 올려 주세요. 나눠서 올려도 됩니다.

> 실존 인물·실제 구단 로고·글자가 들어가지 않게 프롬프트에 적어 두었습니다. 혹시 글자나 로고가 생기면 다시 뽑아 주세요.

---

## 1. 주인공 (10장)

### hero_high — 고등학생 주인공 ⭐ 기준 그림 (가장 먼저)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. A 17-year-old Korean high school baseball player with short black hair, friendly determined eyes and slightly tanned skin. He wears a white high school baseball uniform with dark green trim and a dark green cap, dirt stains on his pants, holding a leather baseball glove at his side with a confident smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_elementary — 10살 리틀야구 시절
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, but as a 10-year-old boy: keep the same face shape, eyes and hair color, same art style. He wears a white little league baseball uniform with navy trim and a slightly oversized navy cap, holding a small glove, big gap-toothed grin, full of excitement. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_middle — 중학교 야구부
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, but as a 14-year-old boy: keep the same face, eyes and hair, same art style. He wears a light gray middle school baseball uniform with blue trim and a blue cap, holding a baseball bat on his shoulder, eager and serious expression. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_college — 대학 야구부
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, now a 21-year-old university baseball player: keep the same face and hair, same art style, more mature and athletic. He wears a gray college baseball uniform with maroon trim and a maroon cap, tossing a baseball in one hand, calm confident look. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_pro — 프로 선수
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, now a 27-year-old professional baseball player: keep the same face and hair, same art style, strong athletic build. He wears a white professional baseball uniform with navy pinstripes and a navy cap, glove under his arm, calm and confident professional expression. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_mlb — 메이저리그 선수
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, now a 30-year-old major league baseball player: keep the same face and hair, same art style. He wears a gray road baseball uniform with red trim and a red cap, looking ahead with ambition and a small determined smile, glove in hand. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_injured — 부상
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, as a 27-year-old professional baseball player: keep the same face and hair, same art style. He wears a white pro uniform with navy pinstripes, his right arm in a sling and an ice pack strapped to his shoulder, wincing in pain but with a resolute look. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_slump — 슬럼프
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, as a 27-year-old professional baseball player: keep the same face and hair, same art style. He wears a white pro uniform with navy pinstripes, a white towel draped over his head, shoulders slumped, holding a bat loosely, frustrated and dejected expression. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_victory — 승리의 순간
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, as a 27-year-old professional baseball player: keep the same face and hair, same art style. He wears a white pro uniform with navy pinstripes, pumping his fist in the air and shouting with joy, cap slightly askew, dynamic triumphant pose. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_retired — 은퇴 후
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same person as in the uploaded reference image, now a 40-year-old retired baseball legend: keep the same face, add a few gray streaks in his hair and gentle smile lines, same art style. He wears a dark navy suit and tie, holding an old signed baseball in one hand, proud and peaceful smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

---

## 2. 히로인 (15장)

### heroine1_meet — 윤하나 (소꿉친구, 고교 동창) ⭐ 기준 그림
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. A cheerful 17-year-old Korean girl with a high brown ponytail, bright round eyes and a friendly tomboyish smile. She wears a Korean high school uniform: navy blazer, white shirt, red ribbon tie, gray plaid skirt. She waves one hand and holds a carton of banana milk in the other, as if waiting for a friend after practice. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine1_lover — 윤하나 (연인)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same girl as in the uploaded reference image, now about 22 years old: keep the exact same face and brown ponytail, same art style. She wears a casual date outfit, light denim jacket over a white T-shirt and a yellow skirt, laughing happily with her hands behind her back, a little shy. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine1_spouse — 윤하나 (배우자)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image, now about 28 years old: keep the exact same face, brown hair in an elegant updo, same art style. She wears a simple white wedding dress with a short veil, holding a small bouquet of yellow flowers, smiling brightly with happy tears in her eyes. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine2_meet — 서지안 (스포츠 기자) ⭐ 기준 그림
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. A confident 26-year-old Korean woman, a sports newspaper reporter, with sleek shoulder-length black bob hair and sharp intelligent eyes. She wears a navy blazer over a white blouse with a press ID lanyard (blank card), holding a small notebook and a voice recorder, a sly challenging smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine2_lover — 서지안 (연인)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image: keep the exact same face and black bob hair, same art style. Off duty, she wears a beige trench coat over a soft knit top, holding two coffee cups, a relaxed warm smile she only shows to him. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine2_spouse — 서지안 (배우자)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image, a few years older: keep the exact same face and black bob hair, same art style. She wears a sleek modern white wedding dress with clean lines and a long veil, holding a bouquet of white roses, confident and moved smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine3_meet — 한채윤 (물리치료사) ⭐ 기준 그림
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. A calm and gentle 25-year-old Korean woman, a sports physical therapist, with long dark hair tied in a low ponytail and soft kind eyes. She wears a navy polo shirt with a blank name badge and black trousers, holding a roll of athletic tape and an ice pack, a gentle but firm smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine3_lover — 한채윤 (연인)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image: keep the exact same face, long dark hair now down, same art style. She wears a soft cream cardigan over a light blue dress, holding a small lunch box wrapped in cloth, smiling shyly. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine3_spouse — 한채윤 (배우자)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image, a few years older: keep the exact same face and long dark hair, same art style. She wears a classic white lace wedding dress with a long veil, holding a bouquet of pale pink flowers, serene loving smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine4_meet — 유하린 (학교의 대표 미인) ⭐ 기준 그림
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. A strikingly beautiful 18-year-old Korean girl, the most popular girl at school, with long wavy light-brown hair and an elegant, aloof expression. She wears a stylish cream knit sweater and a dark plaid skirt, arms crossed, one eyebrow slightly raised, wrinkling her nose a little as if saying "you smell like sweat". Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine4_lover — 유하린 (연인)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same girl as in the uploaded reference image, now about 21 years old: keep the exact same face and long wavy light-brown hair, same art style. She wears a fashionable date outfit, holding up a handmade cheering sign decorated with a big heart and a baseball drawing (no letters), smiling openly and warmly. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine4_spouse — 유하린 (배우자)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image, a few years older: keep the exact same face and long wavy light-brown hair, same art style. She wears a glamorous white off-shoulder wedding dress with a cathedral veil, holding a large bouquet, radiant happy smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine5_meet — 최다온 (시비 거는 학급반장) ⭐ 기준 그림
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. A 17-year-old Korean girl, the strict class president, with neat black hair in a short bob with straight bangs and thin round glasses, a stern but cute look. She wears a Korean high school uniform (navy blazer, white shirt, red ribbon, gray plaid skirt) with a plain red armband, holding a clipboard and pointing at the viewer as if scolding, slightly blushing. Single character, knees-up shot, centered, facing the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine5_lover — 최다온 (연인)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same girl as in the uploaded reference image, now about 22 years old: keep the exact same face, black bob hair and round glasses, same art style. She wears a neat white blouse with a light gray cardigan, pushing up her glasses with one finger while looking away and blushing, a tsundere expression. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine5_spouse — 최다온 (배우자)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Same woman as in the uploaded reference image, a few years older: keep the exact same face, black hair and round glasses, same art style. She wears a neat elegant white wedding dress with a short veil, holding a small notebook and a bouquet together, an embarrassed but very happy smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

---

## 3. 조연 (11장)

조연은 그림체를 맞추기 위해 `hero_high` 그림을 참고 그림으로 올린 뒤 만드세요.

### rival — 백도윤 (평생의 라이벌)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A cocky 18-year-old Korean ace baseball player, the hero's lifelong rival, with spiky dark brown hair and sharp narrow eyes, a confident smirk. He wears a black and red rival team baseball uniform and cap, tossing a baseball in one hand. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### parents — 부모님
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A warm Korean couple in their mid-40s standing side by side: the father in a plain work jacket with a proud gentle smile, the mother in a cardigan holding a lunch box, both cheering supportively. Knees-up shot, centered, full heads visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### coach_little — 오만석 감독 (리틀야구 감독)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A kind but strict Korean little league coach in his 50s, sun-tanned face, short graying hair, wearing a navy tracksuit and a cap, a whistle around his neck, holding a fungo bat, warm encouraging grin. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### coach_high — 구태환 감독 (고교 감독)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A stern Korean high school baseball manager in his 50s with a square jaw and thick eyebrows, wearing a dark green team windbreaker and cap, arms crossed, intimidating but fair look. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### buddy — 장두식 (단짝 친구)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. The hero's best friend, a cheerful slightly chubby 18-year-old Korean guy with a round face and messy short hair, wearing a gray hoodie and a backpack, giving a big thumbs-up with a goofy loyal grin. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### manager_pro — 마철웅 감독 (프로팀 감독)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A legendary Korean professional baseball manager in his 60s with gray hair and a weathered face, wearing a navy team jacket over a pinstripe uniform and a navy cap, arms folded, calm commanding gaze. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### agent — 제이슨 리 (에이전트)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A slick Korean-American sports agent in his 40s with neatly slicked-back hair, wearing a sharp charcoal suit with no tie, holding a smartphone and a contract folder, a confident deal-making smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### child — 우리 아이
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. An adorable 6-year-old Korean child wearing a tiny baseball uniform and an oversized cap, holding a toy glove up high, beaming with pride like the biggest fan. Single character, full body, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### interpreter — 송유진 (구단 통역)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A friendly professional Korean woman in her late 20s, the team interpreter, with a neat low bun, wearing a navy team polo shirt and a lanyard with a blank ID card, holding a tablet, bright helpful smile. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### mlb_teammate — 마커스 벨 (빅리그 동료)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A big, friendly African-American major league baseball player around 30 with a short beard, wearing a gray road baseball uniform with red trim and a red cap, offering a fist bump with a huge welcoming grin. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### teammate — 오재치 (팀의 분위기 메이커)
```
Korean webtoon-style character illustration, clean confident line art, soft cel shading, warm natural colors. Match only the art style of the uploaded reference image, not the person. A goofy Korean professional baseball player in his late 20s, the team's mood maker, with a buzz cut and expressive eyebrows, wearing a white pro uniform with navy pinstripes, making a silly face and a playful V-sign, cap on backwards. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

---

## 다 만든 뒤

- `assets/raw/`에 올리고 알려 주시면, 초록 배경을 지우고 800×1200으로 맞춰 `images/`의 같은 이름 그림과 바꿔 넣습니다.
- 일부만 만들어도 괜찮습니다. 없는 그림은 지금 그림이 그대로 쓰입니다.
- 새 인물을 추가할 때도 위 형식(맨 앞 그림체 문구 + 인물 설명 + 맨 뒤 배경·글자 금지 문구)을 그대로 쓰면 그림체가 맞습니다.
