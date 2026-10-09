// node tools/player-stories-check.js — 저장/이동/시즌 결산까지 여섯 시스템의 연결을 검사합니다.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),store={};
let random=.5;
const math=Object.create(Math);math.random=()=>random;
const ctx={console,Math:math,JSON,Date,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}};ctx.window=ctx;vm.createContext(ctx);
for(const [,f] of read('index.html').matchAll(/src="([^"]+\.js)"/g))if(!/ui\.js|panels\.js/.test(f))vm.runInContext(read(f),ctx,{filename:f});
const {E,GD}=ctx,P=E.story,I=E._internal;
function life(pos='유격수',spec='수비'){
 random=.5;E.newGame('강민준',pos,spec,{외모:5});const s=E.state();
 Object.assign(s,{시기:'프로',나이:26,진입나이:20,연차:6,팀:GD.설정.국내팀[0],일군:true,다음자유나이:99,올해카드:0,부상:0,대기열:[]});
 for(const k of Object.keys(s.능력치))s.능력치[k]=65;
 return s;
}
function choose(c,i=0,ok=true){const s=E.state();s.현재카드=c;s.단계='카드';s.결과=null;E.refreshOptions();return E.choose(i,{확률:ok?1:0});}
function route(kind,options=[0,0,0],ok=true,id){for(let n=0;n<options.length;n++){choose(P.routeCard(kind,n,id),options[n],ok);if(n<options.length-1){E.save();assert.ok(E.load());}}}
let s=life();const before=JSON.stringify(s.능력치),age=s.나이;
choose(P.profileCard());assert.equal(P.type().id,'power');assert.equal(s.나이,age);assert.equal(JSON.stringify(s.능력치),before);
assert.equal(P.card().선수서사,'contract');choose(P.contractCard(),0);assert.equal(P.contract().id,'contender');assert.equal(P.playtime(),.7);assert.equal(P.salary(10000),8500);
let money=s.돈;E.choose(0);assert.equal(s.돈,money,'duplicate click must not pay again');
assert.equal(P.card().선수서사,'goal');choose(P.goalCard(),1);assert.equal(s.선수생활.목표.값,'record');assert.equal(s.선수생활.목표.목표치,15);
let d=P.init(),snapshot=JSON.stringify(d);P.card();P.card();P.summary();assert.equal(JSON.stringify(d),snapshot,'render must not advance story');
E.endYear();assert.equal(s.기록[0].타수,350);assert.equal(s.기록[0].선수유형,'장타형');assert.equal(s.선수생활.목표이력.length,1);assert.match(s.대기열[0].내용,/시즌 목표/);
assert.equal(P.contract().id,'contender');s.나이=29;assert.equal(P.contract(),null);assert.equal(P.salary(10000),10000);assert.equal(P.card().선수서사,'contract');
s=life();choose(P.profileCard(),1);choose(P.contractCard(),1);assert.equal(P.playtime(),1.1);assert.equal(P.salary(10000),10000);
choose(P.goalCard(),0);E.endYear();assert.equal(s.선수생활.목표이력[0].달성,true);assert.equal(s.기록[0].타수,550);
s=life();choose(P.profileCard());choose(P.contractCard(),2);assert.equal(P.salary(10000),15000);s.나이++;assert.equal(P.contract(),null);
s=life();choose(P.profileCard());choose(P.contractCard(),3);assert.equal(P.init().다음제안,28);assert.equal(P.card().선수서사,'goal');
s=life();choose(P.contractCard(),0);random=.01;P.endYear({연도:2042});assert.equal(s.수상.at(-1).이름,'통합 우승');const wins=s.수상.length;P.endYear({연도:2042});assert.equal(s.수상.length,wins);
s=life();choose(P.contractCard(),0);random=.99;P.endYear({연도:2042});assert.equal(s.수상.length,0);s.시기='메이저리그';assert.equal(P.contract(),null);assert.equal(P.salary(10000),10000);
// 시즌 도중 무대를 옮겼을 때 목표 보상을 중복 지급하지 않습니다.
s=life();choose(P.profileCard());choose(P.goalCard(),0);s.올해카드=1;E.enterStage('메이저리그');assert.equal(s.선수생활.목표이력[0].결과,'무대 이동으로 종료');assert.equal(P.contract(),null);assert.equal(P.init().진행,null);
// 목표 4종: 기록 경계, 부상 이력, 회복, 한 해 한 번만 보상.
for(const [kind,L,inj,history,expected] of [['record',{홈런:14},0,0,false],['record',{홈런:15},0,0,true],['role',{출전비율:.849},0,0,false],['role',{출전비율:.85},0,0,true],['health',{},0,1,false],['health',{},0,0,true],['recover',{},0,2,true],['recover',null,0,2,false]]){
 s=life();d=P.init();d.목표={scope:'프로:26',값:kind,키:'홈런',목표치:15,이름:kind};s.부상=inj;s.올해부상카드=history;
 P.endYear(L);assert.equal(d.목표.달성,expected,kind);const happy=s.행복도;P.endYear(L);assert.equal(s.행복도,happy);assert.equal(d.목표이력.length,1);
}
// 같은 능력치라도 유형별 기록은 다른 방향으로 변합니다.
for(const id of ['power','contact','speed']){s=life();P.init().유형=id;const L={홈런:20,도루:10,타율:.3,안타:150,타수:500,타점:60};P.adjustLine(L,1);assert.equal(L.홈런,{power:23,contact:19,speed:18}[id]);assert.equal(L.안타,Math.round(L.타수*L.타율));}
const pitcher=GD.포지션.find(p=>p.분류==='투수'),spec=GD.특기.find(t=>t.분류==='투수');
for(const id of ['velocity','control','stamina']){s=life(pitcher.이름,spec.이름);P.init().유형=id;const L={이닝:100,탈삼진:100,평균자책점:3};P.adjustLine(L,1);assert.equal(L.탈삼진,{velocity:107,control:97,stamina:110}[id]);assert.ok(P.specialCard().선택지[0].글);}
// 주전 경쟁과 재활은 3단계 선택을 저장 후에도 기억합니다.
s=life();choose(P.profileCard());s.일군=false;route('role');s=E.state();assert.equal(s.일군,true);assert.ok(s.선수생활.기회);assert.equal(s.선수생활.진행,null);assert.equal(P.playtime(),1.15);
s=life();choose(P.profileCard());route('role',[0,0,0],false);assert.equal(E.state().선수생활.기회,null);
s=life();choose(P.profileCard());s.부상=4;choose(P.routeCard('rehab',0));E.save();E.load();choose(P.routeCard('rehab',1));assert.equal(P.routeCard('rehab',2).선택지[0].확률결과.확률,.85);choose(P.routeCard('rehab',2));assert.equal(E.state().부상,0);
s=life();choose(P.profileCard());choose(P.routeCard('rehab',0),1);choose(P.routeCard('rehab',1),1);assert.equal(P.routeCard('rehab',2).선택지[0].확률결과.확률,.45);choose(P.routeCard('rehab',2),0,false);assert.ok(E.state().부상>0);
s=life();route('rival');assert.equal(P.init().라이벌승,1);assert.equal(P.init().라이벌패,0);assert.ok(P.init().라이벌친밀>=2);
s=life();route('rival',[1,1,0],false);assert.equal(P.init().라이벌패,1);assert.ok(P.init().라이벌친밀<0);
// 메인 인연이 아닌 사람에게 약속 효과가 적용되고, 교제나 양다리를 만들지 않습니다.
for(const keep of [true,false]){
 s=life();s.히로인={아이디:'heroine1',관계:'연인',애정도:70};s.알아가는인연=[{아이디:'heroine2',관계:'만남',애정도:40,교류횟수:0,만남턴:0}];
 choose(P.routeCard('memory',0,'heroine2'));E.save();E.load();choose(P.routeCard('memory',1),keep?0:1);
 s=E.state();assert.equal(s.알아가는인연[0].애정도,keep?50:34);assert.equal(P.init().기억.heroine2.지킴,keep);assert.equal(s.히로인2,undefined);
 assert.match(P.routeCard('memory',2).내용,keep?/와 줬잖아/:/기다리게/);choose(P.routeCard('memory',2));assert.equal(P.init().진행,null);
}
s=life();delete s.선수생활;E.save();assert.ok(E.load());assert.equal(P.init().라이벌승,0,'old save defaults');
s=life();choose(P.profileCard());choose(P.goalCard());d=P.init();d.진행={종류:'memory',단계:1,인물:'heroine6'};d.다음제안=99;P.card();assert.equal(d.진행,null,'unavailable person cancels pending scene');
s=life();choose(P.profileCard());choose(P.goalCard());choose(P.routeCard('role',0));d=P.init();d.다음제안=99;assert.equal(P.card(),null,'ordinary cards separate story chapters');s.시기='은퇴';assert.equal(P.card(),null);
console.log('PASS: six systems, contracts/records, goals/boundaries, linked routes, rival/memory, save migration, stage changes, duplicate clicks, pacing');
