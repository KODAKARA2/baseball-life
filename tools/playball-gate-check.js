// Integrated playball start-gate lifecycle and generated-art checks.
const assert=require('node:assert/strict'),{chromium}=require('playwright'),H=require('./helpers/browser');
(async()=>{const browser=await chromium.launch(H.launchOptions());try{
for(const width of [320,390,1280]){
const page=await browser.newPage({viewport:{width,height:844},hasTouch:true});await page.goto(await H.url());await page.clock.install();await page.clock.pauseAt(new Date());
async function gate(){await page.evaluate(()=>{window.started=0;window.canceled=0;window.cancelGate=BaseballPlayball.run(()=>{started++;return()=>canceled++;});});}
await gate();await page.locator('.baseball-playball img').evaluate(i=>i.decode());
assert.equal(await page.locator('.baseball-playball img').evaluate(i=>getComputedStyle(i).objectFit),'contain');
assert.equal(await page.locator('.baseball-playball strong').innerText(),'플레이볼!');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.screenshot({path:'/tmp/playball-'+width+'.png'});
await page.clock.runFor(849);assert.equal(await page.evaluate(()=>started),0);await page.clock.runFor(181);assert.equal(await page.evaluate(()=>started),1);await page.evaluate(()=>cancelGate());assert.equal(await page.evaluate(()=>canceled),1);
await gate();await page.keyboard.down('Space');await page.clock.runFor(1500);assert.equal(await page.evaluate(()=>started),0);await page.keyboard.up('Space');await page.clock.runFor(179);assert.equal(await page.evaluate(()=>started),0);await page.clock.runFor(1);assert.equal(await page.evaluate(()=>started),1);
await gate();await page.locator('[data-start]').tap();await page.locator('[data-start]').tap();await page.clock.runFor(180);assert.equal(await page.evaluate(()=>started),1);
for(const method of ['cancel','remove','hide','escape','close']){await gate();if(method==='escape')await page.keyboard.press('Escape');else if(method==='close'){await page.locator('[data-close]').focus();await page.keyboard.press('Enter');}else await page.evaluate(method=>{if(method==='cancel')cancelGate();if(method==='remove')document.querySelector('.baseball-playball').remove();if(method==='hide'){Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;}},method);await page.clock.runFor(2000);assert.equal(await page.evaluate(()=>started),0);assert.equal(await page.locator('.baseball-playball').count(),0);}
await page.evaluate(()=>document.documentElement.dataset.reducedMotion='true');await gate();await page.clock.runFor(529);assert.equal(await page.evaluate(()=>started),0);await page.clock.runFor(1);assert.equal(await page.evaluate(()=>started),1);
// Each real minigame is created only after the gate. The skip key must not judge it.
for(const name of ['miniTimer','miniBat','miniPitch','miniSteal','miniThrow','miniSigns']){await page.evaluate(name=>{window.rewards=0;window.cancelGate=U[name](()=>rewards++);},name);assert.equal(await page.locator('.mg-wrap').count(),0);await page.keyboard.press('Space');assert.equal(await page.locator('.mg-wrap').count(),0);await page.clock.runFor(180);assert.equal(await page.locator('.mg-wrap').count(),1);assert.equal(await page.locator('.mg-wrap[data-judged]').count(),0);await page.evaluate(()=>cancelGate());await page.clock.runFor(15000);assert.equal(await page.evaluate(()=>rewards),0);assert.equal(await page.locator('.mg-wrap').count(),0);}
// Failure to load art still permits starting; no synthetic sound is added by the intro.
await page.route('**/playball-generated.png',r=>r.abort());
await page.evaluate(()=>{window.sfx=0;Feedback.play=()=>sfx++;Feedback.cue=()=>sfx++;});
await gate();await page.waitForFunction(()=>document.querySelector('.baseball-playball img').hidden);await page.clock.runFor(530);assert.equal(await page.evaluate(()=>started),1);assert.equal(await page.evaluate(()=>sfx),0);
// Cancel from the practice gate restores practice without scoring a round.
await page.evaluate(()=>U.openPractice());await page.locator('.practice-start').click();await page.keyboard.press('Escape');
assert(await page.locator('.practice-start').isVisible());assert.match(await page.locator('.practice-score').innerText(),/첫 연습/);
await page.locator('.practice-start').click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});
assert(await page.locator('.practice-start').isVisible());await page.keyboard.press('Escape');
// Canceling a real card's intro must not choose the card or grant rewards.
await page.evaluate(()=>{E.newGame('개시검사','유격수','수비');const s=E.state(),c=E._internal.CARDS().find(c=>c.선택지.some(o=>o.미니게임&&o.확률결과&&!o.조건));s.현재카드=c;s.현재옵션=[c.선택지.findIndex(o=>o.미니게임&&o.확률결과&&!o.조건)];U.showGame();window.savedBefore=JSON.stringify(E.state());});
await page.clock.runFor(700);await page.locator('.opt').first().click();await page.keyboard.press('Escape');await page.clock.runFor(12000);
assert.equal(await page.evaluate(()=>JSON.stringify(E.state())),await page.evaluate(()=>savedBefore));
await page.locator('.opt').first().click();assert.equal(await page.locator('.baseball-playball').count(),1);await page.keyboard.press('Escape');
// Restart replaces the pending gate; only the latest game may start.
await page.evaluate(()=>{window.old=0;window.latest=0;BaseballPlayball.run(()=>{old++;});BaseballPlayball.run(()=>{latest++;});});await page.clock.runFor(530);assert.deepEqual(await page.evaluate(()=>[old,latest]),[0,1]);
await page.close();}
console.log('PASS integrated gate logic: 320/390/1280, touch/key, hold/repeat/cancel/remove/hide/reduced; six real minigames deferred and canceled without callbacks. Generated image displayed with contain.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
