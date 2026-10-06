// node tools/date-check.js — 새 데이트의 등장 조건, 모든 선택 결과, 비용, 저장 확인.
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const files = [...read("index.html").matchAll(/src="([^"]+\.js)"/g)]
  .map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f));
const store = {};
let seed = 42;
const math = Object.create(Math);
math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const ctx = { console, Math: math, JSON, Date, localStorage: {
  getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
} };
ctx.window = ctx; vm.createContext(ctx);
for (const file of files) vm.runInContext(read(file), ctx, { filename: file });
const added = [];
vm.runInNewContext(read("data/heroines/date_variety.js"), { 카드: (...cards) => added.push(...cards) });
const E = ctx.E, I = E._internal;
assert.equal(added.length, 20);
assert.equal(added.reduce((sum, c) => sum + c.선택지.length, 0), 60);

function setup(title, pos = "유격수") {
  E.newGame("데이트검증", pos, pos === "유격수" ? "수비" : "제구력");
  const source = added.find(c => c.제목 === title);
  const stage = source.시기 === "메이저리그" ? "메이저리그" : "프로";
  E.enterStage(stage);
  I.attachHeroine(source.히로인 === "누구나" ? "heroine1" : source.히로인);
  const s = E.state();
  s.나이 = 26; s.히로인.애정도 = 40;
  s.히로인.관계 = source.조건.관계 === "배우자" ? "배우자" : "연인";
  s.플래그 = source.조건.플래그 === "장거리" ? { 장거리: true } : {};
  s.돈 = 100; s.행복도 = 40; s.능력치.컨디션 = 60; s.능력치.멘탈 = 40;
  s.단계 = "카드"; s.대기열 = []; s.총턴 = 100;
  const card = I.CARDS().find(c => c.제목 === title);
  s.현재카드 = card; E.refreshOptions();
  return { s, card };
}

let outcomes = 0;
for (const source of added) {
  let { s, card } = setup(source.제목);
  assert.equal(I.CARDS().filter(c => c.제목 === source.제목).length, 1, "중복 제목");
  assert.ok(I.eligible(card), source.제목 + " 등장 불가");
  assert.ok(!/\{.+?\}/.test(E.tpl(card.내용)), "본문 치환 누락");
  // 같은 카드를 연속으로 뽑지 않고, 간격을 채우면 다시 뽑을 수 있습니다.
  s.본카드[card._id] = s.총턴;
  s.총턴 += card.간격 - 1; assert.equal(I.eligible(card), false);
  s.총턴++; assert.equal(I.eligible(card), true);
  delete s.본카드[card._id];
  s.플래그.외국인작별 = true; assert.equal(I.eligible(card), false);
  delete s.플래그.외국인작별;
  s.플래그.장거리 = !s.플래그.장거리;
  assert.equal(I.eligible(card), false, source.제목 + " 장거리 조건 오류");
  s.히로인 = null; assert.equal(I.eligible(card), false);

  ({ s, card } = setup(source.제목));
  s.돈 = 0; E.refreshOptions();
  assert.ok(s.현재옵션.length >= 2, source.제목 + " 무료 대안 부족");
  assert.ok(s.현재옵션.every(i => !card.선택지[i].비용));
  for (const [index, option] of card.선택지.entries()) {
    ({ s, card } = setup(source.제목));
    if (option.비용) {
      s.돈 = option.비용 - 1; E.refreshOptions(); assert.ok(!s.현재옵션.includes(index));
      s.돈 = option.비용; E.refreshOptions(); assert.ok(s.현재옵션.includes(index));
    }
    for (const pos of ["유격수", "선발투수"]) {
      for (const chance of option.확률결과 ? [0, 1] : [null]) {
        ({ s, card } = setup(source.제목, pos));
        const result = E.choose(s.현재옵션.indexOf(index), chance === null ? undefined : { 확률: chance });
        const expected = chance === null ? option : option.확률결과[chance ? "성공" : "실패"];
        assert.equal(result.결과, E.tpl(expected.결과));
        assert.ok(!/\{.+?\}/.test(result.결과));
        assert.equal(result.효과.돈 || 0, option.비용 ? -option.비용 : 0);
        assert.equal(s.돈, 100 - (option.비용 || 0));
        for (const stat of E.posStats()) assert.ok(!(stat in result.효과), "데이트로 포지션 능력치 상승");
        assert.ok(Object.values(s.능력치).every(Number.isFinite));
        assert.ok(s.히로인 && s.히로인.애정도 > 40);
        assert.equal(s.단계, "결과");
        const saved = JSON.stringify(s);
        assert.ok(E.load()); assert.equal(JSON.stringify(E.state()), saved);
        outcomes++;
      }
    }
  }
}

// 인물 혼동, 미국에서 국내 장소 등장, 관계 단계 누락을 별도로 확인합니다.
for (const source of added.filter(c => c.히로인 !== "누구나")) {
  const { s, card } = setup(source.제목);
  s.히로인.아이디 = source.히로인 === "heroine1" ? "heroine2" : "heroine1";
  assert.equal(I.eligible(card), false, "다른 히로인 전용 카드 등장");
}
for (const source of added.filter(c => c.히로인 === "heroine6")) {
  const { s, card } = setup(source.제목);
  for (const stage of ["고등학교", "대학", "프로", "은퇴"]) {
    s.시기 = stage; assert.equal(I.eligible(card), false, "릴리 미국 데이트가 국내 등장");
  }
}
for (const title of ["야시장의 메뉴 회의", "하나와 추억의 문방구"]) {
  const { s, card } = setup(title); s.시기 = "메이저리그";
  assert.equal(I.eligible(card), false, "국내 장소가 미국 등장");
}
for (const title of ["우리 집 휴일 사용법", "별자리보다 궁금한 것", "다온과 소원 봉투"]) {
  const { s, card } = setup(title); s.히로인.관계 = "만남";
  assert.equal(I.eligible(card), false, "관계 단계 오류");
}
{
  const { s, card } = setup("화면 너머 같은 영화"); s.시기 = "프로";
  assert.equal(I.eligible(card), false);
}
console.log(`데이트 20장·선택지 60개: 등장 조건·재등장 간격·잔액 경계·선택 결과 ${outcomes}건·저장 복원 통과`);
