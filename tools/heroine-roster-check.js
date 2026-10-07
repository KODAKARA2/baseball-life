// 신규 인연의 등장 경계, 실제 선택, 개별 교류 기록, 미국 인연 작별·엔딩을 검사합니다.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const store={},math=Object.create(Math);math.random=()=>0.5;
const ctx={console,Math:math,JSON,Date,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}};
ctx.window=ctx;vm.createContext(ctx);
for(const file of [...read('index.html').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]).filter(f=>!/ui\.js|panels\.js/.test(f)))vm.runInContext(read(file),ctx,{filename:file});
const {E,GD}=ctx,I=E._internal,newHeroes=GD.히로인.filter(h=>Number(h.아이디.slice(7))>=7);
assert.equal(newHeroes.length,9);assert.equal(GD.히로인.length,15);
assert.equal(new Set(GD.히로인.map(h=>h.아이디)).size,15);
function setup(h,rel){E.newGame('강민준','유격수','수비',{외모:5});const s=E.state();s.시기=h.만나는시기[0];s.나이=s.진입나이=s.시기==='고등학교'?17:25;s.총턴=100;s.시기턴=1;s.대기열=[];s.일군=true;s.다음자유나이=99;s.행복도=60;s.돈=10000;if(rel){I.attachHeroine(h.아이디);s.히로인.관계=rel;s.히로인.애정도=70;}return s;}
function play(card,choice){const s=E.state();s.현재카드=I.clone(card);s.단계='카드';E.refreshOptions();const ix=s.현재옵션.indexOf(choice);assert.ok(ix>=0,card.제목);const r=E.choose(ix);assert.ok(r&&r.결과,card.제목);assert.doesNotMatch(E.tpl(r.결과),/\{[가-힣]+\}/);E.save();assert.ok(E.load());return r;}
let outcomes=0;
for(const h of newHeroes){
  let s=setup(h);const meet=I.CARDS().find(c=>c._만남===h.아이디);
  for(const stage of ['초등학교','중학교','고등학교','대학','프로','군복무','메이저리그']){s.시기=stage;assert.equal(I.eligible(meet),stage===h.만나는시기[0]);assert.equal(E.freeTimeCandidates().some(x=>x.아이디===h.아이디),stage===h.만나는시기[0]);}
  if(h.만남조건.최소나이){s.시기=h.만나는시기[0];s.나이=19;assert.equal(I.eligible(meet),false);assert.equal(E.freeTimeCandidates().some(x=>x.아이디===h.아이디),false);s.나이=20;assert.equal(I.eligible(meet),true);}
  if(h.아이디==='heroine12'){s.일군=false;assert.equal(I.eligible(meet),false);assert.equal(E.freeTimeCandidates().some(x=>x.아이디===h.아이디),false);}
  for(let n=0;n<meet.선택지.length;n++){setup(h);play(meet,n);s=E.state();if(meet.선택지[n].인연시작){assert.equal(s.히로인.관계,'만남');assert.equal(s.히로인.교류횟수,0);assert.equal(E.canConfess(),false);}else assert.equal(s.히로인,null);outcomes++;}
  const cards=I.CARDS().filter(c=>c.히로인===h.아이디),chats=cards.filter(c=>c.알아가기);
  assert.equal(cards.length,5);assert.equal(chats.length,2);
  for(const card of cards){
    for(const rel of ['만남','연인','배우자']){s=setup(h,rel);if(rel==='배우자')s.나이=30;assert.equal(I.eligible(card),[].concat(card.조건.관계).includes(rel),card.제목+rel);}
    for(let n=0;n<card.선택지.length;n++){
      s=setup(h,[].concat(card.조건.관계)[0]);if(s.히로인.관계==='배우자')s.나이=30;
      assert.equal(I.eligible(card),true,card.제목);play(card,n);s=E.state();
      if(card.알아가기)assert.equal(s.히로인.교류횟수,card.선택지[n].교류?1:0);
      assert.ok(Number.isFinite(s.히로인.애정도));assert.ok(Number.isFinite(s.행복도));outcomes++;
    }
  }
  s=setup(h,'만남');play(chats[0],0);play(chats[1],0);s=E.state();s.총턴+=5;play(chats[0],0);
  assert.equal(E.state().히로인.교류횟수,3);assert.equal(E.canConfess(),true);play(I.CARDS().find(c=>c.고백카드),0);assert.equal(E.state().히로인.관계,'연인');
  s=setup(h,'배우자');s.나이=40;s.시기='은퇴';s.엔딩=E.computeEnding();assert.equal(s.엔딩.히로인엔딩.아이디,h.아이디);assert.equal(s.엔딩.히로인엔딩.이름,h.엔딩.이름);E.recordLife();assert.ok(E.collection().엔딩['히로인:'+h.아이디]);
  for(const key of new Set(Object.values(h.그림))){const png=fs.readFileSync(path.join(root,'images',key+'.png'));assert.equal(png.readUInt32BE(16),1024);assert.equal(png.readUInt32BE(20),1536);assert.equal(png[25],6,'RGBA PNG');}
}
// 여러 새 인연을 만나도 이전 인연의 교류/호감은 보존됩니다.
{
  const s=setup(newHeroes[0]);for(const h of newHeroes.slice(0,5)){I.attachHeroine(h.아이디);s.히로인.애정도=40+Number(h.아이디.slice(7));s.히로인.교류횟수=2;}
  const before=JSON.stringify(E.acquaintances().map(h=>({...h})).sort((a,b)=>a.아이디.localeCompare(b.아이디)));
  E.save();E.load();assert.equal(E.acquaintances().length,5);assert.equal(E.state().지난히로인.length,0);assert.equal(E.check({양다리:true}),false);
  assert.equal(JSON.stringify(E.acquaintances().map(h=>({...h})).sort((a,b)=>a.아이디.localeCompare(b.아이디))),before);
  E.focusAcquaintance('heroine7');assert.equal(E.state().히로인.교류횟수,2);assert.equal(E.state().히로인.애정도,47);
}
for(const h of newHeroes.filter(h=>h.외국인)){
  for(const rel of ['만남','연인','배우자']){const s=setup(h,rel);assert.equal(E.koreanBond(),false);E.enterStage('프로');assert.equal(s.플래그.외국인작별,true);assert.equal(E.freeTimeDue(),false);assert.equal(E.canConfess(),false);assert.ok(I.CARDS().filter(c=>c.히로인===h.아이디).every(c=>!I.eligible(c)));E.next();assert.ok(s.현재카드.조건.플래그==='외국인작별');play(s.현재카드,0);assert.equal(E.state().히로인,null);assert.ok(!E.state().플래그.외국인작별);}
  const s=setup(h,'만남');I.attachHeroine('heroine1');E.enterStage('프로');assert.equal(E.acquaintances().some(x=>x.아이디===h.아이디),false);assert.equal(s.히로인.아이디,'heroine1');
}
console.log('PASS: 새 히로인 9명 / 카드 54장 / 선택 결과 '+outcomes+'건 / 시기·나이·1군 경계 / 교류·고백·다중 인연 저장 / 해외 작별 / 전용 엔딩·그림');
