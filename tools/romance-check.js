// node tools/romance-check.js — 첫 등장·교류·고백·기존 저장·새 인연의 분리 검사.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
const files = [...read('index.html').matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f));
const store = {}, ctx = { console, Math, JSON, Date, localStorage: { getItem: k => store[k] || null, setItem: (k,v) => store[k] = String(v), removeItem: k => delete store[k] } };
ctx.window = ctx; vm.createContext(ctx);
for (const f of files) vm.runInContext(read(f), ctx, { filename: f });
const E = ctx.E, I = E._internal, GD = ctx.GD;
function setup(id = 'heroine1') {
  E.newGame('인연검증', '유격수', '수비', { 외모: 10 });
  const s = E.state(); s.시기 = id === 'heroine6' ? '메이저리그' : '프로'; s.나이 = 26; s.총턴 = 100; s.대기열 = [];
  return s;
}
const find = title => I.CARDS().find(c => c.제목 === title);
function play(c, index = 0) {
  const s = E.state(); s.현재카드 = I.clone(c); s.단계 = '카드'; s._상대 = c._끼어들기 || null; E.refreshOptions();
  return E.choose(s.현재옵션.indexOf(index));
}
for (const hero of GD.히로인) {
  const s = setup(hero.아이디), meet = I.CARDS().find(c => c._만남 === hero.아이디);
  s.시기 = hero.만나는시기[0]; s.일군 = true; s.부상 = hero.아이디 === 'heroine3' ? 1 : 0;
  assert.equal(I.eligible(meet), true);
  play(meet, meet.선택지.findIndex(o => o.인연시작));
  assert.equal(s.히로인.관계, '만남'); assert.equal(s.히로인.교류횟수, 0);
  assert.equal(E.canConfess(), false);
  s.히로인.애정도 = 100; // 외모·선물로 호감이 높아도 즉시 고백 불가
  assert.equal(I.eligible(find('고백')), false);
  for (const c of I.CARDS().filter(c => c.히로인 && !c.알아가기 && !c.고백카드 && !c.인연정리)) assert.equal(I.eligible(c), false, c.제목);
  const chats = I.CARDS().filter(c => c.알아가기);
  play(chats[0], 2); assert.equal(s.히로인.교류횟수, 0, '대화를 미룬 선택은 교류 아님');
  for (const c of chats.slice(0, 3)) { play(c); }
  assert.equal(s.히로인.교류횟수, 3); assert.equal(E.canConfess(), true);
  assert.equal(I.eligible(find('고백')), true);
  play(find('고백'), 1); assert.equal(s.히로인.관계, '만남'); assert.equal(I.eligible(find('고백')), false);
  s.총턴 += 3; assert.equal(I.eligible(find('고백')), true);
  play(find('고백')); assert.equal(s.히로인.관계, '연인');
  assert.equal(I.eligible(find('둘만의 데이트')), true); assert.equal(I.eligible(chats[0]), false);
  E.save(); assert.ok(E.load()); assert.equal(E.state().히로인.관계, '연인');
  I.setRelation('이별'); I.attachHeroine(hero.아이디 === 'heroine1' ? 'heroine2' : 'heroine1');
  const next = E.state(); next.히로인.애정도 = 60; next.히로인.교류횟수 = 3; next.총턴 += 4;
  assert.equal(I.eligible(find('고백')), true, '다음 인연에게도 고백 가능');
}
{
  const s = setup(); I.attachHeroine('heroine1'); const confession = find('고백');
  s.히로인.애정도 = 60; s.히로인.교류횟수 = 3; s.총턴 = 103; assert.equal(I.eligible(confession), false);
  s.총턴 = 104; assert.equal(I.eligible(confession), true);
  s.히로인.애정도 = 59; assert.equal(I.eligible(confession), false);
  s.히로인.애정도 = 100; s.히로인.교류횟수 = 2; assert.equal(I.eligible(confession), false);
  const happy = s.행복도, mental = s.능력치.멘탈;
  I.setRelation('이별'); assert.equal(s.행복도, happy); assert.equal(s.능력치.멘탈, mental);
  assert.equal(E.check({ 최소: { 이별수: 1 } }), false);
  I.attachHeroine('heroine2'); s.히로인.애정도 = 70; s.히로인.교류횟수 = 3; s.총턴 += 4;
  play(confession); assert.equal(s.히로인.관계, '연인');
  I.setRelation('이별'); assert.equal(E.check({ 최소: { 이별수: 1 } }), true);
}
{
  const s = setup('heroine6'); I.attachHeroine('heroine6'); s.히로인.애정도 = 80; s.히로인.교류횟수 = 3; s.총턴 += 5;
  s.플래그.외국인작별 = true; s.시기 = '프로';
  assert.equal(E.canConfess(), false); const farewell = find('출국 전 마지막 안부'); assert.equal(I.eligible(farewell), true);
  play(farewell); assert.equal(s.히로인, null); assert.equal(s.플래그.외국인작별, undefined);
}
for (const choice of [0, 1, 2]) {
  const s = setup(); I.attachHeroine('heroine1'); s.히로인.관계 = '연인'; s.히로인.애정도 = 90;
  const intro = I.CARDS().find(c => c._끼어들기 === 'heroine2' && !c.교제제안);
  const proposal = I.CARDS().find(c => c._끼어들기 === 'heroine2' && c.교제제안);
  assert.equal(I.eligible(proposal), false); play(intro, 1); assert.equal(s.히로인2, undefined); assert.equal(s.히로인.아이디, 'heroine1');
  assert.equal(I.eligible(proposal), false); s.총턴 += 3; assert.equal(I.eligible(proposal), true);
  play(proposal, choice); assert.equal(s.새인연, undefined);
  if (choice === 1) assert.equal(s.히로인2.아이디, 'heroine2');
  if (choice === 2) assert.equal(s.히로인.아이디, 'heroine2');
}
{
  const s = setup(); I.attachHeroine('heroine1'); delete s.히로인.만남턴; delete s.히로인.교류횟수;
  s.히로인.애정도 = 100; s.현재카드 = I.clone(find('고백')); s.단계 = '카드'; E.save();
  assert.ok(E.load()); assert.equal(E.state().히로인.교류횟수, 0); assert.equal(E.state().히로인.만남턴, 100);
  assert.notEqual(E.state().현재카드.제목, '고백'); assert.equal(E.canConfess(), false);
  E.state().히로인.관계 = '배우자'; E.save(); assert.ok(E.load()); assert.equal(E.state().히로인.관계, '배우자');
}
{
  const s = setup(); I.attachHeroine('heroine1'); s.히로인.애정도 = 100; s.행복도 = 20;
  const before = s.행복도; I.flowHelpers.tick({}, { 히로인: '누구나' }); assert.equal(s.행복도, before, '교제 전 연인 행복 보너스 금지');
  s.히로인.교류횟수 = 2; s.단계 = '결과'; E.save(); E.load();
  assert.equal(E.state().히로인.교류횟수, 2); assert.equal(E.state().히로인.만남턴, 100);
}
console.log('PASS: 히로인 6명 첫 등장·대화·고백, 재시도, 커플 카드 차단, 연락 정리, 새 인연 3갈래, 저장 호환');
