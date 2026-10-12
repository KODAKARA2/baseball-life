const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),store={};
const ctx={console,Math,JSON,Date,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}};ctx.window=ctx;vm.createContext(ctx);
for(const [,f]of read('index.html').matchAll(/src="([^"]+\.js)"/g))if(!/ui\.js|panels\.js/.test(f))vm.runInContext(read(f),ctx,{filename:f});
const E=ctx.E,keys=['baseball-life-save-v1','baseball-life-collection','baseball-life-bonus-looks'],active=()=>JSON.stringify(keys.map(k=>store[k]??null));
function game(pos='유격수',spec='수비'){E.newGame('이전 선수',pos,spec,{외모:5});}
function show(){const s=E.state();s.자유시간={화면:'메뉴'};s.현재카드=E.freeTimeCard();s.단계='카드';E.refreshOptions();}
for(const p of ctx.GD.포지션){const spec=ctx.GD.특기.find(t=>E._internal.POS_STATS[p.분류].includes(t.능력치));game(p.이름,spec.이름);E.previewImport(E.exportSave());}
game();E.story.init();store[keys[1]]=JSON.stringify({엔딩:{test:{처음:Date.now(),횟수:1}},인생수:1});store[keys[2]]=JSON.stringify({이어하기:{아버지:'이전 선수',외모:5,돈:200,세대:2}});
let raw=E.exportSave(),before=active(),state=JSON.stringify(E.state());E.previewImport(raw);assert.equal(active(),before);assert.equal(JSON.stringify(E.state()),state);
for(const bad of ['{','x'.repeat(2097153),raw.replace('baseball-life-transfer','football-life-transfer'),raw.replace('"version": 1','"version": 99'),raw.replace('이전 선수','<img src=x>'),raw.replace('"career": {','"career": {"__proto__":{},')]){assert.throws(()=>E.importSave(bad));assert.equal(active(),before);assert.equal(JSON.stringify(E.state()),state);}
for(const mutate of [b=>b.career.선수생활.목표이력='broken',b=>b.career.선수생활.기억={unknown:{}},b=>{b.career.단계='결과';b.career.결과={알림:'broken'};},b=>b.career.현재옵션=[9999]]){const b=JSON.parse(raw);mutate(b);assert.throws(()=>E.importSave(JSON.stringify(b)));assert.equal(active(),before);}
let bundle=JSON.parse(raw);bundle.career.능력치.수비='broken';assert.throws(()=>E.importSave(JSON.stringify(bundle)));assert.equal(active(),before);
bundle=JSON.parse(raw);bundle.career.이름='가져온 선수';E.importSave(JSON.stringify(bundle));assert.equal(E.state().이름,'가져온 선수');assert.equal(JSON.parse(E.recoverySave()).career.이름,'이전 선수');E.importSave(E.recoverySave());assert.equal(E.state().이름,'이전 선수');
// Preserve existing v1 load migrations, including old story-free saves.
bundle=JSON.parse(raw);delete bundle.career.선수생활;delete bundle.career.알아가는인연;E.importSave(JSON.stringify(bundle));assert.equal(E.story.init().버전,1);
// Every write boundary: active keys and in-memory state survive a quota failure.
for(let failAt=1;failAt<=5;failAt++) {before=active();state=JSON.stringify(E.state());const set=ctx.localStorage.setItem;let calls=0;ctx.localStorage.setItem=(k,v)=>{if(++calls===failAt)throw new Error('QuotaExceededError');set(k,v);};assert.throws(()=>E.importSave(raw));ctx.localStorage.setItem=set;assert.equal(active(),before);assert.equal(JSON.stringify(E.state()),state);}
const set=ctx.localStorage.setItem;ctx.localStorage.setItem=()=>{throw new Error('QuotaExceededError');};E.state().이름='미저장 진행';assert.equal(E.save(),false);assert.equal(JSON.parse(E.exportSave()).career.이름,'미저장 진행');ctx.localStorage.setItem=set;
// Import into an empty device and collections-only transfers.
E.importSave(JSON.stringify({format:'baseball-life-transfer',version:1,career:null,collection:null,bonus:null}));assert.equal(E.state(),null);E.importSave(raw);assert.equal(E.state().이름,'이전 선수');
// Direct drills, back, reload, caps, invalid selection and one-time reward.
for(const [pos,spec] of [['유격수','수비'],['선발투수','제구']]){
 game(pos,spec);let s=E.state();show();const turn=s.총턴,age=s.나이,stats=JSON.stringify(s.능력치);E.choose(0);E.next();assert.equal(s.자유시간.화면,'연습');assert.equal(s.총턴,turn);assert.equal(JSON.stringify(s.능력치),stats);
 E.choose(s.현재옵션.length-1);E.next();assert.equal(s.자유시간.화면,'메뉴');assert.equal(s.총턴,turn);E.choose(0);E.next();E.save();assert.ok(E.load());s=E.state();assert.equal(s.자유시간.화면,'연습');
 const key=E.posStats()[1],index=s.현재옵션.findIndex(i=>s.현재카드.선택지[i].훈련능력===key),old=s.능력치[key];E.choose(index);assert.equal(s.능력치[key],old+1);assert.equal(s.총턴,turn+1);assert.equal(s.나이,age);const finished=JSON.stringify(s);E.choose(index);assert.equal(JSON.stringify(s),finished);
 show();E.posStats().forEach(k=>s.능력치[k]=E.cap());E.choose(0);E.next();assert.equal(s.현재카드.선택지[0].훈련능력,'멘탈');s.능력치.멘탈=99;E.choose(0);assert.equal(s.능력치.멘탈,100);show();E.choose(0);E.next();assert.equal(s.현재옵션.length,1);assert.equal(s.현재카드.선택지[0].화면,'메뉴');
}
// Full lives cover baseball season rows, story records, result and ending envelopes.
for(let n=0;n<12;n++){game();for(let t=0;t<600&&E.state().단계!=='엔딩';t++){E.previewImport(E.exportSave());if(E.state().단계==='카드')E.choose(0);else E.next();}E.previewImport(E.exportSave());}
console.log('PASS save roundtrip / old v1 / all positions / invalid files / quota rollback / current memory export / selected drills / cap / back / duplicate / 12 careers');
