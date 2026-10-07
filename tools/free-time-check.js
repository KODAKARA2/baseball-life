const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
const store = {}, math = Object.create(Math); let roll = 0.5; math.random = () => roll;
const ctx = { console, Math: math, JSON, Date, localStorage: { getItem: k => store[k] || null, setItem: (k,v) => store[k] = String(v), removeItem: k => delete store[k] } };
ctx.window = ctx; vm.createContext(ctx);
for (const file of [...read('index.html').matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f))) vm.runInContext(read(file), ctx, { filename: file });
const E = ctx.E, I = E._internal;
function setup(stage = '고등학교') {
  E.newGame('자유시간', '유격수', '수비', { 외모: 5 });
  const s = E.state(); s.시기 = stage; s.나이 = s.진입나이 = s.시기 === '고등학교' ? 17 : 25;
  s.총턴 = 100; s.시기턴 = 2; s.대기열 = []; s.다음자유나이 = s.나이; s.플래그 = {};
  return s;
}
function show(screen = '메뉴', target) {
  const s = E.state(); s.자유시간 = { 화면: screen, 대상: target }; s.현재카드 = E.freeTimeCard(); s.단계 = '카드'; E.refreshOptions();
}
function choose(action, target) {
  const s = E.state(), ix = s.현재옵션.findIndex(i => s.현재카드.선택지[i].자유선택 === action && (!target || s.현재카드.선택지[i].대상 === target));
  assert.ok(ix >= 0, action + ':' + target); return E.choose(ix);
}
function calendar(s) { return JSON.stringify([s.나이,s.시기턴,s.올해카드,s.올해부상카드,s.기록,s.돈,s.성적]); }
for (const value of [0, 0.99]) {
  roll = value; const s = setup(); const before = calendar(s); show(); choose('연습');
  assert.equal(s.다음자유나이 - s.나이, value ? 2 : 1); assert.equal(calendar(s), before); assert.equal(s.총턴, 101); assert.equal(E.freeTimeDue(), false);
  s.나이 = s.다음자유나이 - 1; assert.equal(E.freeTimeDue(), false); s.나이++; assert.equal(E.freeTimeDue(), true);
}
roll = 0.5;
for (const stage of ['초등학교','중학교','고등학교','대학','프로','군복무','메이저리그']) { setup(stage); assert.equal(E.freeTimeDue(), true); }
for (const stage of ['드래프트','대학드래프트','은퇴']) { setup(stage); assert.equal(E.freeTimeDue(), false); }
{
  const s = setup(); s.플래그.외국인작별 = true; assert.equal(E.freeTimeDue(), false);
  delete s.플래그.외국인작별; s.대기열 = [{ 시스템:true,제목:'시즌 결산',선택지:[{글:'계속'}] }]; E.next(); assert.equal(s.현재카드.제목, '시즌 결산');
  E.choose(0); E.next(); assert.equal(s.현재카드.제목, '나를 위한 자유시간');
}
for (const action of ['연습','취미','휴식']) {
  const s = setup(), beforeStats = {...s.능력치}, beforeCalendar = calendar(s); s.행복도 = 40; s.부상 = 3; s.슬럼프 = 2; show();
  const r = choose(action); assert.equal(calendar(s), beforeCalendar); assert.equal(s.총턴, 101);
  if (action === '연습') { assert.equal(E.posStats().reduce((n,k) => n+s.능력치[k]-beforeStats[k],0),1); assert.equal(s.부상,3); assert.equal(s.슬럼프,2); }
  if (action === '취미') { assert.ok(s.행복도 > 40); assert.equal(s.부상,3); assert.equal(s.슬럼프,2); assert.doesNotMatch(r.결과,/드라이브|골프/); }
  if (action === '휴식') { assert.equal(s.부상,2); assert.equal(s.슬럼프,1); }
  const completed = JSON.stringify(s); E.choose(0); assert.equal(JSON.stringify(s),completed, '두 번 눌러도 중복 보상 없음');
  E.save(); E.load(); assert.equal(JSON.stringify(E.state()),completed);
}
{
  const s = setup(); show(); s.부상 = s.슬럼프 = 0; choose('휴식'); assert.equal(s.부상,0); assert.equal(s.슬럼프,0);
  show(); E.posStats().forEach(k=>s.능력치[k]=E.cap()); choose('연습'); assert.ok(E.posStats().every(k=>s.능력치[k]===E.cap()));
}
{
  const s = setup(); show(); const turn = s.총턴, next = s.다음자유나이;
  for (let n=0;n<6;n++) { choose('이동'); E.next(); assert.equal(s.자유시간.화면,'데이트'); E.choose(s.현재옵션.length-1); E.next(); }
  assert.equal(s.총턴,turn); assert.equal(s.다음자유나이,next);
  show('찾기'); assert.deepEqual(Array.from(E.freeTimeCandidates(),h=>h.아이디),['heroine1','heroine4','heroine5','heroine7','heroine8','heroine9','heroine10','heroine11']);
  choose('이동','heroine4'); E.next(); assert.equal(s.히로인,null);
  E.save(); E.load(); assert.equal(E.state().자유시간.대상,'heroine4'); assert.equal(E.state().현재카드._만남,'heroine4');
  choose('만남','heroine4'); const now=E.state(); assert.equal(now.히로인.관계,'만남'); assert.equal(now.히로인.교류횟수,0); assert.equal(E.canConfess(),false);
  assert.ok(!E.freeTimeCandidates().some(h=>h.아이디==='heroine4'));
}
for (const rel of ['만남','연인','배우자']) {
  const s = setup(); I.attachHeroine('heroine1'); s.히로인.관계=rel; s.히로인.애정도=30; const before=calendar(s); show('데이트');
  choose('데이트'); assert.ok(s.히로인.애정도>30); assert.equal(s.히로인.관계,rel); assert.equal(s.히로인.교류횟수,rel==='만남'?1:0); assert.equal(calendar(s),before);
  const happy=s.행복도, mental=s.능력치.멘탈; show('만남','heroine5'); E.choose(1); E.next(); assert.equal(s.히로인.아이디,'heroine1');
  show('만남','heroine5'); choose('만남','heroine5'); assert.equal(s.히로인.관계,rel); assert.equal(s.히로인.아이디,rel==='만남'?'heroine5':'heroine1');
  assert.equal(s.행복도,happy); assert.equal(s.능력치.멘탈,mental); assert.equal(s.지난히로인.length,0); assert.ok(!s.히로인2);
  assert.equal(E.acquaintances().find(h=>h.아이디==='heroine5').교류횟수,0);
  show('데이트'); choose('데이트','heroine5'); assert.equal(E.acquaintances().find(h=>h.아이디==='heroine5').교류횟수,1);
  if(rel!=='만남') assert.equal(s.히로인.아이디,'heroine1');
}
{
  const s=setup(); I.attachHeroine('heroine1'); s.히로인.애정도=60;s.히로인.교류횟수=2;
  I.attachHeroine('heroine4'); I.attachHeroine('heroine5');
  assert.equal(E.acquaintances().length,3); assert.equal(s.지난히로인.length,0); assert.equal(E.check({양다리:true}),false);
  show('데이트'); choose('데이트','heroine1'); assert.equal(s.히로인.아이디,'heroine1'); assert.equal(s.히로인.교류횟수,3);
  s.총턴+=4; assert.equal(E.canConfess(),true);
  E.save(); E.load(); assert.equal(E.acquaintances().length,3); assert.equal(E.state().히로인.교류횟수,3);
  I.setRelation('연인'); assert.equal(E.acquaintances().length,2); assert.ok(!E.state().히로인2);
  assert.equal(E.state().지난히로인.length,0);
}
{
  const s=setup('메이저리그'); I.attachHeroine('heroine6'); I.attachHeroine('heroine3');
  E.enterStage('프로'); assert.equal(E.acquaintances().some(h=>h.아이디==='heroine6'),false);
}
{
  const s=setup('프로'); assert.deepEqual(Array.from(E.freeTimeCandidates(),h=>h.아이디),['heroine13']);
  s.일군=true; assert.deepEqual(Array.from(E.freeTimeCandidates(),h=>h.아이디),['heroine2','heroine12','heroine13']);
  s.부상=2; assert.equal(E.freeTimeCandidates().length,4); s.시기='메이저리그'; assert.deepEqual(Array.from(E.freeTimeCandidates(),h=>h.아이디),['heroine3','heroine6','heroine14','heroine15']);
  s.히로인2={아이디:'heroine1'}; assert.equal(E.freeTimeCandidates().length,0); delete s.히로인2;
  show('만남','heroine6'); choose('만남','heroine6'); assert.equal(s.히로인.만난시기,'메이저리그'); assert.equal(E.koreanBond(),false);
}
{
  const s=setup('중학교'); show('찾기'); assert.equal(s.현재옵션.length,1); assert.match(s.현재카드.내용,/없다/); choose('이동'); E.next();
  delete s.다음자유나이; delete s.자유시간; s.단계='결과'; E.save(); E.load(); assert.ok(E.state().다음자유나이>s.나이);
}
const hobbies = new Set();
for(let n=0;n<6;n++) { const s=setup('프로'); show(); roll=(n+0.1)/6; hobbies.add(choose('취미').결과.split('\n')[0]); }
assert.equal(hobbies.size,6);
console.log('PASS: 1~2년 주기·시기 제한·시즌 순서, 4행동, 15히로인 후보, 관계 교체/취소, 회복 1턴, 중복 방지·메뉴/결과 저장 호환');
