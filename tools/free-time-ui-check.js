const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {pathToFileURL} = require('node:url'), {chromium} = require('playwright');
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(),'baseball-free-time-')); fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser = await chromium.launch({channel:'msedge'});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
    async function start(rel=null) {
      await page.evaluate(rel=>{
        E.newGame('강민준','유격수','수비',{외모:5}); const s=E.state();
        s.시기='고등학교'; s.나이=s.진입나이=17; s.총턴=100; s.다음자유나이=17; s.대기열=[];
        if(rel) { E._internal.attachHeroine('heroine1'); s.히로인.관계=rel; }
        s.자유시간={화면:'메뉴'}; E.next(); U.showGame();
      },rel);
    }
    const button=text=>page.locator('#actions button').filter({hasText:text});
    async function layout(name) {
      for(const width of [320,390,1280]) {
        await page.setViewportSize({width,height:844});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+': overflow');
        assert.equal(await page.locator('.front').evaluate(el=>el.scrollHeight>el.clientHeight+1),false,name+': clipped');
        await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true,animations:'disabled'});
      }
    }
    await start(); assert.equal(await page.locator('#actions button').count(),4); await layout('menu');
    await button('데이트').click(); await button('다른 히로인').click();
    assert.match(await page.locator('#actions').innerText(),/윤하나/); assert.match(await page.locator('#actions').innerText(),/유하린/);
    assert.doesNotMatch(await page.locator('#actions').innerText(),/릴리/); await layout('candidates');
    await button('유하린').click(); assert.equal(await page.evaluate(()=>E.state().히로인),null); await layout('meeting');
    await page.reload(); await page.evaluate(()=>{E.load();U.showGame();});
    assert.equal(await page.evaluate(()=>E.state().자유시간.대상),'heroine4');
    await button('먼저 인사한다').click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.관계),'만남'); assert.equal(await page.evaluate(()=>E.state().총턴),101);
    await start('연인'); await button('데이트').click(); await button('다른 히로인').click(); await button('유하린').click();
    assert.match(await page.locator('.front').innerText(),/관계를 먼저 끝낸다/); await layout('relationship-choice');
    await button('돌아가기').click(); assert.equal(await page.evaluate(()=>E.state().히로인.아이디),'heroine1');
    await button('유하린').click(); await button('현재 인연을 정리').click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.아이디),'heroine4');
    for(const action of ['연습','취미활동','휴식']) {
      await start(); await page.evaluate(()=>{E.state().부상=3;E.state().슬럼프=2;});
      await button(action).click(); await page.waitForTimeout(800);
      assert.equal(await page.evaluate(()=>E.state().자유시간),undefined);
      assert.equal(await page.evaluate(()=>E.state().나이),17);
      if(action==='휴식') assert.deepEqual(await page.evaluate(()=>[E.state().부상,E.state().슬럼프]),[2,1]);
    }
    await start('만남'); await button('데이트').click(); await button('알아가는 시간').click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.교류횟수),1);
    assert.deepEqual(errors,[]); console.log('PASS: 자유행동 4종 실제 선택, 히로인 지정·취소·관계 교체, 메뉴 새로고침, 320/390/1280px');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
