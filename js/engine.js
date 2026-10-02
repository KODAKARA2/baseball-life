// 게임 규칙 엔진 (데이터는 data 폴더에서 읽습니다)
(function () {
  var E = window.E = {};
  var S = null;
  var SAVE_KEY = "baseball-life-save-v1";
  var POS_STATS = { 투수: ["구속", "제구", "변화구", "체력"], 야수: ["파워", "컨택", "주루", "수비", "어깨"] };
  var COMMON = ["멘탈", "인기", "컨디션", "적응"];
  var YEARLY = { 프로: 1, 메이저리그: 1 };

  function cfg() { return GD.설정; }
  function sdef(n) { return (cfg().시기 || {})[n] || {}; }
  function rnd() { return Math.random(); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function arr(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function weighted(list) {
    var tot = 0; list.forEach(function (c) { tot += c.가중치 == null ? 1 : c.가중치; });
    var r = rnd() * tot;
    for (var i = 0; i < list.length; i++) { r -= list[i].가중치 == null ? 1 : list[i].가중치; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }

  E.pos = function () { return GD.포지션.find(function (p) { return p.이름 === S.포지션; }) || GD.포지션[0]; };
  E.spec = function () { return GD.특기.find(function (t) { return t.이름 === S.특기; }) || GD.특기[0]; };
  E.posStats = function () { return POS_STATS[E.pos().분류]; };
  E.avg = function () { var s = E.posStats(); return s.reduce(function (a, k) { return a + S.능력치[k]; }, 0) / s.length; };
  E.cap = function () { return sdef(S.시기).능력치상한 || 99; };
  E.heroDef = function (id) { return GD.히로인.find(function (h) { return h.아이디 === (id || (S.히로인 && S.히로인.아이디)); }); };
  E.state = function () { return S; };

  // ---------------- 카드 목록 만들기 ----------------
  var CARDS = [];
  function buildCards() {
    CARDS = []; var seen = {};
    function add(c) {
      var id = c.제목 || "카드"; if (seen[id]) id += "#" + (++seen[id]); else seen[id] = 1;
      c._id = id; CARDS.push(c);
    }
    GD.카드.forEach(function (c) { if (!c.끼어들기) add(c); });
    var tmpl = GD.카드.filter(function (c) { return c.끼어들기; });
    GD.히로인.forEach(function (h) {
      tmpl.forEach(function (t) {
        var m = clone(t); m._끼어들기 = h.아이디; m.시기 = t.시기 || h.만나는시기;
        m.조건 = Object.assign({}, h.만남조건 || {}, t.조건 || {}); add(m);
      });
      if (h.만남카드) {
        var m = clone(h.만남카드);
        m.시기 = m.시기 || h.만나는시기; m._만남 = h.아이디;
        m.조건 = Object.assign({}, h.만남조건 || {}, m.조건 || {}); add(m);
      }
      (h.전용카드 || []).forEach(function (c) { c = clone(c); c.히로인 = h.아이디; add(c); });
    });
  }

  // ---------------- 값과 조건 ----------------
  function val(k) {
    if (S.능력치[k] != null) return S.능력치[k];
    switch (k) {
      case "행복도": return S.행복도; case "성적": return S.성적; case "평균": return E.avg();
      case "상한도달": var cap = sdef("프로").능력치상한 || 85;
        return E.posStats().filter(function (s) { return S.능력치[s] >= cap; }).length;
      case "연차": return S.연차; case "자녀": return S.자녀; case "나이": return S.나이;
      case "애정도": return S.히로인 ? S.히로인.애정도 : 0; case "팀이동": return S.팀이동;
      case "시기카드": return S.시기턴; case "애정도2": return S.히로인2 ? S.히로인2.애정도 : 0;
      case "은퇴나이": return S.은퇴나이 || S.나이; case "이별수": return S.지난히로인.length;
      case "수상수": return S.수상.length; case "총수입": return S.총수입 || 0;
      case "이군기간": return S._강등턴 != null ? S.총턴 - S._강등턴 : 99; case "돈": return S.돈 || 0;
    }
    return 0;
  }
  function check(c) {
    if (!c) return true;
    if (c.시기 && arr(c.시기).indexOf(S.시기) < 0) return false;
    if (c.포지션 && !arr(c.포지션).some(function (p) { return p === S.포지션 || p === E.pos().분류; })) return false;
    if (c.특기 && arr(c.특기).indexOf(S.특기) < 0) return false;
    if (c.최소나이 != null && S.나이 < c.최소나이) return false;
    if (c.최대나이 != null && S.나이 > c.최대나이) return false;
    var k;
    for (k in (c.최소 || {})) if (val(k) < c.최소[k]) return false;
    for (k in (c.최대 || {})) if (val(k) > c.최대[k]) return false;
    if (c.상태 === "부상" && !(S.부상 > 0)) return false;
    if (c.상태 === "슬럼프" && !(S.슬럼프 > 0)) return false;
    if (c.상태 === "건강" && (S.부상 > 0 || S.슬럼프 > 0)) return false;
    if (c.플래그 && !arr(c.플래그).every(function (f) { return S.플래그[f]; })) return false;
    if (c.플래그없음 && arr(c.플래그없음).some(function (f) { return S.플래그[f]; })) return false;
    if (c.일군 != null && !!S.일군 !== c.일군) return false;
    if (c.드래프트 && S.드래프트 !== c.드래프트) return false;
    if (c.히로인 === "있음" && !S.히로인) return false;
    if (c.히로인 === "없음" && S.히로인) return false;
    if (c.관계 && (!S.히로인 || arr(c.관계).indexOf(S.히로인.관계) < 0)) return false;
    if (c.양다리 != null && !!S.히로인2 !== c.양다리) return false;
    if (c.구매 && !arr(c.구매).some(function (n) { return S.구매 && S.구매[n] != null; })) return false;
    if (c.포지션변경가능 && !(E.pos().변경후보 || []).length) return false;
    if (c.수상 && !arr(c.수상).some(function (a) { return S.수상.some(function (x) { return x.이름 === a; }); })) return false;
    if (c.확률 != null && rnd() > c.확률) return false;
    return true;
  }
  E.check = check;

  function eligible(c) {
    if (c.시기 && arr(c.시기).indexOf(S.시기) < 0) return false;
    if (c.히로인 === "누구나" && !S.히로인) return false;
    if (c.히로인 === "양다리" && !S.히로인2) return false;
    if (c.히로인 && c.히로인 !== "누구나" && c.히로인 !== "양다리" && (!S.히로인 || S.히로인.아이디 !== c.히로인)) return false;
    if (c._끼어들기 && (!S.히로인 || S.히로인.관계 !== "연인" || S.히로인2 || S.히로인.아이디 === c._끼어들기 || S.만난히로인.indexOf(c._끼어들기) >= 0)) return false;
    if (c._만남 && (S.히로인 || S.만난히로인.indexOf(c._만남) >= 0)) return false;
    var last = S.본카드[c._id];
    if (last != null && (!c.반복 || S.총턴 - last < (c.간격 || 4))) return false;
    return check(c.조건);
  }

  // ---------------- 글자 바꾸기 ({이름} 등 + 조사) ----------------
  var JOSA = { 은: ["은", "는"], 는: ["은", "는"], 이: ["이", "가"], 가: ["이", "가"], 을: ["을", "를"], 를: ["을", "를"], 과: ["과", "와"], 와: ["과", "와"], 아: ["아", "야"], 야: ["아", "야"] };
  function batchim(w) { var c = (w || "").charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; }
  function schoolKey() { return { 드래프트: "고등학교", 대학드래프트: "대학" }[S.시기] || (cfg().학교[S.시기] ? S.시기 : "고등학교"); }
  function words() {
    var L = cfg().리그, h = S.히로인 && E.heroDef(), h2 = (S.히로인2 || S._상대) && E.heroDef(S.히로인2 ? S.히로인2.아이디 : S._상대);
    return {
      이름: S.이름, 라이벌: (GD.조연.rival || {}).이름 || "라이벌", 히로인: h ? h.이름 : (S.직전히로인 || "그녀"), 상대: h2 ? h2.이름 : "그 사람", 새포지션: S._새포지션 || "",
      팀: S.팀 || S.지명팀 || cfg().국내팀[0], 학교: cfg().학교[schoolKey()], 대학: cfg().학교.대학,
      나이: S.나이 + "", 연도: String(cfg().시작연도 + S.나이 - 10), 포지션: S.포지션, 특기: S.특기,
      리그: S.시기 === "대학" ? L.대학 : S.시기 === "메이저리그" ? L.해외 : L.국내,
      해외팀: S.시기 === "메이저리그" ? S.팀 : (S.해외팀 || "메이저리그 팀"), 국내팀: S.국내팀 || S.팀 || cfg().국내팀[0]
    };
  }
  function tpl(t) {
    if (!t) return ""; var W = words();
    return String(t).replace(/\{([가-힣]+)\}((?:은|는|이|가|을|를|과|와|아|야)(?![가-힣]))?/g, function (m, k, j) {
      if (W[k] == null) return m; var w = W[k];
      return w + (j ? JOSA[j][batchim(w) ? 0 : 1] : "");
    });
  }
  E.tpl = tpl;

  // ---------------- 능력치 변경 ----------------
  function addStat(k, v, out) {
    if (S.능력치[k] == null) return;
    var cur = S.능력치[k], nv;
    if (E.posStats().indexOf(k) >= 0) nv = v > 0 ? (cur >= E.cap() ? cur : Math.min(E.cap(), cur + v)) : Math.max(1, cur + v);
    else nv = clamp(cur + v, 0, 100);
    S.능력치[k] = nv; if (out && nv !== cur) out[k] = (out[k] || 0) + (nv - cur);
  }
  function applyEffects(eff, out) {
    Object.keys(eff || {}).forEach(function (k) {
      var v = eff[k];
      if (Array.isArray(v)) v = v[0] + Math.floor(rnd() * (v[1] - v[0] + 1));   // [최소, 최대] → 랜덤
      if (k === "모든능력치") E.posStats().forEach(function (s) { addStat(s, v, out); });
      else if (k === "특기능력치") addStat(E.spec().능력치, v, out);
      else if (k === "부상") { S.부상 = v <= 0 ? 0 : Math.max(S.부상, v); out.부상 = v; }
      else if (k === "부상감소") { S.부상 = Math.floor(S.부상 * (100 - v) / 100); out.부상감소 = v; }
      else if (k === "슬럼프감소") { S.슬럼프 = Math.floor(S.슬럼프 * (100 - v) / 100); out.슬럼프감소 = v; }
      else if (k === "슬럼프") { S.슬럼프 = v <= 0 ? 0 : Math.max(S.슬럼프, v); out.슬럼프 = v; }
      else if (k === "애정도2") { if (S.히로인2) { var o2 = S.히로인2.애정도; S.히로인2.애정도 = clamp(o2 + v, 0, 100); out.애정도2 = S.히로인2.애정도 - o2; } }
      else if (k === "애정도") { if (S.히로인) { var o = S.히로인.애정도; S.히로인.애정도 = clamp(o + v, 0, 100); out.애정도 = S.히로인.애정도 - o; } }
      else if (k === "행복도") { var h = S.행복도; S.행복도 = clamp(h + v, 0, 100); out.행복도 = S.행복도 - h; }
      else if (k === "성적") { S.성적 = Math.max(0, S.성적 + v); out.성적 = v; }
      else if (k === "돈") { S.돈 = Math.max(0, (S.돈 || 0) + v); if (v > 0) S.총수입 = (S.총수입 || 0) + v; out.돈 = (out.돈 || 0) + v; }
      else addStat(k, v, out);
    });
  }
  E.applyEffects = applyEffects;

  // ---------------- 히로인 ----------------
  function attachHeroine(id) {
    S.히로인 = { 아이디: id, 관계: "만남", 애정도: cfg().연애.시작애정도 };
    S.만난히로인.push(id);
  }
  function setRelation(r) {
    if (!S.히로인) return;
    if (r === "이별") {
      var h = E.heroDef();
      S.지난히로인.push({ 아이디: h.아이디, 이름: h.이름, 관계: S.히로인.관계, 결말: "이별" });
      S.직전히로인 = h.이름; S.히로인 = null; applyEffects(cfg().연애.이별타격, {});
    } else S.히로인.관계 = r;
  }

  // ---------------- 수상과 팀 ----------------
  function addAward(n, year) { S.수상.push({ 이름: n, 연도: year || (cfg().시작연도 + S.나이 - 10) }); }
  function randomTeam(list, not) { var l = list.filter(function (t) { return t !== not; }); return pick(l.length ? l : list); }
  function changeTeam() {
    if (S.시기 === "메이저리그") S.팀 = randomTeam(GD.메이저리그.팀, S.팀);
    else { S.팀 = randomTeam(cfg().국내팀, S.팀); S.팀이동++; }
  }

  E._internal = {
    get S() { return S; }, set S(v) { S = v; }, cfg: cfg, sdef: sdef, rnd: rnd, clamp: clamp, arr: arr, pick: pick, clone: clone,
    weighted: weighted, eligible: eligible, CARDS: function () { return CARDS; }, buildCards: buildCards,
    applyEffects: applyEffects, attachHeroine: attachHeroine, setRelation: setRelation, addAward: addAward,
    randomTeam: randomTeam, changeTeam: changeTeam, POS_STATS: POS_STATS, COMMON: COMMON, YEARLY: YEARLY, SAVE_KEY: SAVE_KEY
  };
})();
