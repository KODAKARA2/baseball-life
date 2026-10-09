// node tools/career-flow-ui-check.js [화면 폴더] — 처음부터 10개 진로, 20개 후일담 실제 클릭
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'baseball-career-'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
  const careers=await page.evaluate(()=>GD.진로.map(c=>c.아이디));
  for(const [index,id] of careers.entries())for(const good of [true,false]){
   await page.evaluate(({index,good})=>{
    E.newGame('강민준','유격수','수비',{외모:5});const s=E.state(),I=E._internal;
    s.시기='은퇴';s.은퇴나이=s.나이=s.진입나이=40;s.시기턴=2;s.연차=index%2?0:12;
    s.성적=good?1000:0;s.행복도=good?100:0;s.능력치.멘탈=s.능력치.인기=good?100:0;s.돈=good?100000:0;
    s.다음자유나이=99;
    s.현재카드=I.clone(I.CARDS().find(c=>c.진로선택&&I.eligible(c)));s.단계='카드';E.refreshOptions();E.save();U.showGame();
   },{index,good});
   assert.equal(await page.locator('#actions .opt').count(),10);
   assert.match(await page.locator('#actions').innerText(),/잘 풀리는 조건/);
   if(index===0&&good)for(const width of [320,390,1280]){
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for(const button of await page.locator('#actions .opt').all())assert.equal(await button.evaluate(e=>e.scrollWidth>e.clientWidth),false);
    await page.screenshot({path:path.join(out,'choices-'+width+'.png'),fullPage:true,animations:'disabled'});
   }
   await page.setViewportSize({width:390,height:844});
   await page.locator('#actions .opt').nth(index).click();
   await page.locator('#actions .next').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>E.state().진로확정),id);
   await page.locator('#actions .next').click();
   await page.locator('.career-summary').waitFor({state:'visible'});
   assert.equal(await page.locator('.career-invite').count(),0);
   assert.equal(await page.evaluate(()=>E.state().엔딩.직업.결말유형),good?'좋음':'아쉬움');
   assert.match(await page.locator('.career-summary').innerText(),good?/잘 풀린 다음 장/:/아쉬움이 남은 다음 장/);
   const count=await page.evaluate(()=>E.collection().인생수);
   await page.reload();await page.locator('.career-summary').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>E.state().진로확정),id);
   assert.equal(await page.evaluate(()=>E.collection().인생수),count);
   assert.equal(await page.locator('.career-invite').count(),0);
   if(index===0)await page.locator('.career-summary').screenshot({path:path.join(out,good?'good.png':'bad.png')});
  }
  assert.deepEqual(errors,[]);console.log('PASS: 첫 10개 선택·프로/미진출·20개 결말 실제 클릭·재선택 없음·새로고침/도감·320/390/1280px ('+out+')');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
