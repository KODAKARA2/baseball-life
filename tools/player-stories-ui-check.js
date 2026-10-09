// node tools/player-stories-ui-check.js [screenshot-dir] [preview-url]
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const out=process.argv[2]||path.join(require('node:os').tmpdir(),'player-stories-ui'),url=process.argv[3]||'http://127.0.0.1:8772/';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('[data-demo="type"]').waitFor();
  async function scene(kind){await page.locator('.story-demo').evaluate(e=>e.open=true);await page.locator('[data-demo="'+kind+'"]').click();await page.locator('#actions .opt').first().waitFor();}
  for(const kind of ['type','goal','role','rehab','rival','memory','contract','pitcher']){
   await scene(kind);
   for(const width of [320,390,1280]){
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,kind+width);
    assert.equal(await page.locator('#actions .opt').evaluateAll(bs=>bs.some(b=>b.scrollWidth>b.clientWidth)),false,kind+' buttons');
   }
   await page.setViewportSize({width:390,height:844});
   if(kind==='contract')assert.match(await page.locator('#actions').innerText(),/출전량 70%.*연봉 85%/);
   if(['memory','contract','type'].includes(kind))await page.screenshot({path:path.join(out,kind+'.png'),fullPage:true});
   const card=await page.evaluate(()=>E.state().현재카드.제목);await page.reload();assert.equal(await page.evaluate(()=>E.state().현재카드.제목),card);
   await page.locator('#actions .opt').first().click();await page.locator('#actions .next').waitFor({state:'visible'});
   if(kind==='contract')assert.equal(await page.evaluate(()=>E.story.contract().id),'contender');
   if(kind==='type')assert.equal(await page.evaluate(()=>E.story.type().id),'power');
   if(kind==='memory')assert.equal(await page.evaluate(()=>E.story.init().진행.인물),'heroine2');
   await page.locator('button').filter({hasText:'📓 선수 수첩'}).first().click();await page.locator('.modal h2').filter({hasText:'선수 수첩'}).waitFor();
   assert.equal(await page.locator('.sheet').evaluate(e=>e.scrollWidth>e.clientWidth),false);
   if(kind==='contract')await page.screenshot({path:path.join(out,'journal.png'),fullPage:true});
   await page.locator('.modal .close').click();assert.equal(await page.locator('.modal').count(),0);
  }
  // 인연 카드의 실제 두 번째 선택과 회상, 자동 이어짐, 결산 화면까지 진행합니다.
  await scene('memory');await page.locator('#actions .opt').first().click();await page.locator('#actions .next').waitFor();
  await page.locator('#actions .next').click();await page.locator('#actions .opt').first().waitFor();
  const trace=[];
  for(let n=0;n<40;n++){
   trace.push(await page.evaluate(()=>E.state().현재카드.제목));
   const result=await page.evaluate(()=>({kind:E.state().현재카드.선수서사,step:E.story.init().진행?.단계,remembered:E.story.init().기억.heroine2,finished:E.story.init().완료['memory:heroine2']}));
   if(result.finished!=null)break;
   // 실제 렌더/선택 경로를 유지하면서 unrelated 미니게임은 확률 판정으로 완료.
   await page.evaluate(()=>{U.closeModals();E.choose(0);U.showGame();});
   await page.locator('#actions .next').waitFor();await page.locator('#actions .next').click();await page.locator('#actions .opt').first().waitFor();
  }
  assert.equal(await page.evaluate(()=>E.story.init().기억.heroine2?.지킴),true,trace.join(' → '));
  assert.ok(await page.evaluate(()=>E.story.init().완료['memory:heroine2']!=null));
  assert.deepEqual(errors,[]);console.log('PASS: 8 previews, actual choices/save/reload/journal, 320/390/1280px, full memory route; '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
