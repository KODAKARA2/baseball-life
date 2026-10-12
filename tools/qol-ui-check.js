const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),H=require('./helpers/browser');
const out=process.argv[2]||'/tmp/baseball-qol-ui';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(H.launchOptions());try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(await H.url());
 await page.evaluate(()=>{E.newGame('파일 선수','유격수','수비',{외모:5});E.story.init().라이벌승=2;localStorage.setItem('baseball-life-bonus-looks','10');U.showGame();});
 const state=await page.evaluate(()=>JSON.stringify(E.state())),raw=await page.evaluate(()=>E.exportSave());
 const upload=async(text=raw)=>page.locator('.import-save').setInputFiles({name:'career.json',mimeType:'application/json',buffer:Buffer.from(text)});
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>U.openSave());await upload();
  assert.match(await page.locator('.save-preview').innerText(),/파일 선수.*유격수/);
  assert.equal(await page.evaluate(()=>JSON.stringify(E.state())),state);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('.save-modal .sheet').evaluate(e=>e.scrollWidth>e.clientWidth),false);
  await page.locator('.save-preview button').last().tap();assert.equal(await page.locator('.save-preview button').count(),0);
  await upload();await page.locator('.save-preview button').first().waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('.save-modal').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('.save-modal').count(),0);
 }
 await page.evaluate(()=>U.openSave());await upload();await upload('{');assert.equal(await page.locator('.save-preview button').count(),0);assert.match(await page.locator('.save-status').innerText(),/실패/);
 await page.locator('.import-save').setInputFiles({name:'large.json',mimeType:'application/json',buffer:Buffer.alloc(2097153)});assert.match(await page.locator('.save-status').innerText(),/2MB/);
 const downloadPromise=page.waitForEvent('download');await page.locator('.export-save').click();const download=await downloadPromise;await download.saveAs(path.join(out,'export.json'));assert.equal(JSON.parse(fs.readFileSync(path.join(out,'export.json'),'utf8')).career.이름,'파일 선수');
 await page.keyboard.press('Escape');await page.evaluate(()=>{E.reset();U.showSetup();});await page.getByRole('button',{name:'저장 이동·복구',exact:true}).click();await upload();
 await page.locator('.save-preview button').first().click();assert.equal(await page.evaluate(()=>E.story.init().라이벌승),2);await page.reload();assert.equal(await page.evaluate(()=>E.state().이름),'파일 선수');
 // Real quota failure keeps play alive and exports current memory.
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};E.state().이름='저장 실패 이후';E.save();});assert.match(await page.locator('#save-error').innerText(),/실패/);assert.equal(await page.evaluate(()=>JSON.parse(E.exportSave()).career.이름),'저장 실패 이후');
 await page.evaluate(()=>{Storage.prototype.setItem=originalSet;E.save();U.openSave();});await upload();await page.locator('.save-preview button').first().dblclick();assert.equal(await page.evaluate(()=>E.state().이름),'파일 선수');assert.equal(await page.evaluate(()=>E.state().단계),'카드');assert.equal(await page.evaluate(()=>JSON.parse(E.recoverySave()).career.이름),'저장 실패 이후');
 await page.evaluate(()=>U.openSave());await page.locator('.recover-save').click();await page.locator('.save-preview button').first().click();assert.equal(await page.evaluate(()=>E.state().이름),'저장 실패 이후');
 // Sound/motion preferences remain local across import and practice.
 await page.waitForFunction(()=>!document.querySelector('.save-transition'));await page.evaluate(()=>Feedback.settings());await page.locator('[name=muted]').check();await page.locator('[name=reduced]').check();await page.keyboard.press('Escape');const prefs=await page.evaluate(()=>localStorage.getItem('baseball-life-feedback-v1'));
 await page.evaluate(raw=>E.importSave(raw),raw);assert.equal(await page.evaluate(()=>localStorage.getItem('baseball-life-feedback-v1')),prefs);assert.equal(await page.locator('html').getAttribute('data-reduced-motion'),'true');
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>{const s=E.state();s.자유시간={화면:'메뉴'};s.현재카드=E.freeTimeCard();s.단계='카드';E.refreshOptions();U.showGame();});
  const turn=await page.evaluate(()=>E.state().총턴);await page.locator('#actions .opt').first().dblclick();assert.equal(await page.evaluate(()=>E.state().총턴),turn);assert.equal(await page.evaluate(()=>E.state().자유시간.화면),'연습');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'training-'+width+'.png'),fullPage:true});
  await page.locator('#actions .opt').last().click();assert.equal(await page.evaluate(()=>E.state().자유시간.화면),'메뉴');
  await page.locator('#actions .opt').first().click();await page.reload();assert.equal(await page.evaluate(()=>E.state().자유시간.화면),'연습');
  await page.locator('#actions .opt').first().dblclick();assert.equal(await page.evaluate(()=>E.state().총턴),turn+1);
 }
 await page.evaluate(()=>U.openSave());await upload();await page.screenshot({path:path.join(out,'save-preview.png'),fullPage:true});await page.keyboard.press('Escape');await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);console.log('PASS real downloads / setup import / preview & cancel / stale preview / quota / recovery / local preferences / touch / training back-reload-double-click / 320-390-1280');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
