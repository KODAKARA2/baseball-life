const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),H=require('./helpers/browser');
const out=process.argv[2]||path.join(require('node:os').tmpdir(),'baseball-more');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(await H.url());await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()));
  const names=['miniFly','miniBunt','miniDiscipline','miniDefense'];
  async function start(name,intro=true){await page.evaluate(name=>{Math.random=()=>.5;window.results=[];window.cancelMini=U[name](r=>results.push(r));},name);if(intro)await page.clock.runFor(720);}
  async function result(p,wait=1700){await page.clock.runFor(wait);assert.deepEqual(await page.evaluate(()=>results.map(r=>r.확률)),[p]);assert.equal(await page.locator('.mg-wrap').count(),0);}
  for(const [offset,p] of [[0,.95],[.06,.7],[.12,.3],[.25,.05]]){
   await start('miniFly');const final=.76+.05*Math.sin(3.2*2.3+Math.PI),hold=Math.round((final+offset-.5)/.5*1000);
   await page.keyboard.down('ArrowRight');await page.clock.runFor(hold);await page.keyboard.up('ArrowRight');await page.clock.runFor(3220-hold);await result(p);
  }
  for(const [offset,p] of [[0,.95],[.06,.7],[.12,.3],[.24,.05]]){
   await start('miniBunt');await page.keyboard.down('Space');await page.clock.runFor(Math.round((.525+offset)*1500));await page.keyboard.up('Space');await page.keyboard.press('Space');await result(p);
  }
  // 실제 마우스 hold/release와 포인터 취소.
  await start('miniBunt');await page.locator('.bunt-hold').hover();await page.mouse.down();await page.clock.runFor(790);await page.mouse.up();await result(.95);
  await start('miniBunt');const cdp=await page.context().newCDPSession(page),button=await page.locator('.bunt-hold').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2}]});await page.clock.runFor(790);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await result(.95);
  await start('miniBunt');await page.locator('.bunt-hold').dispatchEvent('pointerdown',{isPrimary:true,button:0,pointerId:3});await page.locator('.bunt-hold').dispatchEvent('pointercancel',{pointerId:3});await result(.05);
  for(const name of ['miniDiscipline','miniDefense'])for(let count=0;count<=3;count++){
   await start(name);if(name==='miniDiscipline'){await page.keyboard.press('1');assert.equal(await page.locator('[data-answer]:disabled').count(),2);await page.clock.runFor(670);}
   for(let i=0;i<3;i++){
    const correct=await page.evaluate(name=>name==='miniDiscipline'?(parseFloat(document.querySelector('.eye-ball').style.left)>30&&parseFloat(document.querySelector('.eye-ball').style.left)<70?0:1):({0:0,1:1,3:2}[document.querySelectorAll('.defense-base.occupied').length]),name);
    const answer=i<count?correct:(correct+1)%(name==='miniDiscipline'?2:3);
    if(i===0)await page.locator('[data-answer="'+answer+'"]').click();else await page.keyboard.press(String(answer+1));
    await page.keyboard.press(String(answer+1)); // 같은 라운드의 연타는 무시.
    if(i<2)await page.clock.runFor(name==='miniDiscipline'?1190:540);
   }
   await result([.05,.3,.7,.95][count],2300);
  }
  for(const name of names){
   await start(name);await result(.05,14000);
   await start(name);await page.evaluate(()=>cancelMini());await page.clock.runFor(16000);assert.equal(await page.evaluate(()=>results.length),0);
   await start(name,false);await page.clock.runFor(480);await page.keyboard.down('Space');await page.clock.runFor(1000);assert.equal(await page.locator('.mg-wrap').count(),0,'intro must wait for held input');await page.keyboard.up('Space');await page.clock.runFor(220);assert.equal(await page.locator('.mg-wrap').count(),1);await page.evaluate(()=>cancelMini());
  }
  // 연습장에서는 저장/선수 상태를 바꾸지 않고 취소와 다시 시작이 됩니다.
  await page.evaluate(()=>{E.newGame('연습검사','유격수','수비');U.showGame();});
  const saved=await page.evaluate(()=>JSON.stringify({state:E.state(),storage:{...localStorage}}));
  await page.evaluate(()=>U.openPractice());assert.equal(await page.locator('[data-game]').count(),10);
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:844});
   for(const key of ['fly','bunt','discipline','defense']){
    await page.locator('[data-game="'+key+'"]').click();await page.locator('.practice-start').click();await page.clock.runFor(720);
    assert.equal(await page.locator('.mg').evaluate(e=>e.scrollWidth>e.clientWidth),false,key+width);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(width===390)await page.screenshot({path:path.join(out,key+'.png'),animations:'disabled'});
    await page.keyboard.press('Escape');await page.clock.runFor(16000);assert.equal(await page.locator('.mg-wrap').count(),0);
   }
  }
  await page.locator('[data-game="bunt"]').click();await page.locator('.practice-start').click();await page.clock.runFor(720);await page.keyboard.down('Space');await page.clock.runFor(790);await page.keyboard.up('Space');await page.clock.runFor(1700);assert.match(await page.locator('.practice-last').innerText(),/95%/);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.stringify({state:E.state(),storage:{...localStorage}})),saved);
  // 새 네 게임의 결과가 본편 카드에 한 번만 전달됩니다.
  for(const name of names){
   await page.evaluate(name=>{E.newGame('본편검사','유격수','수비');const s=E.state(),c=E._internal.CARDS().find(c=>c.선택지.some(o=>o.미니게임&&o.확률결과&&!o.조건));s.현재카드=c;s.현재옵션=[c.선택지.findIndex(o=>o.미니게임&&o.확률결과&&!o.조건)];U.miniGame=cb=>U[name](cb);U.showGame();},name);
   await page.clock.runFor(700);await page.locator('.opt').first().click();const turns=await page.evaluate(()=>E.state().총턴);await page.clock.runFor(16000);assert.equal(await page.evaluate(()=>E.state().결과.미니게임.확률),.05);assert.equal(await page.evaluate(()=>E.state().총턴),turns+1);
  }
  assert.deepEqual(errors,[]);console.log('PASS: new 4 games x 4 grades; keyboard/pointer/timeout/duplicate/cancel/intro; 10-game practice/save; 320/390/1280; story results; '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
