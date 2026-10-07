// 카드 완료에 따른 고정 호감 상승, 여러 인연, 저장·중복 입력 경계를 검사합니다.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),store={};
const math=Object.create(Math);math.random=()=>0.99;
const ctx={console,Math:math,JSON,Date,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}};
ctx.window=ctx;vm.createContext(ctx);
for(const f of [...read('index.html').matchAll(/src="([^"]+\.js)"/g)].map(m=>m[1]).filter(f=>!/ui\.js|panels\.js/.test(f)))vm.runInContext(read(f),ctx,{filename:f});
const {E,GD}=ctx,I=E._internal;
function setup(level=8,rel='만남'){
 E.newGame('호감검사','유격수','수비',{외모:level});const s=E.state();s.시기='프로';s.나이=s.진입나이=25;s.총턴=100;s.시기턴=1;s.올해카드=0;s.대기열=[];s.다음자유나이=99;
 I.attachHeroine('heroine1');s.히로인.관계=rel;s.히로인.애정도=40;return s;
}
function play(extra={},choice={}){const s=E.state();s.현재카드={제목:'호감 검사',내용:'조용히 보낸 하루',선택지:[{글:'계속',결과:'하루가 지났다.',...choice}],...extra};s.단계='카드';E.refreshOptions();return E.choose(0);}
for(let level=1;level<=10;level++)for(const rel of ['만남','연인','배우자']){
 const s=setup(level,rel),gain=level>=8?2:level>=4?1:0;
 I.attachHeroine('heroine4'); // 연애 중에는 보조 인연으로, 만남 중에는 현재 인연으로 들어갑니다.
 const bonds=[s.히로인,...s.알아가는인연];bonds.forEach(h=>h.애정도=40);
 s.히로인2={아이디:'heroine5',관계:'연인',애정도:40};
 const main=s.히로인;play();
 assert.equal(main.애정도,40+(gain||-(main.관계==='만남'?1:2)));
 assert.equal(s.알아가는인연[0].애정도,40+gain);
 assert.equal(s.히로인2.애정도,40+(gain||-2));
 assert.ok(bonds.every(h=>(h.교류횟수||0)===0));assert.equal(E.canConfess(),false);
 const saved=JSON.stringify(s);E.choose(0);assert.equal(JSON.stringify(s),saved);E.save();E.load();assert.equal(JSON.stringify(E.state()),saved);
}
{
 const s=setup(8);s.히로인.애정도=99;play({히로인:'누구나'});assert.equal(s.히로인.애정도,100);
 s.히로인.애정도=40;play({시스템:true});assert.equal(s.히로인.애정도,42);
 s.히로인.애정도=40;play({히로인:'누구나'},{효과:{애정도:-10}});assert.equal(s.히로인.애정도,32);
 play({히로인:'누구나'},{관계:'이별'});assert.equal(s.히로인,null);assert.equal(s.지난히로인.length,1);
}
{
 const s=setup(8,'연인');s.시기='메이저리그';s.플래그.장거리=true;play({}, {집중:true});assert.equal(s.히로인.애정도,37); // 40 - 집중3 - 장거리2 + 미남2
}
for(const level of [4,8]){
 const s=setup(level),gain=level===8?2:1;
 s.자유시간={화면:'메뉴'};s.현재카드=E.freeTimeCard();s.단계='카드';E.refreshOptions();E.choose(1);E.next();
 assert.equal(s.히로인.애정도,40);assert.equal(s.총턴,100);
 E.next();assert.equal(s.히로인.애정도,40); // 같은 화면을 다시 그려도 상승하지 않음
 s.자유시간={화면:'메뉴'};s.현재카드=E.freeTimeCard();s.단계='카드';E.refreshOptions();E.choose(3);
 assert.equal(s.히로인.애정도,40+gain);assert.equal(s.총턴,101);
 const saved=JSON.stringify(s);E.choose(3);assert.equal(JSON.stringify(s),saved);E.load();assert.equal(JSON.stringify(E.state()),saved);
}
console.log('PASS: 외모 1~10 / 모든 관계·다중 인연 / 카드·자유행동 1회 상승 / 기본 감소 대체 / 선택·장거리·집중 효과 / 상한100 / 교류·고백 유지 / 중복·저장');
