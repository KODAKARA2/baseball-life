# AI 그림 프롬프트 목록 (2D 픽셀 · Grok Imagine)

게임의 인물 그림 61장(주인공 10 + 외모별 20, 히로인 20, 조연 11)을 만든 프롬프트입니다.
xAI 이미지 API(`grok-imagine-image-2.0`, 세로 2:3, 1k, low)로 만들었고, Grok 앱에 그대로 붙여 넣어도 됩니다.

## 만드는 순서
1. **기준 그림 먼저**: `hero_high`와 히로인 5명의 `_meet`을 먼저 만들어 확정합니다.
2. **참고 그림**: "참고 그림"이 적힌 프롬프트는 그 그림을 참고 그림으로 넣고 만듭니다. 그래야 얼굴이 유지됩니다.
3. **배경**: 초록 단색 배경으로 만든 뒤, 배경을 지우고 200 × 300 픽셀로 맞춰 `images/`에 넣습니다.
4. **히로인은 4장**: 만남 → 연인 → 결혼식(결혼하는 장면에만) → 배우자(결혼 후 계속 쓰이는 성숙한 모습).

새 인물을 추가할 때도 맨 앞의 그림체 문구와 맨 뒤의 배경·글자 금지 문구를 그대로 쓰면 그림체가 맞습니다.

---

## 1. 주인공 (10장)

### hero_high — 고등학생 주인공 ⭐ 기준 그림 (가장 먼저)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A 17-year-old Korean high school baseball player with short black hair, friendly determined eyes and slightly tanned skin. He wears a white high school baseball uniform with dark green trim and a dark green cap, dirt stains on his pants, holding a leather baseball glove at his side with a confident smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_elementary — 10살 리틀야구 시절
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A small 10-year-old Korean boy with clear child proportions: short and slim, big head, round childish face with chubby cheeks, short black hair, friendly determined eyes, slightly tanned skin. He wears a white little league baseball uniform with navy trim and a slightly oversized navy cap that sits low on his head, holding a small glove, big gap-toothed grin, full of excitement. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_middle — 중학교 야구부
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 14-year-old boy, keep the same face, eyes and short black hair, same pixel art style. He wears a light gray middle school baseball uniform with blue trim and a blue cap, holding a baseball bat on his shoulder, eager and serious expression. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_college — 대학 야구부
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 21-year-old university baseball player, keep the same face and short black hair, same pixel art style, more mature and athletic. He wears a gray college baseball uniform with maroon trim and a maroon cap, tossing a baseball in one hand, calm confident look. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_pro — 프로 선수
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 27-year-old professional baseball player, keep the same face and short black hair, same pixel art style, strong athletic build. He wears a white professional baseball uniform with navy pinstripes and a navy cap, glove under his arm, calm and confident expression. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_mlb — 메이저리그 선수
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 30-year-old major league baseball player, keep the same face and short black hair, same pixel art style. He wears a gray road baseball uniform with red trim and a red cap, glove in hand, ambitious determined smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_injured — 부상
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 27-year-old professional baseball player, keep the same face and short black hair, same pixel art style. He wears a white pro uniform with navy pinstripes, his right arm in a sling and an ice pack strapped to his shoulder, wincing in pain but with a resolute look. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_slump — 슬럼프
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 27-year-old professional baseball player, keep the same face and short black hair, same pixel art style. He wears a white pro uniform with navy pinstripes, a white towel draped over his head, shoulders slumped, holding a bat loosely, frustrated and dejected expression. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_victory — 승리의 순간
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 27-year-old professional baseball player, keep the same face and short black hair, same pixel art style. He wears a white pro uniform with navy pinstripes, pumping his fist in the air and shouting with joy, cap slightly askew, triumphant pose. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_retired — 은퇴 후
참고 그림: `hero_high`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now a 40-year-old retired baseball legend, keep the same face with a few gray streaks in his short black hair and gentle smile lines, same pixel art style. He wears a dark navy suit and tie, holding an old signed baseball in one hand, proud and peaceful smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

---

## 1-1. 주인공 외모별 (20장)

기본 주인공 그림은 미남(외모 8~10)입니다. 같은 이름에 `_plain`(평범, 외모 4~7)·`_ugly`(추남, 외모 1~3)를 붙인 그림을 만들면 외모 레벨에 맞춰 자동으로 나옵니다.

