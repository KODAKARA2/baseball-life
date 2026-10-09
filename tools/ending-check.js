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
const expectedJobs = ["코치", "해설가", "놓쳐 버린 원석", "마지막 영업일", "읽히지 않은 보고서", "텅 빈 주말 구장", "책상 위의 패배", "끊어진 계약서", "멈춰 버린 원고", "업로드가 멈춘 채널"];
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
old.능력치.멘탈 = 70;
const count = E.collection().인생수;
assert.ok(E.chooseCareer("프런트"));
assert.equal(old.엔딩.기본.이름, "행복한 소시민"); assert.equal(E.collection().인생수, count);
assert.ok(E.collection().엔딩["직업:구단 프런트"]);
assert.equal(GD.직업엔딩.filter(e => e.종류 === '직업').length,20);
const I = E._internal;
for (const career of GD.진로) {
  const good = GD.직업엔딩.find(e => e.진로 === career.아이디 && e.결말유형 === '좋음');
  const bad = GD.직업엔딩.find(e => e.진로 === career.아이디 && e.결말유형 === '아쉬움');
  assert.ok(good && bad && good.내용 !== bad.내용);
  // 각 조건의 경계를 하나씩 낮춰 모든 진로가 양쪽 결말로 분기되는지 확인.
  for (const below of [null,...Object.keys(good.조건.최소)]) {
    const s=life(1000,100);s.돈=100000;s.능력치.멘탈=s.능력치.인기=100;
    for (const [k,v] of Object.entries(good.조건.최소)) (k in s.능력치 ? s.능력치 : s)[k]=v-(k===below?1:0);
    assert.ok(E.chooseCareer(career.아이디));
    assert.equal(s.엔딩.직업.이름,below?bad.이름:good.이름,career.아이디+': '+below);
    const stored=JSON.stringify(s.엔딩);E.save();E.load();assert.equal(JSON.stringify(E.state().엔딩),stored);
  }
  // 프로 출신·프로 미진출 모두 첫 카드에서 10개 중 한 번만 선택.
  for (const pro of [true,false]) {
    const s=life(1000,100);s.엔딩=null;s.단계='카드';s.연차=pro?12:0;s.시기턴=2;s.진입나이=s.나이;
    s.능력치.멘탈=s.능력치.인기=100;s.돈=100000;s.다음자유나이=99;
    const c=I.CARDS().find(c=>c.진로선택 && I.eligible(c));assert.ok(c);
    s.현재카드=I.clone(c);E.refreshOptions();assert.equal(s.현재옵션.length,10);
    const index=s.현재옵션.findIndex(i=>c.선택지[i].진로선택===career.아이디),before=E.collection().인생수;
    E.choose(index);assert.equal(s.진로확정,career.아이디);assert.equal(E.collection().인생수,before);
    const result=JSON.stringify(s);E.choose(index);assert.equal(JSON.stringify(s),result);
    E.next();assert.equal(s.단계,'엔딩');
    assert.equal(s.엔딩.직업.결말유형,'좋음');assert.equal(s.엔딩.직업.진로,career.아이디);
    E.recordLife();assert.equal(E.collection().인생수,before+1);
    const collection=JSON.stringify(E.collection());assert.equal(E.chooseCareer('지도자'),false);E.recordLife();assert.equal(JSON.stringify(E.collection()),collection);
    assert.ok(!I.eligible(c));
  }
}
// 이전 버전의 4개/2개 선택 카드, 확정 전 결과 화면, 이미 확정된 엔딩을 각각 보존/갱신.
for (const pro of [true,false]) {
  const s=life(1000,100);s.엔딩=null;s.단계='카드';s.연차=pro?12:0;s.시기턴=2;s.팀이동=0;
  s.대기열=[{제목:'대기 중인 우선 사건',선택지:[{글:'계속'}]}];s.본카드['은퇴 후의 진로']=1;s.본카드['새로운 출발']=1;
  E.next();assert.ok(s.현재카드.진로선택,'마지막 은퇴 카드는 우선 사건/옛 예비 선택 이력보다 진로 확정 우선');
  assert.equal(s.현재옵션.length,10);
}
for (const title of ['은퇴 후의 진로','새로운 출발']) {
  const s=life();s.엔딩=null;s.단계='카드';s.현재카드={제목:title,선택지:[{글:'옛 선택'}]};E.save();E.load();
  assert.equal(E.state().현재옵션.length,10);assert.ok(E.state().현재카드.진로선택);
}
{
  const s=life();s.엔딩=null;s.단계='결과';s.시기턴=2;s.본카드['은퇴 후의 진로']=3;s.플래그.진로_지도자=true;
  E.save();E.load();E.enterStage('엔딩');E.next();assert.equal(E.state().진로확정,undefined);
  assert.ok(E.chooseCareer('해설가'));assert.equal(E.state().진로확정,'해설가');
}
{
  const s=life();s.진로확정='자유';s.엔딩.직업={이름:'야구장 밖의 인생',내용:'이전 후일담',아이콘:'☕'};E.recordLife();
  const en=JSON.stringify(s.엔딩),col=JSON.stringify(E.collection());E.save();E.load();assert.equal(JSON.stringify(E.state().엔딩),en);
  assert.equal(E.chooseCareer('작가'),false);E.recordLife();assert.equal(JSON.stringify(E.collection()),col);
}
console.log(`PASS: 인생 엔딩 경계 ${checks}건 / 진로 10×2 결말·모든 조건 경계 / 첫 카드 10개·한 번 확정 / 중복·저장·옛 엔딩 호환`);
