// 화면·연습장 회귀 확인. 기존 Playwright와 설치된 Edge를 사용합니다.
// node tools/ui-check.js [스크린샷을 저장할 폴더]
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const root = path.join(__dirname, "..");
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "baseball-ui-"));
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: "msedge" });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(root, "index.html")).href);
    await page.clock.install();
    const snap = name => page.screenshot({ path: path.join(out, name + ".png"), fullPage: !/practice|shop/.test(name), animations: "disabled" });
    const saved = () => page.evaluate(() => JSON.stringify({ state: E.state(), storage: { ...localStorage } }));
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await snap("after-setup-mobile");
    await page.setViewportSize({ width: 1280, height: 900 });
    await snap("after-setup-desktop");
    await page.setViewportSize({ width: 390, height: 844 });

    // 새 인생을 만들기 전에도 세 게임을 연습할 수 있고 저장은 변하지 않습니다.
    const emptySave = await saved();
    await page.getByRole("button", { name: /미니게임 연습장/ }).click();
    await snap("after-practice");
    for (const [kind, label] of [["bat", "타격"], ["pitch", "투구"], ["timer", "타이밍"]]) {
      await page.locator(`[data-game="${kind}"]`).click();
      await page.locator(".practice-start").click();
      await page.keyboard.press("Space");
      await page.clock.runFor(2200);
      assert.equal(await page.locator(".mg-wrap").count(), 0);
      assert.match(await page.locator(".practice-score").innerText(), /1회/);
      assert.match(await page.locator(".practice-last").innerText(), /성공 확률/);
      assert.equal(await saved(), emptySave, label + " 연습이 저장을 바꿈");
      // 중단 뒤에 결과 화면이나 다음 공이 뒤늦게 나타나면 안 됩니다.
      await page.locator(".practice-start").click();
      await page.keyboard.press("Escape");
      await page.clock.runFor(9000);
      assert.equal(await page.locator(".mg-wrap").count(), 0);
      assert.match(await page.locator(".practice-score").innerText(), /1회/);
    }
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".practice-modal").count(), 0);
    assert.equal(await saved(), emptySave);

    // 실제 시작·선택·저장·불러오기 흐름과 두 포지션의 화면을 확인합니다.
    await page.locator("#nm").fill("강민준");
    await page.getByRole("button", { name: "유격수", exact: true }).click();
    await page.locator('#spec [data-n="수비"]').click();
    await page.locator("#go").click();
    await page.clock.runFor(600);
    await snap("after-game-mobile");
    await page.locator(".opt").first().click();
    await page.clock.runFor(800);
    assert.equal(await page.evaluate(() => E.state().단계), "결과");
    assert.equal(await page.locator("#card .front").evaluate(el => el.inert), true);
    await snap("after-result-mobile");
    await page.reload();
    assert.equal(await page.evaluate(() => E.state().단계), "결과");
    await page.clock.runFor(600);
    await page.locator(".next").click();
    await page.clock.runFor(900);
    assert.equal(await page.evaluate(() => E.state().단계), "카드");

    const beforePractice = await saved();
    await page.getByRole("button", { name: "미니게임 연습장 열기" }).click();
    await page.locator(".practice-start").click();
    await page.locator(".practice-stop").click();
    await page.keyboard.press("Escape");
    await page.clock.runFor(9000);
    assert.equal(await saved(), beforePractice);

    // 연습용 취소 함수를 추가한 뒤에도 본게임의 결과·저장 콜백이 정상인지 확인합니다.
    for (const pos of ["선발투수", "유격수"]) {
      await page.evaluate(pos => {
        E.newGame("승부테스트", pos, pos === "선발투수" ? "제구력" : "수비");
        E.enterStage("고등학교");
        const s = E.state(), c = E._internal.CARDS().find(c => c.선택지.some(o => o.미니게임 && !o.조건));
        s.현재카드 = c; s.현재옵션 = [c.선택지.findIndex(o => o.미니게임 && !o.조건)];
        GD.설정.미니게임.새게임확률 = 1; U.showGame();
      }, pos);
      await page.clock.runFor(600);
      await page.locator(".opt").first().click();
      assert.equal(await page.locator(pos === "선발투수" ? ".pf" : ".bf").count(), 1);
      await page.locator(".mg").dispatchEvent("pointerdown", { button: 0, isPrimary: true });
      await page.clock.runFor(2600);
      assert.equal(await page.evaluate(() => E.state().단계), "결과");
      assert.equal(await page.evaluate(() => typeof E.state().결과.미니게임.확률), "number");
      assert.equal(await page.locator(".mg-wrap").count(), 0);
    }

    for (const pos of ["선발투수", "유격수"]) {
      await page.evaluate(pos => {
        E.newGame("테스트선수", pos, pos === "선발투수" ? "제구력" : "수비");
        E.enterStage("메이저리그"); E._internal.attachHeroine("heroine6");
        const s = E.state(); s.나이 = 29; s.히로인.관계 = "연인"; s.히로인.애정도 = 70;
        s.현재카드 = E._internal.CARDS().find(c => c.제목 === "그녀의 생일"); s.단계 = "카드"; s.결과 = null;
        E.refreshOptions(); U.showGame();
      }, pos);
      await page.clock.runFor(700);
      for (const width of [320, 390, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(await overflow(), false, `${pos} ${width}px에서 가로 넘침`);
        assert.equal(await page.locator(".front").evaluate(el => el.scrollHeight > el.clientHeight + 1), false, "본문이 카드 안에서 잘림");
      }
      assert.match(await page.locator("#actions").innerText(), /신뢰를 잃을 수 있어요/);
    }
    await snap("after-game-desktop");
    await page.setViewportSize({ width: 390, height: 844 });
    await snap("after-romance-mobile");
    await page.getByRole("button", { name: /상점/ }).click();
    assert.match(await page.locator(".shop-item").filter({ hasText: "개인 트레이닝 센터 구축" }).locator(".shop-price").innerText(), /20억/);
    await snap("after-shop-mobile");
    await page.getByRole("button", { name: "상점 나가기", exact: true }).click();
    await page.evaluate(() => { E.state().시기 = "은퇴"; E.state().단계 = "엔딩"; U.showEnding(); });
    assert.equal(await page.locator("#app").getAttribute("class"), "is-ending");
    assert.equal(await overflow(), false);
    assert.deepEqual(errors, []);
    console.log("PASS: 시작·진행·저장·불러오기 / 3종 연습·중단·저장 보존 / 320·390·1280px / 연애 경고·상점·엔딩");
    console.log("화면 저장: " + out);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
