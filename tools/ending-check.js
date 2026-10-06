// node tools/ending-check.js — 엔딩 경계·진로 선택·도감 중복·저장 호환 검사.
const assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const root = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const files = [...read("index.html").matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f));
const store = {}, ctx = { console, Math, JSON, Date, localStorage: {
  getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
} }; ctx.window = ctx; vm.createContext(ctx);
for (const file of files) vm.runInContext(read(file), ctx, { filename: file });
const E = ctx.E, GD = ctx.GD;
assert.equal(GD.기본엔딩.length, 14); assert.equal(GD.진로.length, 10);
function life(score = 500, happy = 75) {
  E.newGame("강민준", "유격수", "수비");
  const s = E.state(); s.성적 = score; s.행복도 = happy; s.나이 = 40; s.연차 = 12;
  s.단계 = "엔딩"; s.시기 = "은퇴"; s.엔딩 = E.computeEnding(); return s;
}
const pairs = [
  [0, "스코어보드 밖의 봄", "아직 쓰지 않은 다음 장"], [149, "스코어보드 밖의 봄", "아직 쓰지 않은 다음 장"],
  [150, "작은 기록의 큰 하루", "벤치에 두고 온 계절"], [399, "작은 기록의 큰 하루", "벤치에 두고 온 계절"],
  [400, "내 몫의 이닝, 내 몫의 행복", "괜찮다는 말의 무게"], [649, "내 몫의 이닝, 내 몫의 행복", "괜찮다는 말의 무게"],
  [549, "내 몫의 이닝, 내 몫의 행복", "괜찮다는 말의 무게"], [550, "내 몫의 이닝, 내 몫의 행복", "괜찮다는 말의 무게"],
  [650, "오래도록 불릴 응원가", "환호가 멎은 라커룸"], [899, "오래도록 불릴 응원가", "환호가 멎은 라커룸"],
  [900, "기록 너머에 남은 미소", "정상에 놓인 빈 의자"], [2000, "기록 너머에 남은 미소", "정상에 놓인 빈 의자"]
];
let checks = 0;
for (const [score, high, low] of pairs) {
  for (const [happy, expected] of [[70, high], [100, high], [0, low], [39, low]]) {
    const s = life(score, happy);
    assert.equal(s.엔딩.기본.이름, expected);
    assert.equal(GD.기본엔딩.filter(e => e.조건 && E.check(e.조건)).length, 1);
    assert.ok(!/\{.+?\}/.test(E.tpl(s.엔딩.기본.내용))); checks++;
  }
  for (const happy of [40, 64, 65, 69]) {
    const s = life(score, happy);
    assert.equal(s.엔딩.기본.성적, score >= 550 ? "높음" : "낮음");
    assert.equal(s.엔딩.기본.행복도, happy >= 65 ? "높음" : "낮음"); checks++;
  }
}
const initial = life(); initial.단계 = "카드";
assert.equal(E.chooseCareer("작가"), false); initial.단계 = "엔딩";
assert.equal(E.chooseCareer("없는진로"), false); assert.equal(initial.진로확정, undefined);
const expectedJobs = ["코치", "해설가", "스카우트", "야구장 밖의 인생", "전력분석가", "유소년 야구 교실 운영자", "구단 프런트", "선수 에이전트", "스포츠 작가", "야구 크리에이터"];
for (const [index, c] of GD.진로.entries()) {
  const s = life(); s.플래그.진로_자유 = true; s.플래그.육성출신 = true;
  const countsBefore = E.collection().인생수;
  E.recordLife();
  const before = JSON.stringify({ score: s.성적, happy: s.행복도, money: s.돈, stats: s.능력치, base: s.엔딩.기본 });
  assert.equal(E.chooseCareer(c.아이디), true);
  assert.equal(s.엔딩.직업.이름, expectedJobs[index]);
  assert.equal(s.진로확정, c.아이디); assert.equal(s.플래그[c.플래그], true);
  assert.equal(Object.keys(s.플래그).filter(k => k.startsWith("진로_")).length, 1);
  assert.equal(s.플래그.육성출신, true);
  assert.equal(JSON.stringify({ score: s.성적, happy: s.행복도, money: s.돈, stats: s.능력치, base: s.엔딩.기본 }), before);
  assert.equal(E.collection().인생수, countsBefore + 1);
  const collection = JSON.stringify(E.collection());
  E.recordLife(); assert.equal(E.chooseCareer(c.아이디), false);
  assert.equal(E.chooseCareer("지도자"), false); assert.equal(JSON.stringify(E.collection()), collection);
  E.save(); const saved = JSON.stringify(s); assert.ok(E.load()); assert.equal(JSON.stringify(E.state()), saved);
  assert.equal(E.chooseCareer("작가"), false); assert.equal(JSON.stringify(E.collection()), collection);
}
for (const [id, job] of [["지도자", "명장 감독"], ["해설가", "인기 해설가"]]) {
  const s = life(); s.능력치.멘탈 = 80; s.능력치.인기 = 80;
  assert.ok(E.chooseCareer(id)); assert.equal(s.엔딩.직업.이름, job);
}
// 이미 도감에 기록된 이전 버전의 엔딩에서도 기존 인생 유형을 바꾸거나 인생 수를 늘리지 않습니다.
const old = life(); old.엔딩.기본 = GD.기본엔딩.find(e => e.이름 === "행복한 소시민"); E.recordLife();
const count = E.collection().인생수;
assert.ok(E.chooseCareer("프런트"));
assert.equal(old.엔딩.기본.이름, "행복한 소시민"); assert.equal(E.collection().인생수, count);
assert.ok(E.collection().엔딩["직업:구단 프런트"]);
console.log(`PASS: 엔딩 경계 ${checks}건 / 14종 인생 유형 / 진로 10종·승격 2종 / 중복 방지·저장·이전 엔딩 호환`);
