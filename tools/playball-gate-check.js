const assert=require('node:assert/strict'),{chromium}=require('playwright'),H=require('./helpers/browser');
(async()=>{const browser=await chromium.launch(H.launchOptions());try{
for(const width of [320,390,1280]){
const page=await browser.newPage({viewport:{width,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(await H.url());await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()));
const cdp=await page.context().newCDPSession(page);
async function start(name='miniThrow'){await page.evaluate(name=>{Math.random=()=>.5;window.results=[];window.cancelGame=U[name](r=>results.push(r));},name);}
const count=()=>page.locator('.mg-wrap').count();
await start();await page.locator('.baseball-playball img').evaluate(i=>i.decode());assert.equal(await page.locator('.baseball-playball button').count(),0);assert.equal(await page.locator('.baseball-playball strong').innerText(),'플레이볼!');assert.equal(await page.locator('.baseball-playball img').evaluate(i=>getComputedStyle(i).objectFit),'contain');await page.screenshot({path:'/tmp/playball-fix-'+width+'.png'});await page.clock.runFor(499);assert.equal(await count(),0);await page.clock.runFor(1);assert.equal(await page.locator('.baseball-playball-panel').isVisible(),false);await page.clock.runFor(219);assert.equal(await count(),0);await page.clock.runFor(1);assert.equal(await count(),1);await page.evaluate(()=>cancelGame());
// Actual old-button-area input immediately before/during/after picture removal.
for(const name of ['miniTimer','miniBat','miniPitch','miniSteal','miniThrow','miniSigns']){
for(const mode of ['mouse','touch','Space','Enter'])for(const offset of [-1,0,1]){
await start(name);await page.clock.runFor(500+offset);
const x=width/2,y=550;
if(mode==='mouse'){await page.mouse.move(x,y);await page.mouse.down();}
else if(mode==='touch'){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});}
else await page.keyboard.down(mode);
await page.clock.runFor(900);assert.equal(await count(),0,name+' held '+mode);
if(mode==='mouse')await page.mouse.up();else if(mode==='touch')await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.keyboard.up(mode);
await page.clock.runFor(219);assert.equal(await count(),0);await page.clock.runFor(1);assert.equal(await count(),1);
assert.equal(await page.locator('.mg-wrap[data-judged]').count(),0);assert.equal(await page.evaluate(()=>results.length),0);
// Stale compatibility click, orphan release and key-repeat cannot judge the new scene.
await page.evaluate(()=>{const target=document.querySelector('.mg-ball')||document.querySelector('.mg');target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));target.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));target.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:' ',code:'Space',repeat:true}));});
assert.equal(await page.locator('.mg-wrap[data-judged]').count(),0);assert.equal(await page.evaluate(()=>results.length),0);
// First genuinely new down/key reaches the game at once; no extra waiting phase.
await page.evaluate(()=>{window.fresh=0;const m=document.querySelector('.mg');m.addEventListener('pointerdown',()=>fresh++,{once:true});m.addEventListener('keydown',()=>fresh++,{once:true});});
if(mode==='Space'||mode==='Enter')await page.keyboard.press(mode);else{const r=await page.locator(name==='miniTimer'?'.mg-ball':'.mg').boundingBox();if(mode==='touch')await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);else await page.mouse.click(r.x+r.width/2,r.y+r.height/2);}
assert.equal(await page.evaluate(()=>fresh),1,name+' first fresh '+mode);await page.evaluate(()=>cancelGame());await page.clock.runFor(16000);assert.equal(await page.evaluate(()=>results.length),0);
}
}
// Rapid presses around automatic transition keep the game clock stopped.
await start('miniTimer');await page.clock.runFor(500);for(let i=0;i<4;i++){await page.touchscreen.tap(width/2,550);await page.clock.runFor(100);assert.equal(await count(),0);}await page.clock.runFor(120);assert.equal(await count(),1);assert.equal(await page.locator('.mg-time').innerText(),'5.00');await page.evaluate(()=>cancelGame());
for(const method of ['cancel','remove','hide','escape']){await start();if(method==='escape')await page.keyboard.press('Escape');else await page.evaluate(method=>{if(method==='cancel')cancelGame();if(method==='remove')document.querySelector('.baseball-playball').remove();if(method==='hide'){Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;}},method);await page.clock.runFor(2000);assert.equal(await count(),0);assert.equal(await page.locator('.baseball-playball').count(),0);}
await page.evaluate(()=>document.documentElement.dataset.reducedMotion='true');await start();await page.clock.runFor(469);assert.equal(await count(),0);await page.clock.runFor(1);assert.equal(await count(),1);await page.evaluate(()=>cancelGame());
await page.route('**/playball-generated.png',r=>r.abort());await start();await page.waitForFunction(()=>document.querySelector('.baseball-playball img').hidden);assert.equal(await page.locator('.baseball-playball img').evaluate(i=>getComputedStyle(i).display),'none');await page.clock.runFor(470);assert.equal(await count(),1);await page.evaluate(()=>cancelGame());
await page.evaluate(()=>U.openPractice());await page.locator('.practice-start').click();await page.keyboard.press('Escape');assert(await page.locator('.practice-start').isVisible());assert.match(await page.locator('.practice-score').innerText(),/첫 연습/);await page.keyboard.press('Escape');
await page.evaluate(()=>{E.newGame('경계검사','유격수','수비');const s=E.state(),c=E._internal.CARDS().find(c=>c.선택지.some(o=>o.미니게임&&o.확률결과&&!o.조건));s.현재카드=c;s.현재옵션=[c.선택지.findIndex(o=>o.미니게임&&o.확률결과&&!o.조건)];U.showGame();window.before=JSON.stringify(E.state());});await page.clock.runFor(700);await page.locator('.opt').first().click();await page.keyboard.press('Escape');await page.clock.runFor(16000);assert.equal(await page.evaluate(()=>JSON.stringify(E.state())),await page.evaluate(()=>before));
await start('miniBat');await start('miniThrow');assert.equal(await page.locator('.baseball-playball').count(),1);await page.clock.runFor(470);assert.equal(await page.locator('.throw-field').count(),1);await page.evaluate(()=>cancelGame());assert.deepEqual(errors,[]);await page.close();}
console.log('PASS 216 real-input boundary cases: 6 games x 3 widths x mouse/touch/Space/Enter x before/during/after; held/repeated/orphan input, fresh first input, full timer, cancel/restart/hide/reduced/image failure/story preservation.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
