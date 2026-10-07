const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
const store = {}, math = Object.create(Math); let roll = 0.5, rolls = []; math.random = () => rolls.length ? rolls.shift() : roll;
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
  assert.ok(s.현재카드.선택지.every(o=>!o.대상));
  E.save(); E.load(); assert.equal(E.state().자유시간.화면,'찾기'); assert.equal(E.state().현재카드._만남,undefined);
  rolls=[0.1,0.15]; choose('탐색'); const now=E.state(); assert.equal(now.히로인.아이디,'heroine4'); assert.equal(now.히로인.관계,'만남'); assert.equal(now.히로인.교류횟수,0); assert.equal(E.canConfess(),false);
  assert.ok(!E.freeTimeCandidates().some(h=>h.아이디==='heroine4'));
}
for (const rel of ['만남','연인','배우자']) {
  const s = setup(); I.attachHeroine('heroine1'); s.히로인.관계=rel; s.히로인.애정도=30; const before=calendar(s); show('데이트');
  choose('데이트'); assert.ok(s.히로인.애정도>30); assert.equal(s.히로인.관계,rel); assert.equal(s.히로인.교류횟수,rel==='만남'?1:0); assert.equal(calendar(s),before);
  const happy=s.행복도, mental=s.능력치.멘탈; show('만남','heroine5'); E.choose(1); E.next(); assert.equal(s.히로인.아이디,'heroine1');
  show('찾기'); rolls=[0.1,0.2]; choose('탐색'); assert.equal(s.히로인.관계,rel); assert.equal(s.히로인.아이디,rel==='만남'?'heroine5':'heroine1');
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
  show('찾기'); rolls=[0.1,0.3]; choose('탐색'); assert.equal(s.히로인.아이디,'heroine6'); assert.equal(s.히로인.만난시기,'메이저리그'); assert.equal(E.koreanBond(),false);
}
{
  const s=setup('중학교'); show('찾기'); assert.equal(s.현재옵션.length,1); assert.match(s.현재카드.내용,/없다/); choose('이동'); E.next();
  delete s.다음자유나이; delete s.자유시간; s.단계='결과'; E.save(); E.load(); assert.ok(E.state().다음자유나이>s.나이);
}
const hobbies = new Set();
for(let n=0;n<6;n++) { const s=setup('프로'); show(); roll=(n+0.1)/6; hobbies.add(choose('취미').결과.split('\n')[0]); }
assert.equal(hobbies.size,6);
// 모든 외모 레벨의 확률 경계와 실패 시 턴 소모·저장·중복 입력을 검사합니다.
for(let level=1;level<=10;level++){
  const chance=level===1?0:level/10;
  for(const [value,success] of [[0,chance>0],[Math.max(0,chance-0.000001),chance>0],[chance===1?0.999999:chance,chance===1]]){
    const s=setup();s.외모=level;s.부상=2;s.슬럼프=3;const before=calendar(s),happy=s.행복도;show('찾기');
    assert.equal(E.freeTimeMeetingChance(),chance);rolls=[value,0];const r=choose('탐색');rolls=[];
    assert.equal(!!s.히로인,success,level+': '+value);assert.equal(!!r.만남그림,success);
    assert.equal(s.총턴,101);assert.equal(s.자유시간,undefined);assert.ok(s.다음자유나이>s.나이);
    assert.equal(calendar(s),before);assert.equal(s.행복도,happy);assert.equal(s.부상,2);assert.equal(s.슬럼프,3);
    const saved=JSON.stringify(s);E.choose(0);assert.equal(JSON.stringify(s),saved);E.load();assert.equal(JSON.stringify(E.state()),saved);
  }
}
// 미만남 후보 모두 추첨될 수 있으며, 옛 저장의 지정 대상도 추첨을 우회하지 못합니다.
{
  setup();const ids=Array.from(E.freeTimeCandidates(),h=>h.아이디);
  for(let n=0;n<ids.length;n++){const s=setup();s.외모=10;show('찾기');rolls=[0.99,(n+0.5)/ids.length];choose('탐색');assert.equal(s.히로인.아이디,ids[n]);}
  const s=setup();s.외모=10;show('만남','heroine4');assert.ok(s.현재카드.선택지.every(o=>!o.대상));
  s.현재카드.선택지=[{글:'옛 인사 선택',자유선택:'만남',대상:'heroine4'}];E.refreshOptions();rolls=[0.99,0];choose('만남');assert.equal(s.히로인.아이디,'heroine1');
}
{
  const s=setup();I.attachHeroine('heroine1');s.히로인.관계='연인';s.외모=1;const bond=JSON.stringify(s.히로인);show('찾기');choose('탐색');assert.equal(JSON.stringify(s.히로인),bond);
  const empty=setup('중학교');show('찾기');empty.현재카드.선택지=[{글:'옛 탐색',자유선택:'탐색'}];E.refreshOptions();choose('탐색');assert.equal(empty.총턴,100);assert.ok(empty.자유시간);
}
console.log('PASS: 자유행동·시기·관계·회복·저장 / 외모 1~10 확률 경계 / 무작위 후보 전체 / 실패 소모·중복 방지 / 옛 지정 만남 호환');
