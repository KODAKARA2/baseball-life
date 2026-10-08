// node tools/minigame-check.js [스크린샷 폴더]
const assert = require("node:assert/strict"), path = require("node:path"), fs = require("node:fs"), os = require("node:os");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "baseball-mini-"));
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "msedge" });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname, "../index.html")).href);
    await page.clock.install(); await page.clock.pauseAt(await page.evaluate(()=>Date.now()));
    const start = async name => { await page.evaluate(name => {
      window.results = []; Math.random = () => 0.5;
      window.cancelMini = U[name](r => window.results.push(r));
    }, name); await page.clock.runFor(720); };
    const tap = async () => page.evaluate(() => {
      const e = new PointerEvent("pointerdown", { bubbles: true, button: 0, isPrimary: true });
      Object.defineProperty(e, "timeStamp", { value: performance.now() });
      document.querySelector(".mg").dispatchEvent(e);
    });
    const result = async p => {
      await page.clock.runFor(1700);
      assert.deepEqual(await page.evaluate(() => results.map(r => r.확률)), [p]);
      assert.equal(await page.locator(".mg-wrap").count(), 0);
    };
    // 출발 전 입력, 네 판정 구간, 시간 초과. 중복 입력에도 결과는 한 번만.
    await start("miniSteal"); await tap(); await tap(); await result(0.05);
    for (const [reaction, p] of [[100, .95], [240, .7], [390, .3], [600, .05]]) {
      await start("miniSteal"); await page.clock.runFor(2100 + reaction);
      await tap(); await result(p);
    }
    await start("miniSteal"); await page.clock.runFor(4700);
    assert.deepEqual(await page.evaluate(() => results.map(r => r.확률)), [.05]);
    // 견제 신호 중 누르면 실패, 기다리면 출발 신호로 전환.
    await page.evaluate(() => { GD.설정.미니게임.도루.견제확률 = 1; });
    await start("miniSteal"); await page.clock.runFor(1100);
    assert.match(await page.locator(".steal-signal").innerText(), /견제/);
    await tap(); await result(.05);
    await start("miniSteal"); await page.clock.runFor(2200); await tap(); await result(.95);

    for (const [offset, p] of [[0, .95], [80, .7], [150, .3], [260, .05]]) {
      await start("miniThrow"); await tap(); await tap();
      assert.match(await page.locator(".mg-pitch").innerText(), /2 \/ 2/);
      assert.equal(await page.locator(".mg-big").count(), 0, "더블 탭으로 조준이 끝남");
      await page.clock.runFor(Math.round(1000 / 1.1) + offset); await tap(); await result(p);
    }
    await start("miniThrow"); await tap(); await page.clock.runFor(7800);
    assert.deepEqual(await page.evaluate(() => results.map(r => r.확률)), [.05]);

    // 고정 난수에서는 커브 3개. 키보드와 터치/클릭을 모두 확인합니다.
    for (let count = 0; count <= 3; count++) {
      await start("miniSigns");
      await page.keyboard.press("2"); // 공개 중에는 무시
      assert.equal(await page.locator("[data-sign]:disabled").count(), 3);
      await page.clock.runFor(2450);
      for (let i = 0; i < 3; i++) {
        if (i === 0) await page.locator(`[data-sign="${i < count ? 1 : 0}"]`).click();
        else await page.keyboard.press(i < count ? "2" : "1");
      }
      await result([.05, .3, .7, .95][count]);
    }
    await start("miniSigns"); await page.clock.runFor(2450); await page.keyboard.press("2");
    await page.clock.runFor(6800);
    assert.deepEqual(await page.evaluate(() => results.map(r => r.확률)), [.3], "시간 초과 시 맞힌 사인만 인정");
    for (const name of ["miniSteal", "miniThrow", "miniSigns"]) {
      await start(name); await page.evaluate(() => cancelMini()); await page.clock.runFor(12000);
      assert.equal(await page.evaluate(() => results.length), 0, "취소 후 결과 도착");
      await start(name); await page.clock.runFor(50);
      if (name === "miniSteal") await tap();
      else if (name === "miniThrow") { await tap(); await page.clock.runFor(950); await tap(); }
      else { await page.clock.runFor(2450); for (let i = 0; i < 3; i++) await page.keyboard.press("2"); }
      await page.evaluate(() => cancelMini()); await page.clock.runFor(12000);
      assert.equal(await page.evaluate(() => results.length), 0, "결과 대기 중 취소 실패");
    }
    // 연습장에서 6종 선택, 화면 크기별 표시, 저장 보존과 Esc 중단.
    const before = await page.evaluate(() => JSON.stringify({ state: E.state(), storage: { ...localStorage } }));
    await page.evaluate(() => U.openPractice());
    assert.equal(await page.locator("[data-game]").count(), 6);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      for (const key of ["steal", "throw", "signs"]) {
        await page.locator(`[data-game="${key}"]`).click();
        await page.locator(".practice-start").click(); await page.clock.runFor(720);
        assert.equal(await page.locator(".mg").evaluate(el => el.scrollWidth > el.clientWidth), false);
        if (width === 390) await page.screenshot({ path: path.join(out, key + ".png"), animations: "disabled" });
        await page.keyboard.press("Escape"); await page.clock.runFor(10000);
        assert.equal(await page.locator(".mg-wrap").count(), 0);
      }
    }
    await page.locator('[data-game="signs"]').click(); await page.locator(".practice-start").click(); await page.clock.runFor(720);
    await page.clock.runFor(2450); for (let i = 0; i < 3; i++) await page.keyboard.press("2");
    await page.clock.runFor(1700);
    assert.match(await page.locator(".practice-score").innerText(), /1회/);
    assert.match(await page.locator(".practice-last").innerText(), /95%/);
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => JSON.stringify({ state: E.state(), storage: { ...localStorage } })), before);
    // 실제 추첨이 포지션을 지키며 모든 종류에 도달하고 3연속을 막는지 확인.
    const draws = await page.evaluate(() => {
      const names = ["miniTimer", "miniBat", "miniPitch", "miniSteal", "miniThrow", "miniSigns"];
      const originals = {}; let picked, seed = 123;
      names.forEach(n => { originals[n] = U[n]; U[n] = () => { picked = n; const m = document.createElement("div"); m.className = "mg-wrap"; document.body.appendChild(m); return () => m.remove(); }; });
      Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      const output = {};
      for (const pos of ["유격수", "선발투수"]) {
        E.newGame("추첨검사", pos, pos === "유격수" ? "수비" : "제구력");
        output[pos] = Array.from({ length: 200 }, () => { U.miniGame(() => {})(); return picked; });
      }
      names.forEach(n => { U[n] = originals[n]; });
      return output;
    });
    for (const [pos, list] of Object.entries(draws)) {
      assert.deepEqual([...new Set(list)].sort(), (pos === "유격수" ? ["miniTimer", "miniBat", "miniSteal", "miniThrow"] : ["miniTimer", "miniPitch", "miniThrow", "miniSigns"]).sort());
      assert.ok(list.every((v, i) => i < 2 || v !== list[i - 1] || v !== list[i - 2]));
    }
    // 새 게임이 본편의 선택 결과까지 정확히 한 번 전달되는지 확인.
    for (const name of ["miniSteal", "miniThrow", "miniSigns"]) {
      await page.evaluate(name => {
        E.newGame("승부검사", name === "miniSigns" ? "선발투수" : "유격수", name === "miniSigns" ? "제구력" : "수비");
        const s = E.state(), c = E._internal.CARDS().find(c => c.선택지.some(o => o.미니게임 && o.확률결과 && !o.조건));
        s.현재카드 = c; s.현재옵션 = [c.선택지.findIndex(o => o.미니게임 && o.확률결과 && !o.조건)];
        U.miniGame = cb => U[name](cb); U.showGame();
      }, name);
      await page.clock.runFor(700); await page.locator(".opt").first().click();
      await page.clock.runFor(12000);
      assert.equal(await page.evaluate(() => E.state().단계), "결과");
      assert.equal(await page.evaluate(() => E.state().결과.미니게임.확률), .05);
    }
    assert.deepEqual(errors, []);
    console.log("PASS: 새 3종 판정·시간 초과·중복 입력·중단 / 6종 연습·저장 보존 / 포지션 추첨·3연속 방지 / 본편 결과 / 모바일·PC");
    console.log("스크린샷: " + out);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
