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
        Math.random=()=>0;E.newGame('강민준','유격수','수비',{외모:10}); const s=E.state();
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
    await button('데이트').click(); await button('새로운 인연').click();
    assert.equal(await page.locator('#actions button').count(),2);
    assert.doesNotMatch(await page.locator('#actions').innerText(),/윤하나|유하린|릴리/); await layout('random-search');
    assert.match(await page.locator('#actions').innerText(),/100%/);
    await page.reload(); await page.evaluate(()=>{E.load();U.showGame();});
    assert.equal(await page.evaluate(()=>E.state().자유시간.화면),'찾기');
    await page.evaluate(()=>Math.random=()=>0);
    await button('새 인연을 찾아본다').click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.관계),'만남'); assert.equal(await page.evaluate(()=>E.state().총턴),101);
    assert.ok(await page.locator('.back img[src="images/heroine1_meet.png"]').count());
    await start('만남'); await button('데이트').click(); await button('새로운 인연').click();
    assert.doesNotMatch(await page.locator('.front').innerText(),/관계를 먼저 끝낸다|호감 30|대화 0회|고백해야/); await layout('relationship-choice');
    await button('돌아가기').click(); assert.equal(await page.evaluate(()=>E.state().히로인.아이디),'heroine1');
    await button('새로운 인연').click(); await button('새 인연을 찾아본다').click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.아이디),'heroine4');
    assert.equal(await page.evaluate(()=>E.acquaintances().length),2); assert.equal(await page.evaluate(()=>!!E.state().히로인2),false);
    await page.evaluate(()=>{E.state().자유시간={화면:'데이트'};E.next();U.renderAll();});
    await layout('multiple-acquaintances');
    assert.match(await page.locator('#actions').innerText(),/윤하나/); assert.match(await page.locator('#actions').innerText(),/유하린/);
    await button('윤하나').click(); await page.waitForTimeout(800); assert.equal(await page.evaluate(()=>E.state().히로인.아이디),'heroine1');
    assert.equal(await page.evaluate(()=>E.acquaintances().length),2);
    await start('만남');await page.evaluate(()=>E.state().외모=1);
    await button('데이트').click();await button('새로운 인연').click();assert.match(await page.locator('#actions').innerText(),/확률 0%/);
    await button('새 인연을 찾아본다').click();await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.acquaintances().length),1);assert.equal(await page.evaluate(()=>E.state().자유시간),undefined);
    assert.match(await page.locator('.back').innerText(),/만나지 못했다/);
    await page.screenshot({path:path.join(out,'search-failure.png'),fullPage:true});
    for(const action of ['연습','취미활동','휴식']) {
      await start(); await page.evaluate(()=>{E.state().부상=3;E.state().슬럼프=2;});
      await button(action).click(); await page.waitForTimeout(800);
      assert.equal(await page.evaluate(()=>E.state().자유시간),undefined);
      assert.equal(await page.evaluate(()=>E.state().나이),17);
      if(action==='휴식') assert.deepEqual(await page.evaluate(()=>[E.state().부상,E.state().슬럼프]),[2,1]);
    }
    await start('만남'); await button('데이트').click(); await button('알아가는 시간').click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.교류횟수),1);
    assert.deepEqual(errors,[]); console.log('PASS: 자유행동 4종 / 무작위 만남 성공·실패·취소 / 결과 초상화·다중 인연 / 저장 / 320·390·1280px');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
