const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),H=require('./helpers/browser');
const out=process.argv[2]||'/tmp/baseball-clarity-ui';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(H.launchOptions());try{
for(const width of [320,390,1280])for(const reduced of [false,true]){
 const page=await browser.newPage({viewport:{width,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(await H.url());await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()));
 await page.evaluate(reduced=>{E.newGame('안내 검사','유격수','수비');U.showGame();document.documentElement.dataset.reducedMotion=String(reduced);},reduced);
 const original=await page.evaluate(()=>JSON.stringify({state:E.state(),storage:{...localStorage}}));
 for(const [key,name]of [['bat','miniBat'],['pitch','miniPitch'],['timer','miniTimer'],['steal','miniSteal'],['throw','miniThrow'],['signs','miniSigns'],['fly','miniFly'],['bunt','miniBunt'],['discipline','miniDiscipline'],['defense','miniDefense']]){
  await page.evaluate(name=>{window.results=[];window.aborts=0;window.cancelGuide=U.guideMini(name,()=>U[name](r=>results.push(r)),()=>aborts++);},name);
  assert.equal(await page.locator('.mini-guide').count(),1);await page.clock.runFor(20000);assert.equal(await page.locator('.mg-wrap,.baseball-playball').count(),0);assert.equal(await page.evaluate(()=>results.length),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('.mini-guide .sheet').evaluate(e=>e.scrollWidth>e.clientWidth),false);
  if(width===390&&!reduced&&key==='bunt')await page.screenshot({path:path.join(out,'guide.png')});
  // Cancel before confirmation: no timer, reward or learned-guide flag.
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>aborts),1);assert.equal(await page.locator('.mini-guide').count(),0);
  await page.evaluate(name=>{window.cancelGuide=U.guideMini(name,()=>U[name](r=>results.push(r)),()=>aborts++);},name);
  if(key==='timer'){await page.locator('.guide-start').focus();await page.keyboard.down('Enter');await page.clock.runFor(1500);assert.equal(await page.locator('.baseball-playball,.mg-wrap').count(),0);await page.keyboard.up('Enter');}else{await page.locator('.guide-start').dblclick();}assert.equal(await page.locator('.mini-guide').count(),0);assert.equal(await page.locator('.baseball-playball').count(),1);
  // Repeated/held input across automatic PLAY BALL removal keeps the game unborn.
  await page.keyboard.down('Space');await page.clock.runFor(1500);assert.equal(await page.locator('.mg-wrap').count(),0);await page.keyboard.up('Space');await page.clock.runFor(219);assert.equal(await page.locator('.mg-wrap').count(),0);await page.clock.runFor(1);assert.equal(await page.locator('.mg-wrap').count(),1);assert.equal(await page.evaluate(()=>results.length),0);
  if(key==='timer')assert.equal(await page.locator('.mg-time').innerText(),'5.00');
  await page.evaluate(()=>cancelGuide());await page.clock.runFor(16000);assert.equal(await page.evaluate(()=>results.length),0);
  await page.evaluate(name=>{window.cancelGuide=U.guideMini(name,()=>U[name](r=>results.push(r)),()=>aborts++);},name);assert.equal(await page.locator('.mini-guide').count(),0);await page.clock.runFor(reduced?470:720);assert.equal(await page.locator('.mg-wrap').count(),1);await page.evaluate(()=>cancelGuide());
 }
 assert.equal(await page.evaluate(()=>JSON.stringify({state:E.state(),storage:{...localStorage}})),original);
 // Real career selection uses the guide, cancellation is free, one result is saved once.
 await page.reload();await page.evaluate(()=>{E.load();const s=E.state();s.현재카드={제목:'승부 검사',내용:'한 번만',시스템:true,선택지:[{글:'승부',미니게임:true,확률결과:{성공:{결과:'성공',효과:{돈:10}},실패:{결과:'실패',효과:{돈:1}}}}]};s.단계='카드';E.refreshOptions();U.showGame();});
 const state=await page.evaluate(()=>JSON.stringify(E.state()));await page.locator('.opt').click();await page.clock.runFor(20000);assert.equal(await page.evaluate(()=>JSON.stringify(E.state())),state);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.stringify(E.state())),state);
 await page.locator('.opt').click();await page.locator('.guide-start').tap();await page.clock.runFor(20000);assert.equal(await page.evaluate(()=>E.state().단계),'결과');assert.equal(await page.locator('.outcome').count(),1);const finished=await page.evaluate(()=>JSON.stringify(E.state()));await page.evaluate(()=>U.choose(0));assert.equal(await page.evaluate(()=>JSON.stringify(E.state())),finished);await page.reload();assert.equal(await page.locator('.outcome').count(),1);
 await page.evaluate(()=>{const s=E.state();s.시기='프로';s.연차=3;s.나이=24;s.일군=false;E.posStats().forEach(k=>s.능력치[k]=47);U.openPlayerJournal();});assert.match(await page.locator('.career-progress').innerText(),/평균 47 \/ 48/);assert.match(await page.locator('.career-progress').innerText(),/보장하지/);assert.equal(await page.locator('.career-progress').evaluate(e=>e.scrollWidth>e.clientWidth),false);if(width===390&&!reduced)await page.screenshot({path:path.join(out,'career-progress.png')});
 assert.deepEqual(errors,[]);await page.close();
}
console.log('PASS 10 first-time guides x 3 sizes x normal/reduced; no auto start while reading; double/held input gate; cancel/repeat/full timer; career result once/reload; actual career hints');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