1. **기준 얼굴 먼저**: `hero_high_plain`·`hero_high_ugly`를 `hero_high` 원본(`assets/ai_raw/hero_high.jpg`)을 참고 그림으로 넣고 만듭니다.
2. **나머지 시기**: 참고 그림 2장을 넣습니다. 첫째는 그 시기의 미남 원본(옷·자세 유지), 둘째는 기준 얼굴(`hero_high_plain.jpg` 또는 `hero_high_ugly.jpg`).
   예: `python tools/ai/xai.py hero_pro_ugly 프롬프트.txt assets/ai_raw/hero_pro.jpg assets/ai_raw/hero_high_ugly.jpg`
3. 배경 초록이 진하게 나오면 모자·줄무늬까지 지워지므로, 프롬프트 끝의 "밝은 초록 배경" 문구를 꼭 넣습니다.

### hero_high_plain — 평범 기준 얼굴
참고 그림: `hero_high` (원본 jpg)

```
Detailed 2D pixel art character sprite, same pixel art style as the uploaded reference image. Keep the exact same outfit with the dark green cap and dark green trim, the same pose, the same glove and the same framing. Only replace the face and head: he is NOT handsome anymore, he is a completely average-looking ordinary Korean teenage boy. Small narrow single-lidded eyes, a wide flat nose, a broad round face with a heavier jaw, thin eyebrows, slightly dull skin, short plain buzz-cut black hair, a neutral mild expression with a small polite smile. Clearly less attractive than the reference, an unremarkable everyday face. Keep the background exactly the same bright vivid chroma-key green (#00B140) as the reference, clearly lighter and brighter than the dark green cap and trim, no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### hero_high_ugly — 추남 기준 얼굴
참고 그림: `hero_high` (원본 jpg)

```
Detailed 2D pixel art character sprite, same pixel art style as the uploaded reference image. Keep the exact same outfit with the dark green cap and dark green trim, the same pose, the same glove and the same framing. Only replace the face and head and make him a little chubby: a comically homely, lovable goofy-looking Korean teenage boy. Tiny beady eyes wide open, thick bushy unibrow, a big round red nose, a wide flat face with chubby cheeks and a few pimples, prominent buck teeth in an awkward grin, messy bowl-cut black hair sticking out under the cap. Funny and endearing, not scary or gross. Keep the background exactly the same bright vivid chroma-key green (#00B140) as the reference, clearly lighter and brighter than the dark green cap and trim, no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### 나머지 시기 (평범 예: hero_pro_plain)
참고 그림: `hero_pro` 원본, `hero_high_plain`. 나이 문구(`a 27-year-old version`)만 시기에 맞게 바꿉니다. (초등: `a small 10-year-old child version (child proportions, big head, chubby cheeks)`, 중학 14, 대학 21, 프로·부상·슬럼프·승리 27, 메이저 30, 은퇴 `a 40-year-old version with a few gray streaks in the hair and smile lines`)

```
Detailed 2D pixel art character sprite, same pixel art style as the uploaded references. Keep EVERYTHING from the FIRST reference image exactly: the same outfit, cap, props, pose, expression mood, framing and age. Only replace the face and hair with the plain, average-looking face of the boy in the SECOND reference image, shown as a 27-year-old version: small narrow single-lidded eyes, a wide flat nose, a broad round face, thin eyebrows, short plain buzz-cut black hair. Clearly not handsome, an unremarkable everyday face. Keep the background exactly the same bright vivid chroma-key green (#00B140) as the first reference, clearly brighter than any dark green clothing, no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### 나머지 시기 (추남 예: hero_pro_ugly)
참고 그림: `hero_pro` 원본, `hero_high_ugly`

```
Detailed 2D pixel art character sprite, same pixel art style as the uploaded references. Keep EVERYTHING from the FIRST reference image exactly: the same outfit, cap, props, pose, expression mood, framing and age. Only replace the face and hair with the comically homely, goofy face of the boy in the SECOND reference image, shown as a 27-year-old version, and make the body a little chubby: tiny beady eyes, thick bushy unibrow, a big round red nose, chubby cheeks with a few pimples, prominent buck teeth, messy bowl-cut black hair. Funny and endearing, not scary or gross. Keep the background exactly the same bright vivid chroma-key green (#00B140) as the first reference, clearly brighter than any dark green clothing, no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

---

## 2. 히로인 (20장)

#### 히로인 1 — 윤하나 (소꿉친구)

### heroine1_meet — 만남 ⭐ 기준 그림
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A cheerful 17-year-old Korean girl with a high brown ponytail, bright round eyes and a friendly tomboyish smile. She wears a Korean high school uniform: navy blazer, white shirt, red ribbon tie, gray plaid skirt. She waves one hand and holds a carton of banana milk in the other, as if waiting for a friend after practice. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine1_lover — 연인
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same girl as in the uploaded reference image, now about 22 years old: keep the exact same face and brown ponytail, same pixel art style. She wears a casual date outfit, light denim jacket over a white T-shirt and a yellow skirt, laughing happily with her hands behind her back, a little shy. Single character, knees-up shot, centered, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine1_wedding — 결혼식 (결혼하는 장면에만)
참고 그림: `heroine1_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now about 28 years old, keep the exact same face, brown hair in an elegant updo, same pixel art style. She wears a simple white wedding dress with a short veil, holding a small bouquet of yellow flowers, smiling brightly with happy tears. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine1_spouse — 배우자 (결혼 후 계속)
참고 그림: `heroine1_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now about 33 years old, a warm and mature wife and mother, keep the exact same face, brown hair in a relaxed low ponytail, same pixel art style. She wears a comfortable cardigan over a striped shirt and jeans, a wedding ring on her finger, holding a cheering towel (no letters), gentle confident smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

#### 히로인 2 — 서지안 (스포츠 기자)

### heroine2_meet — 만남 ⭐ 기준 그림
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A confident 26-year-old Korean woman, a sports newspaper reporter, with sleek shoulder-length black bob hair and sharp intelligent eyes. She wears a navy blazer over a white blouse with a press ID lanyard (blank card), holding a small notebook and a voice recorder, a sly challenging smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine2_lover — 연인
참고 그림: `heroine2_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: keep the exact same face and black bob hair, same pixel art style. Off duty, she wears a beige trench coat over a soft knit top, holding two coffee cups, a relaxed warm smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine2_wedding — 결혼식 (결혼하는 장면에만)
참고 그림: `heroine2_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: a few years older, keep the exact same face and black bob hair, same pixel art style. She wears a sleek modern white wedding dress with clean lines and a long veil, holding a bouquet of white roses, confident and moved smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine2_spouse — 배우자 (결혼 후 계속)
참고 그림: `heroine2_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now about 34 years old, mature and elegant, keep the exact same face, black bob hair slightly longer, same pixel art style. She wears a smart beige blazer and slacks, a wedding ring visible, holding a tablet and a coffee, warm confident smile like a senior sports editor. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

#### 히로인 3 — 한채윤 (물리치료사)

### heroine3_meet — 만남 ⭐ 기준 그림
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A calm and gentle 25-year-old Korean woman, a sports physical therapist, with long dark hair tied in a low ponytail and soft kind eyes. She wears a navy polo shirt with a blank name badge and black trousers, holding a roll of athletic tape and an ice pack, a gentle but firm smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine3_lover — 연인
참고 그림: `heroine3_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: keep the exact same face, long dark hair now down, same pixel art style. She wears a soft cream cardigan over a light blue dress, holding a small lunch box wrapped in cloth, smiling shyly. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine3_wedding — 결혼식 (결혼하는 장면에만)
참고 그림: `heroine3_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: a few years older, keep the exact same face and long dark hair, same pixel art style. She wears a classic white lace wedding dress with a long veil, holding a bouquet of pale pink flowers, serene loving smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine3_spouse — 배우자 (결혼 후 계속)
참고 그림: `heroine3_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now about 33 years old, calm and mature, keep the exact same face, long dark hair in a loose braid over one shoulder, same pixel art style. She wears a soft knit sweater and a long skirt, a wedding ring visible, holding a warm mug, gentle reassuring smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

#### 히로인 4 — 유하린 (학교의 대표 미인)

### heroine4_meet — 만남 ⭐ 기준 그림
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A strikingly beautiful 18-year-old Korean girl, the most popular girl at school, with long wavy light-brown hair and an elegant, aloof expression. She wears a stylish cream knit sweater and a dark plaid skirt, arms crossed, one eyebrow slightly raised, wrinkling her nose a little. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine4_lover — 연인
참고 그림: `heroine4_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now about 21 years old, keep the exact same face and long wavy light-brown hair, same pixel art style. She wears a fashionable date outfit, holding up a handmade cheering sign decorated with a big heart and a baseball drawing (no letters), smiling openly and warmly. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine4_wedding — 결혼식 (결혼하는 장면에만)
참고 그림: `heroine4_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: a few years older, keep the exact same face and long wavy light-brown hair, same pixel art style. She wears a glamorous white off-shoulder wedding dress with a cathedral veil, holding a large bouquet, radiant happy smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine4_spouse — 배우자 (결혼 후 계속)
참고 그림: `heroine4_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: now about 32 years old, elegant and mature, keep the exact same face and long wavy light-brown hair, same pixel art style. She wears a chic trench coat over a simple dress, a wedding ring visible, holding a handmade cheering sign with a heart (no letters), warm proud smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

#### 히로인 5 — 최다온 (학급반장)

### heroine5_meet — 만남 ⭐ 기준 그림
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A 17-year-old Korean girl, the strict class president, with neat black hair in a short bob with straight bangs and thin round glasses, a stern but cute look. She wears a Korean high school uniform (navy blazer, white shirt, red ribbon, gray plaid skirt) with a plain red armband, holding a clipboard and pointing at the viewer as if scolding, slightly blushing. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine5_lover — 연인
참고 그림: `heroine5_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same girl as in the uploaded reference image, now about 22 years old: keep the exact same face, black bob hair and round glasses, same pixel art style. Change her outfit completely, she is NOT wearing a school uniform: a neat white blouse with a light gray cardigan and a navy A-line skirt, no ribbon, no blazer, no clipboard. She pushes up her glasses with one finger while looking away and blushing, a tsundere expression. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine5_wedding — 결혼식 (결혼하는 장면에만)
참고 그림: `heroine5_meet`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same person as in the uploaded reference image: a few years older, keep the exact same face, black hair and round glasses, same pixel art style. She wears a neat elegant white wedding dress with a short veil, holding a small notebook and a bouquet together, an embarrassed but very happy smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### heroine5_spouse — 배우자 (결혼 후 계속)
참고 그림: `heroine5_wedding`

```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. Same woman as in the uploaded reference image, now about 32 years old and mature: keep the exact same face, round glasses and black hair, now shoulder-length, same pixel art style. Change her outfit completely, NOT a school uniform and NOT a wedding dress: a soft beige knit sweater over a white collared shirt and a long navy skirt, a wedding ring visible on her hand, holding a household account book and a pen, pretending to be stern but smiling softly. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

---

## 3. 조연 (11장)

### rival — 백도윤 (평생의 라이벌)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A cocky 18-year-old Korean ace baseball player, the hero's lifelong rival, with spiky dark brown hair and sharp narrow eyes, a confident smirk. He wears a black and red rival team baseball uniform and cap, tossing a baseball in one hand. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### parents — 부모님
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A warm Korean couple in their mid-40s standing side by side: the father in a plain work jacket with a proud gentle smile, the mother in a cardigan holding a lunch box, both cheering supportively. Two characters, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### coach_little — 오만석 감독 (리틀야구)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A kind but strict Korean little league coach in his 50s, sun-tanned face, short graying hair, wearing a navy tracksuit and a cap, a whistle around his neck, holding a fungo bat, warm encouraging grin. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### coach_high — 구태환 감독 (고교)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A stern Korean high school baseball manager in his 50s with a square jaw and thick eyebrows, wearing a dark green team windbreaker and cap, arms crossed, intimidating but fair look. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### buddy — 장두식 (단짝 친구)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. The hero's best friend, a cheerful slightly chubby 18-year-old Korean guy with a round face and messy short hair, wearing a gray hoodie and a backpack, giving a big thumbs-up with a goofy loyal grin. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### manager_pro — 마철웅 감독 (프로)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A legendary Korean professional baseball manager in his 60s with gray hair and a weathered face, wearing a navy team jacket over a pinstripe uniform and a navy cap, arms folded, calm commanding gaze. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### agent — 제이슨 리 (에이전트)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A slick Korean-American sports agent in his 40s with neatly slicked-back hair, wearing a sharp charcoal suit with no tie, holding a smartphone and a contract folder, a confident deal-making smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### child — 우리 아이
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. An adorable 6-year-old Korean child wearing a tiny baseball uniform and an oversized cap, holding a toy glove up high, beaming with pride like the biggest fan. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### interpreter — 송유진 (구단 통역)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A friendly professional Korean woman in her late 20s, the team interpreter, with a neat low bun, wearing a navy team polo shirt and a lanyard with a blank ID card, holding a tablet, bright helpful smile. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### mlb_teammate — 마커스 벨 (빅리그 동료)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A big, friendly African-American major league baseball player around 30 with a short beard, wearing a gray road baseball uniform with red trim and a red cap, offering a fist bump with a huge welcoming grin. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```

### teammate — 오재치 (분위기 메이커)
```
Detailed 2D pixel art character sprite in a modern indie visual-novel style, crisp hard-edged square pixels, limited color palette, clean dark outlines, no blur, no anti-aliasing. A goofy Korean professional baseball player in his late 20s, the team's mood maker, with a buzz cut and expressive eyebrows, wearing a white pro uniform with navy pinstripes, making a silly face and a playful V-sign, cap on backwards. Single character, knees-up shot, centered, facing slightly toward the viewer, full head visible with a little space above. Plain flat solid green background (#00B140), no shadow, no scenery. No text, no letters, no numbers, no logos. Vertical 2:3.
```
