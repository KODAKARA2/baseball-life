// node tools/romance-ui-check.js [화면 저장 폴더]
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { pathToFileURL } = require('node:url'), { chromium } = require('playwright');
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'baseball-romance-')); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname, '../index.html')).href);
    await page.evaluate(() => {
      E.newGame('강민준', '유격수', '수비', { 외모: 10 });
      const s = E.state(), I = E._internal; s.시기 = '고등학교'; s.나이 = 17; s.진입나이 = 17; s.총턴 = 50; s.대기열 = [];
      s.현재카드 = I.clone(I.CARDS().find(c => c._만남 === 'heroine1')); E.refreshOptions(); U.showGame();
    });
    await page.locator('#actions button').first().click();
    await page.waitForTimeout(800);
    assert.equal(await page.evaluate(() => E.state().히로인.관계), '만남');
    assert.match(await page.locator('.heroine-mini').innerText(), /알아가는 중/);
    assert.match(await page.locator('.heroine-mini').innerText(), /호감/);
    await page.locator('.heroine-mini').click();
    assert.match(await page.locator('.sheet').innerText(), /대화 0 \/ 3회/);
    assert.match(await page.locator('.sheet').innerText(), /교제 후 애정도/);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('.sheet').evaluate(el => el.scrollWidth > el.clientWidth), false);
      await page.screenshot({ path: path.join(out, 'acquaintance-' + width + '.png'), animations: 'disabled' });
    }
    await page.locator('.sheet .close').click();
    const chats = await page.evaluate(() => E._internal.CARDS().filter(c => c.알아가기).slice(0, 3).map(c => c.제목));
    for (const title of chats) {
      await page.evaluate(title => {
        const s = E.state(), I = E._internal;
        s.현재카드 = I.clone(I.CARDS().find(c => c.제목 === title)); s.단계 = '카드'; E.refreshOptions(); U.renderAll();
      }, title);
      await page.locator('#actions button').first().click(); await page.waitForTimeout(800);
      assert.match(await page.locator('.fxs').innerText(), /호감/);
    }
    assert.equal(await page.evaluate(() => E.canConfess()), true);
    await page.evaluate(() => { E.state().대기열 = []; E.next(); U.renderAll(); });
    assert.equal(await page.evaluate(() => E.state().현재카드.제목), '고백');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(out, 'confession-mobile.png'), fullPage: true, animations: 'disabled' });
    await page.locator('#actions button').first().click(); await page.waitForTimeout(800);
    assert.equal(await page.evaluate(() => E.state().히로인.관계), '연인');
    assert.match(await page.locator('.heroine-mini').innerText(), /연인/);
    await page.reload();
    assert.equal(await page.evaluate(() => { E.load(); return E.state().히로인.관계; }), '연인');
    assert.deepEqual(errors, []);
    console.log('PASS: 첫 만남·대화 3회·고백 실제 클릭, 관계/호감 표시, 320/390/1280px, 저장 복원');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
