// 자동 플레이 시뮬레이션: node tools/sim.js [판수]
// 화면 없이 게임 엔진만 돌려서 오류, 엔딩 분포, 레어 카드·결혼·자녀 비율을 확인합니다.
const fs = require("fs"), vm = require("vm"), path = require("path");
const R = path.join(__dirname, ".."), html = fs.readFileSync(path.join(R, "index.html"), "utf8");
const files = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f));
const store = {};
const ctx = { console, Math, JSON, Date, localStorage: { getItem: k => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } } };
ctx.window = ctx; vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(R, f), "utf8"), ctx, { filename: f });
const E = ctx.E, GD = ctx.GD, N = +(process.argv[2] || 200), ends = {};
let errs = 0, rare = 0, married = 0, kids = 0;
const posList = GD.포지션.filter(p => p.시작선택 !== false);
for (let g = 0; g < N; g++) {
  try {
    const pos = posList[g % posList.length], specs = GD.특기.filter(t => t.분류 === pos.분류);
    E.newGame("홍길동", pos.이름, specs[g % specs.length].이름);
    const S = E.state(); let t = 0;
    while (S.단계 !== "엔딩" && t < 600) { if (S.현재카드.레어) rare++; E.choose(Math.floor(Math.random() * S.현재옵션.length)); E.next(); t++; }
    if (S.단계 !== "엔딩") throw new Error("끝나지 않는 인생 (" + t + "장)");
    if (!S.진로확정) throw new Error("은퇴 진로를 선택하지 않고 엔딩에 도달");
    E.recordLife();
    const en = S.엔딩, k = en.기본.이름; ends[k] = (ends[k] || 0) + 1;
    if (S.히로인 && S.히로인.관계 === "배우자") married++;
    if (S.자녀 > 0) kids++;
  } catch (e) { errs++; if (errs <= 3) console.log("오류:", e.stack.split("\n").slice(0, 3).join(" | ")); }
}
console.log("판수", N, "| 오류", errs, "| 레어/판", (rare / N).toFixed(2), "| 결혼", Math.round(married / N * 100) + "%", "| 자녀", Math.round(kids / N * 100) + "%");
console.log("엔딩", JSON.stringify(Object.entries(ends).sort((a, b) => b[1] - a[1])));
if (errs) process.exitCode = 1;
