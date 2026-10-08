// node tools/acquaintance-proposal-check.js — 기존 지인의 먼저 고백·양다리 연결 회귀 검사
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8'), store = {};
const math = Object.create(Math); math.random = () => 0.99;
const ctx = { console, Math: math, JSON, Date, localStorage: { getItem: k => store[k] || null, setItem: (k,v) => store[k] = String(v), removeItem: k => delete store[k] } };
ctx.window = ctx; vm.createContext(ctx);
for (const f of [...read('index.html').matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f))) vm.runInContext(read(f),ctx,{filename:f});
const { E, GD } = ctx, I = E._internal;
const proposal = id => I.CARDS().find(c => c.인연교제제안 && c._끼어들기 === id);
function setup(id = 'heroine8') {
  E.newGame('인연검사','유격수','수비',{외모:8}); const s = E.state();
  s.시기 = '프로'; s.나이 = s.진입나이 = 25; s.총턴 = 100; s.시기턴 = 0; s.올해카드 = 0; s.대기열 = []; s.다음자유나이 = 99;
  I.attachHeroine(id === 'heroine1' ? 'heroine2' : 'heroine1'); s.히로인.관계 = '연인'; s.히로인.애정도 = 90;
  I.attachHeroine(id); const h = E.acquaintances().find(h => h.아이디 === id);
  h.애정도 = 60; h.만남턴 = 96; h.만난시기 = '고등학교'; h.교류횟수 = 0;
  return { s, h, c: proposal(id) };
}
function show(c) { const s = E.state(); s.현재카드 = I.clone(c); s._상대 = c._끼어들기 || null; s.단계 = '카드'; E.refreshOptions(); }
function play(c, index) { show(c); return E.choose(index); }
// 15명 모두 검사. 이미 아는 인물에게는 첫 만남의 일군·부상·학교 조건을 다시 요구하지 않음.
for (const def of GD.히로인) {
  const {s,h,c} = setup(def.아이디); if (def.외국인) s.시기 = '메이저리그';
  assert.ok(I.eligible(c), def.이름); assert.equal(s.히로인2, undefined);
  h.애정도 = 59; assert.equal(I.eligible(c),false); h.애정도 = 60;
  h.만남턴 = 97; assert.equal(I.eligible(c),false); h.만남턴 = 96;
  s.히로인.관계 = '만남'; assert.equal(I.eligible(c),false);
  s.히로인.관계 = '배우자'; assert.equal(I.eligible(c),false); s.히로인.관계 = '연인';
  s.히로인2 = {아이디:'other'}; assert.equal(I.eligible(c),false); delete s.히로인2;
  s.플래그.외국인작별 = true; assert.equal(I.eligible(c),false); delete s.플래그.외국인작별;
  for (const stage of ['초등학교','중학교','드래프트','대학드래프트','은퇴']) { s.시기 = stage; assert.equal(I.eligible(c),false); }
  s.시기 = '프로'; assert.equal(I.eligible(c),!def.외국인);
  s.시기 = '메이저리그'; assert.equal(I.eligible(c),true);
  s.알아가는인연 = []; assert.equal(I.eligible(c),false, '만난 기록만으로 재고백하지 않음');
}
for (const choice of [0,1,2]) {
  let {s,c} = setup(); I.attachHeroine('heroine9');
  s.새인연 = {아이디:'heroine2',기존인연:s.히로인.아이디,등장턴:90};
  show(c); E.save(); assert.ok(E.load()); s = E.state(); assert.equal(s.현재카드.제목,c.제목);
  E.choose(choice);
  assert.equal(E.acquaintances().filter(h => h.아이디 === 'heroine9').length,1,'다른 지인 유지');
  assert.equal(s.만난히로인.filter(id => id === 'heroine8').length,1);
  if (choice === 0) {
    assert.equal(s.히로인.아이디,'heroine1'); assert.ok(!s.히로인2);
    assert.equal(E.acquaintances().find(h => h.아이디 === 'heroine8').관계,'만남');
    assert.equal(s.새인연.아이디,'heroine2','다른 사람의 기존 제안 대기 유지');
    s.총턴 += 100; assert.equal(I.eligible(c),false,'한 사람의 제안은 한 인생에서 한 번');
  } else {
    assert.ok(!E.acquaintances().some(h => h.아이디 === 'heroine8'));
    assert.equal(s.새인연,undefined);
    if (choice === 1) {
      assert.equal(s.히로인.아이디,'heroine1'); assert.equal(s.히로인2.아이디,'heroine8');
      assert.equal(s.히로인2.만난시기,'고등학교'); assert.equal(s.히로인2.애정도,42,'호감 중복 상승 없음');
      assert.ok(I.eligible(I.CARDS().find(c => c.제목 === '비밀 데이트')));
      assert.equal(I.eligible(I.CARDS().find(c => c.제목 === '프러포즈')),false);
      assert.equal(E.freeTimeCandidates().length,0);
    } else {
      assert.equal(s.히로인.아이디,'heroine8'); assert.equal(s.히로인.관계,'연인'); assert.ok(!s.히로인2);
      assert.equal(s.지난히로인.at(-1).아이디,'heroine1');
    }
  }
  const saved = JSON.stringify(s); E.choose(choice); assert.equal(JSON.stringify(s),saved);
  E.save(); assert.ok(E.load()); assert.equal(JSON.stringify(E.state()),saved);
}
for (const choice of [0,1,2]) {
  const {s,c} = setup(); play(c,1);
  const caught = I.CARDS().find(c => c.제목 === '양다리 발각');
  math.random = () => 0.1; assert.ok(I.eligible(caught)); math.random = () => 0.99;
  play(caught,choice); assert.equal(s.히로인2,null);
  assert.equal(s.히로인?.아이디,choice === 0 ? 'heroine1' : choice === 1 ? 'heroine8' : undefined);
  assert.ok(!E.acquaintances().some(h => h.아이디 === 'heroine8'));
}
{
  const {s,h,c} = setup(); delete h.만남턴; delete h.교류횟수; s.단계 = '결과'; E.save(); E.load();
  const loaded = E.acquaintances()[0]; assert.equal(loaded.만남턴,100); assert.equal(loaded.교류횟수,0);
  assert.equal(I.eligible(c),false); E.state().총턴 += 4; assert.ok(I.eligible(c));
}
// 실제 카드 추첨에서도 새 제안을 뽑는지 확인 (선택 실행 없이 동일 시점에서 반복 추첨).
{
  const {s} = setup(); s.시기 = '고등학교'; s.나이 = s.진입나이 = 17; s.시기턴 = 0;
  let seed = 12345; math.random = () => ((seed = (Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  let drawn = false;
  for (let i=0;i<300;i++) { E.next(); if (s.현재카드.인연교제제안) { drawn=true; break; } }
  assert.ok(drawn,'기존 연애 카드 추첨에서 제안 등장');
}
console.log('PASS: 15명 제안 경계·기존 인연 유지·3갈래 선택·중복 방지·발각 3결말·외국인/시기·저장/옛 저장·실제 추첨');
