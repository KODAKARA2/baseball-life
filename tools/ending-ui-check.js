// node tools/ending-ui-check.js [화면 저장 폴더]
const assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { pathToFileURL } = require("node:url"), { chromium } = require("playwright");
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "baseball-ending-")); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "msedge" });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } }), errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname, "../index.html")).href);
    async function ending() {
      await page.evaluate(() => {
        E.newGame("강민준", "유격수", "수비");
        const s = E.state(); s.시기 = "은퇴"; s.단계 = "엔딩"; s.성적 = 980; s.행복도 = 85; s.나이 = 42; s.연차 = 16;
        s.플래그.진로_지도자 = true; s.엔딩 = E.computeEnding(); U.showEnding();
      });
    }
    await ending();
    assert.equal(await page.locator(".ending-story .end-title").innerText(), "☀️ 기록 너머에 남은 미소");
    assert.match(await page.locator(".ending-highlight").innerText(), /야구의 신/);
    assert.equal(await page.locator(".career-summary").count(), 0);
    await page.screenshot({ path: path.join(out, "ending-mobile.png"), fullPage: true, animations: "disabled" });
    await page.getByRole("button", { name: "은퇴 후 진로 선택하기 →" }).click();
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.locator(".career-choice").count(), 10);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator(".sheet").evaluate(el => el.scrollWidth > el.clientWidth), false);
      await page.screenshot({ path: path.join(out, "careers-" + width + ".png"), animations: "disabled" });
    }
    await page.getByRole("button", { name: "조금 더 생각하기" }).click();
    assert.equal(await page.evaluate(() => E.state().진로확정), undefined);
    const careers = await page.evaluate(() => GD.진로.map(c => c.아이디));
    for (const id of careers) {
      await ending();
      const count = await page.evaluate(() => E.collection().인생수);
      await page.getByRole("button", { name: "은퇴 후 진로 선택하기 →" }).click();
      await page.locator(`[data-career="${id}"]`).click();
      assert.equal(await page.locator(".modal").count(), 0);
      assert.equal(await page.locator(".career-summary").count(), 1);
      assert.equal(await page.evaluate(() => E.state().진로확정), id);
      assert.equal(await page.evaluate(() => E.collection().인생수), count);
      assert.ok(!(await page.locator(".career-summary").innerText()).includes("{이름}"));
      await page.reload();
      assert.equal(await page.locator(".career-summary").count(), 1);
      assert.equal(await page.evaluate(() => E.state().진로확정), id);
      assert.equal(await page.evaluate(() => E.collection().인생수), count);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".career-summary").screenshot({ path: path.join(out, "career-epilogue.png") });
    await page.getByRole("button", { name: "📖 엔딩 도감 · 업적 보기" }).click();
    assert.ok(!(await page.locator(".sheet").innerText()).includes("undefined"));
    assert.match(await page.locator(".sheet").innerText(), /성적 900 이상/);
    assert.match(await page.locator(".sheet").innerText(), /야구 크리에이터/);
    await page.getByRole("button", { name: "닫기", exact: true }).last().click();
    const shared = await page.evaluate(() => new Promise(resolve => {
      const orig = CanvasRenderingContext2D.prototype.fillText, texts = [];
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) { texts.push(text); return orig.call(this, text, ...args); };
      U.resultBlob(blob => { CanvasRenderingContext2D.prototype.fillText = orig; resolve({ type: blob && blob.type, size: blob && blob.size, texts }); });
    }));
    assert.equal(shared.type, "image/png"); assert.ok(shared.size > 0);
    assert.ok(shared.texts.some(t => t.includes("기록 너머에 남은 미소")));
    assert.ok(shared.texts.some(t => t.includes("야구 크리에이터")));
    assert.deepEqual(errors, []);
    console.log("PASS: 인생 엔딩·특별 하이라이트 / 진로 10종 선택·다시 읽기·도감 / 공유 이미지 / 320·390·1280px");
    console.log(out);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
