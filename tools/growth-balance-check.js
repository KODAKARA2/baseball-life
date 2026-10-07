// node tools/growth-balance-check.js [판수=1000] [배율=0.8] [시드=20261007]
// 일반 선택지는 무작위, 포스팅/해외 FA는 반드시 수락. 상점/2세/미니게임 입력 보너스 없음.
// 비교할 배율을 각각 실행하면 시작 조건·게임/선택 난수 시드를 동일하게 재현합니다.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const count = Number(process.argv[2] || 1000), multiplier = Number(process.argv[3] || 0.8);
const seed = Number(process.argv[4] || 20261007);
assert.ok(Number.isInteger(count) && count > 0 && multiplier > 0 && Number.isInteger(seed));
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let n = Math.imul(state ^ state >>> 15, 1 | state);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
const math = Object.create(Math), store = {};
const ctx = { console, Math: math, JSON, Date, localStorage: {
  getItem: k => store[k] || null, setItem: (k, v) => store[k] = String(v), removeItem: k => delete store[k]
} };
ctx.window = ctx; vm.createContext(ctx);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(f => !/ui\.js|panels\.js/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const { E, GD } = ctx, posting = GD.카드.find(c => c.제목 === '포스팅 도전');
GD.설정.능력치상승배율 = multiplier;
const positions = GD.포지션.filter(p => p.시작선택 !== false);
const lives = [];
for (let g = 0; g < count; g++) {
  Object.keys(store).forEach(k => delete store[k]);
  const lifeSeed = (seed + Math.imul(g, 0x9E3779B9)) >>> 0;
  math.random = random(lifeSeed);
  const decision = random(lifeSeed ^ 0xABCDEF01), profile = random(lifeSeed ^ 0x12345678);
  const pos = positions[g % positions.length], specs = GD.특기.filter(t => t.분류 === pos.분류);
  const spec = specs[Math.floor(profile() * specs.length)], looks = 1 + Math.floor(profile() * 10);
  const s = E.newGame('성장검사', pos.이름, spec.이름, { 외모: looks });
  const r = { position: pos.이름, looks, pro: false, eligible: false, posting: false, fa: false, mlb: false, roster: false, peak: 0 };
  function observe() {
    r.pro ||= s.시기 === '프로'; r.mlb ||= s.시기 === '메이저리그'; r.roster ||= !!s.플래그.빅리거;
    r.eligible ||= s.시기 === '프로' && E.check(posting.조건);
    r.peak = Math.max(r.peak, E.avg());
  }
  let steps = 0;
  while (s.단계 !== '엔딩' && steps++ < 1200) {
    observe();
    const title = s.현재카드.제목;
    let option = Math.floor(decision() * s.현재옵션.length);
    if (title === '포스팅 도전' || title === '해외 FA') {
      assert.equal(s.시기, '프로');
      if (title === '포스팅 도전') {
        assert.ok(E.check(posting.조건));
        if (!r.posting) r.postingAge = s.나이;
        r.posting = true;
      } else r.fa = true;
      option = s.현재옵션.findIndex(i => s.현재카드.선택지[i].이동 === '메이저리그');
      assert.ok(option >= 0);
    }
    E.choose(option);
    if (title === '포스팅 도전' || title === '해외 FA') assert.equal(s.시기, '메이저리그');
    observe(); E.next();
  }
  assert.equal(s.단계, '엔딩', '끝나지 않는 인생: ' + g);
  r.score = s.성적; lives.push(r);
  if ((g + 1) % 250 === 0) console.error(multiplier + ': ' + (g + 1) + '/' + count);
}
function summarize(list) {
  const n = list.length, result = { lives: n };
  for (const key of ['pro', 'eligible', 'posting', 'fa', 'mlb', 'roster']) {
    const hits = list.filter(r => r[key]).length, p = hits / n, z = 1.96;
    const den = 1 + z*z/n, center = (p + z*z/(2*n))/den;
    const margin = z*Math.sqrt(p*(1-p)/n + z*z/(4*n*n))/den;
    result[key] = { count: hits, percent: +(100*p).toFixed(1), ci95: [center-margin, center+margin].map(v => +(100*v).toFixed(1)) };
  }
  result.meanPeak = +(list.reduce((a,r) => a+r.peak,0)/n).toFixed(2);
  result.meanScore = +(list.reduce((a,r) => a+r.score,0)/n).toFixed(1);
  result.postingAmongPros = +(100*result.posting.count/result.pro.count).toFixed(1);
  const ages = list.filter(r => r.posting).map(r => r.postingAge).sort((a,b) => a-b);
  result.medianPostingAge = ages.length ? ages[Math.floor(ages.length/2)] : null;
  return result;
}
console.log(JSON.stringify({ multiplier, seed, policy: 'random-except-accept-overseas; no-shop-or-heir; default-minigame-odds',
  ...summarize(lives), byLooks: Object.fromEntries([
    ['1-3', lives.filter(r => r.looks <= 3)], ['4-7', lives.filter(r => r.looks >= 4 && r.looks <= 7)], ['8-10', lives.filter(r => r.looks >= 8)]
  ].filter(([,list]) => list.length).map(([k,list]) => [k,summarize(list)])) }, null, 2));
