// node tools/acquaintance-proposal-ui-check.js [화면 저장 폴더]
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { pathToFileURL } = require('node:url'), { chromium } = require('playwright');
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(),'baseball-proposal-')); fs.mkdirSync(out,{recursive:true});
(async () => {
  const browser = await chromium.launch({channel:'msedge'});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
    for (const choice of [0,1,2]) {
      await page.evaluate(() => {
        E.newGame('강민준','유격수','수비',{외모:8}); const s=E.state(),I=E._internal;
        s.시기='프로';s.나이=s.진입나이=25;s.총턴=100;s.시기턴=0;s.올해카드=0;s.대기열=[];s.다음자유나이=99;
        I.attachHeroine('heroine1');s.히로인.관계='연인';s.히로인.애정도=90;
        I.attachHeroine('heroine8');const h=E.acquaintances()[0];h.애정도=70;h.만남턴=90;
        I.attachHeroine('heroine9');
        s.현재카드=I.clone(I.CARDS().find(c=>c.인연교제제안&&c._끼어들기==='heroine8'));
        s._상대='heroine8';s.단계='카드';E.refreshOptions();E.save();U.showGame();
      });
      assert.equal(await page.locator('#actions button').count(),3);
      assert.match(await page.locator('body').innerText(),/먼저 전한 마음/);
      assert.match(await page.locator('body').innerText(),/서미래/);
      if (choice===0) {
        for (const width of [320,390,1280]) {
          await page.setViewportSize({width,height:844});
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
          for (const button of await page.locator('#actions button').all()) assert.equal(await button.evaluate(el=>el.scrollWidth>el.clientWidth),false);
          await page.screenshot({path:path.join(out,'proposal-'+width+'.png'),fullPage:true,animations:'disabled'});
        }
        await page.reload();
        await page.evaluate(()=>{E.load();U.showGame();});
        assert.equal(await page.evaluate(()=>E.state().현재카드.제목),'친구로만 지내기엔');
      }
      await page.setViewportSize({width:390,height:844});
      await page.locator('#actions button').nth(choice).click();
      await page.waitForFunction(()=>E.state().단계==='결과');
      await page.locator('#actions button[onclick="U.next()"]').waitFor({state:'visible'});
      const result=await page.evaluate(()=>({main:E.state().히로인?.아이디,secret:E.state().히로인2?.아이디,friends:E.acquaintances().map(h=>h.아이디)}));
      assert.equal(result.main,choice===2?'heroine8':'heroine1');
      assert.equal(result.secret,choice===1?'heroine8':undefined);
      assert.equal(result.friends.includes('heroine8'),choice===0);assert.ok(result.friends.includes('heroine9'));
      if (choice===1) {
        assert.match(await page.locator('.heroine-mini').innerText(),/🤫/);
        await page.screenshot({path:path.join(out,'affair-result.png'),fullPage:true,animations:'disabled'});
        await page.reload();await page.evaluate(()=>{E.load();U.showGame();});
        assert.equal(await page.evaluate(()=>E.state().히로인2.아이디),'heroine8');
      }
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: 3갈래 실제 클릭·상대 이름/그림 안내·양다리 표시·저장 복원·320/390/1280px ('+out+')');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
