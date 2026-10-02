// 게임 진행 (카드 뽑기, 선택, 성장, 시즌, 엔딩, 저장)
(function () {
  var I = E._internal, cfg = I.cfg, sdef = I.sdef, rnd = I.rnd, clamp = I.clamp, arr = I.arr;
  function S() { return I.S; }

  var FALLBACK = {
    _id: "_평범한 하루", 시스템: false, 반복: true, 제목: "평범한 하루",
    내용: "특별한 일 없는 하루. 이런 날이 쌓여 인생이 된다.",
    선택지: [
      { 글: "땀 흘려 훈련한다", 효과: { 모든능력치: 1, 컨디션: -10 }, 집중: true, 결과: "오늘도 한 걸음." },
      { 글: "푹 쉰다", 효과: { 컨디션: 15, 행복도: 3 }, 결과: "가끔은 쉬어 가는 것도 필요하다." }
    ]
  };

  // ---------------- 새 게임 ----------------
  E.newGame = function (name, posName, specName) {
    I.buildCards();
    var C = cfg().시작능력치;
    var s = {
      버전: 1, 이름: name, 포지션: posName, 특기: specName, 능력치: {}, 행복도: C.행복도, 성적: 0, 부상: 0, 슬럼프: 0,
      시기: null, 시기턴: 0, 진입나이: 10, 나이: 10, 은퇴나이: null, 연차: 0, 올해카드: 0, 올해부상카드: 0,
      팀: null, 원래팀: null, 국내팀: null, 지명팀: null, 해외팀: null, 팀이동: 0, 일군: false, 드래프트: null,
      플래그: {}, 본카드: {}, 총턴: 0, 히로인: null, 지난히로인: [], 만난히로인: [], 자녀: 0,
      기록: [], 수상: [], 순간: [], 대기열: [], 돈: 0, 총수입: 0, 구매: {}, 본뉴스: {}, 단계: "카드", 현재카드: null, 현재옵션: [], 결과: null, 엔딩: null
    };
    I.S = s;
    var pos = E.pos(), spec = E.spec();
    E.posStats().forEach(function (k) {
      s.능력치[k] = C.포지션 + Math.floor(rnd() * 5) - 2 + ((pos.시작보너스 || {})[k] || 0);
    });
    s.능력치[spec.능력치] += cfg().특기시작보너스;
    s.능력치.멘탈 = C.멘탈; s.능력치.인기 = C.인기; s.능력치.컨디션 = C.컨디션; s.능력치.적응 = 0;
    I.applyEffects(spec.추가보너스 || {}, {});
    enterStage("초등학교");
    allowance();
    E.next();
    return s;
  };

  // ---------------- 시기 이동 ----------------
  function enterStage(name) {
    var s = S(), prev = s.시기, pd = sdef(prev);
    if (name === "은퇴" && s.은퇴나이 == null) s.은퇴나이 = s.나이;
    if (prev) {
      if (pd.끝나면플래그) s.플래그[pd.끝나면플래그] = true;
      arr(pd.끝나면해제).forEach(function (f) { delete s.플래그[f]; });
      if (I.YEARLY[prev]) { if (s.올해카드 > 0) E.endYear(); }
      else if (!sdef(name).시작나이) s.나이 += 1;
    }
    if (name === "엔딩") { s.엔딩 = E.computeEnding(); return; }
    var nd = sdef(name);
    if (nd.시작나이) s.나이 = nd.시작나이;
    s.시기 = name; s.시기턴 = 0; s.진입나이 = s.나이; s.올해카드 = 0; s.올해부상카드 = 0;
    if (nd.시작플래그) s.플래그[nd.시작플래그] = true;
    if (name === "드래프트" || name === "대학드래프트") {
      var D = (name === "대학드래프트" && cfg().대학드래프트) || cfg().드래프트, score = E.avg() + s.능력치.인기 * D.인기반영 + rnd() * 4 - 2;
      s.드래프트 = score >= D.상위지명 ? "상위" : score >= D.지명 ? "하위" : "미지명";
      s.지명팀 = I.pick(cfg().국내팀);
    }
    if (name === "프로") {
      if (prev === "메이저리그") s.팀 = s.국내팀 || s.원래팀;
      else if (!s.팀) { s.팀 = s.지명팀 || I.pick(cfg().국내팀); s.원래팀 = s.팀; s.일군 = false; }
    }
    if (name === "메이저리그") {
      s.국내팀 = s.팀; s.팀 = I.pick(GD.메이저리그.팀); s.해외팀 = s.팀;
      s.능력치.적응 = Math.max(s.능력치.적응, GD.메이저리그.시작적응 || 10);
    }
  }
  E.enterStage = enterStage;

  // ---------------- 카드 뽑기 ----------------
  function prio(c) { return c.우선 === true ? 1 : (c.우선 || 0); }
  function drawCard() {
    var s = S();
    while (s.대기열.length) {
      var q = s.대기열.shift();
      if (typeof q === "object") return q;
      var f = I.CARDS().find(function (c) { return c.제목 === q; });
      if (f) return f;
    }
    var all = I.CARDS().filter(I.eligible);
    var pri = all.filter(function (c) { return c.우선; }).sort(function (a, b) {
      return (prio(b) - prio(a)) || ((b.시기 ? 1 : 0) - (a.시기 ? 1 : 0));
    });
    if (pri.length) return pri[0];
    var sd = sdef(s.시기);
    if (sd.카드수) {
      var must = all.filter(function (c) { return c.필수; });
      if (must.length && sd.카드수 - s.시기턴 <= must.length) return I.pick(must);
    }
    var L = cfg().연애;
    if (s.히로인) {
      var hc = all.filter(function (c) { return c.히로인; });
      if (hc.length && rnd() < L.히로인카드확률) return I.weighted(hc);
    } else {
      var mc = all.filter(function (c) { return c._만남; });
      var mb = s.만남버프 && s.만남버프.남은 > 0 ? s.만남버프.값 : 0;
      if (mc.length && rnd() < L.만남확률 + mb) return I.weighted(mc);
    }
    var normal = all.filter(function (c) { return !c.히로인 && !c._만남; });
    if (normal.length) return I.weighted(normal);
    if (all.length) return I.weighted(all);
    return FALLBACK;
  }

  function computeOptions(c) {
    var s = S(); s.현재옵션 = [];
    (c.선택지 || []).forEach(function (o, i) {
      if ((!o.조건 || E.check(o.조건)) && (!o.비용 || (s.돈 || 0) >= o.비용) && (!o.비용비율 || (s.돈 || 0) > 0)) s.현재옵션.push(i);
    });
    if (!s.현재옵션.length) { c.선택지 = (c.선택지 || []).concat([{ 글: "계속" }]); s.현재옵션 = [c.선택지.length - 1]; }
  }
  // 학창 시절 용돈: 나이가 바뀔 때마다 한 번
  function allowance() {
    var s = S(), M = cfg().돈 || {};
    if (!M.용돈 || arr(M.용돈시기).indexOf(s.시기) < 0 || s._용돈나이 === s.나이) return 0;
    s._용돈나이 = s.나이; s.돈 = (s.돈 || 0) + M.용돈; return M.용돈;
  }
  E.allowance = allowance;
  E.refreshOptions = function () { var s = S(); if (s.단계 === "카드" && s.현재카드) computeOptions(s.현재카드); };

  // 야구 뉴스: 카드를 넘길 때 가끔 한 줄씩
  function pickNews() {
    var s = S(); if (rnd() >= (cfg().뉴스확률 || 0)) return null;
    var list = (GD.뉴스 || []).filter(function (n) {
      return !s.본뉴스[n.글] && (!n.시기 || arr(n.시기).indexOf(s.시기) >= 0) && E.check(n.조건);
    });
    if (!list.length) return null;
    var n = I.pick(list); s.본뉴스[n.글] = 1; return E.tpl(n.글);
  }

  E.next = function () {
    var s = S();
    if (s.엔딩) { s.단계 = "엔딩"; E.save(); return; }
    var c = I.clone(drawCard());
    s.현재카드 = c;
    s.현재옵션 = [];
    computeOptions(c);
    s.단계 = "카드"; s.결과 = null;
    E.save();
  };

  // ---------------- 선택 ----------------
  E.choose = function (i) {
    var s = S(), card = s.현재카드, o = card.선택지[s.현재옵션[i]];
    var res = { 효과: {}, 결과: o.결과 || "", 그림: o.그림변경 || null, 알림: [] };
    var out = o;
    if (o.비용) { s.돈 = Math.max(0, (s.돈 || 0) - o.비용); res.효과.돈 = -o.비용; }
    if (o.비용비율) { var pay = Math.floor((s.돈 || 0) * o.비용비율 / 100); s.돈 -= pay; res.효과.돈 = (res.효과.돈 || 0) - pay; }
    if (o.확률결과) {
      var ok = rnd() < (o.확률결과.확률 == null ? 0.5 : o.확률결과.확률);
      out = Object.assign({}, o, ok ? o.확률결과.성공 : o.확률결과.실패);
      res.성공 = ok; res.결과 = out.결과 || ""; res.그림 = out.그림변경 || res.그림;
    }
    I.applyEffects(out.효과, res.효과);
    arr(out.플래그).forEach(function (f) { s.플래그[f] = true; });
    arr(out.플래그해제).forEach(function (f) { delete s.플래그[f]; });
    if (out.일군 != null) s.일군 = out.일군;
    if (out.자녀) s.자녀 += out.자녀;
    if (out.기록) s.순간.push({ 나이: s.나이, 글: E.tpl(out.기록) });
    if (out.수상) I.addAward(out.수상);
    if (out.팀이동) I.changeTeam();
    if (out.인연시작 && card._만남) { I.attachHeroine(card._만남); res.알림.push("💞 " + E.heroDef().이름 + " 카드가 인생 카드 옆에 붙었다"); }
    if (out.관계) {
      var hn = s.히로인 ? E.heroDef().이름 : "";
      I.setRelation(out.관계);
      if (out.관계 === "이별") res.알림.push("💔 " + hn + " 카드가 떨어져 나갔다");
      if (out.관계 === "연인") res.알림.push("❤️ " + hn + "와(과) 연인이 되었다");
      if (out.관계 === "배우자") res.알림.push("💍 " + hn + " 카드가 배우자 카드로 바뀌었다");
    }
    arr(out.다음카드).forEach(function (t) { s.대기열.push(t); });

    if (card._id) s.본카드[card._id] = s.총턴;
    if (!card.시스템) { res.알림 = res.알림.concat(tick(out, card)); res.뉴스 = pickNews(); }
    s.총턴++;

    if (out.이동) enterStage(out.이동);
    else if (!card.시스템) {
      var sd = sdef(s.시기);
      s.시기턴++;
      if (sd.한해카드수) { s.올해카드++; if (s.올해카드 >= sd.한해카드수) E.endYear(); }
      else {
        if (sd.년수) s.나이 = s.진입나이 + Math.floor(s.시기턴 * sd.년수 / sd.카드수);
        if (s.시기턴 >= (sd.카드수 || 1)) enterStage(sd.다음 || "엔딩");
      }
      if (I.YEARLY[s.시기] && s.나이 >= 45) enterStage("은퇴");
    }
    var al = allowance(); if (al) res.알림.push("💰 용돈 " + E.money(al) + "을 받았다");
    res.결과 = E.tpl(res.결과);
    s.결과 = res; s.단계 = "결과";
    E.save();
    return res;
  };

  // ---------------- 카드 한 장마다 일어나는 일 ----------------
  function growthRate(age) {
    var t = cfg().성장; for (var i = 0; i < t.length; i++) if (age <= t[i][0]) return t[i][1];
    return t[t.length - 1][1];
  }
  function tick(o, card) {
    var s = S(), L = cfg().연애, C = cfg().컨디션, notes = [];
    if (s.히로인) {
      var h = E.heroDef();
      if (!card.히로인 && !card._만남) {
        var dec = L.매카드감소 + (o.집중 ? L.집중감소추가 : 0) + (s.플래그.장거리 && s.시기 === "메이저리그" ? L.장거리감소추가 : 0);
        s.히로인.애정도 = clamp(s.히로인.애정도 - dec, 0, 100);
      }
      if (s.히로인.애정도 >= L.도움기준) {
        var fx = h.고유효과 || {};
        E.applyEffects(fx.매카드 || {}, {});
        s.행복도 = clamp(s.행복도 + L.도움행복도, 0, 100);
        if (s.부상 > 0 && fx.부상회복) s.부상 = Math.max(0, s.부상 - fx.부상회복);
        if (s.슬럼프 > 0 && fx.슬럼프회복) s.슬럼프 = Math.max(0, s.슬럼프 - fx.슬럼프회복);
      }
    }
    if (s.부상 > 0) { s.부상--; s.올해부상카드++; if (!s.부상) notes.push("🩹 부상에서 회복했다"); }
    else growth();
    if (s.슬럼프 > 0) { s.슬럼프--; if (!s.슬럼프) notes.push("🌤️ 슬럼프에서 벗어났다"); }
    if (s.만남버프 && s.만남버프.남은 > 0) s.만남버프.남은--;
    s.능력치.컨디션 = clamp(s.능력치.컨디션 + C.매카드회복, 0, 100);
    var H = cfg().행복도 || {};
    if (H.매카드회귀 && s.행복도 > H.기준) s.행복도 = Math.max(H.기준, s.행복도 - H.매카드회귀);
    var active = ["고등학교", "대학", "프로", "메이저리그"].indexOf(s.시기) >= 0;
    if (active && !s.부상) {
      var p = C.기본부상확률 + (s.능력치.컨디션 < C.부상위험기준 ? C.부상확률 : 0);
      if (rnd() < p) { s.부상 = 1 + Math.floor(rnd() * 3); notes.push("⚠️ 부상! 카드 " + s.부상 + "장 동안 회복이 필요하다"); }
    }
    if (active && !s.슬럼프 && rnd() < C.슬럼프확률 * (s.능력치.멘탈 < 40 ? 2 : 1)) { s.슬럼프 = 2; notes.push("🌧️ 슬럼프에 빠졌다"); }
    return notes;
  }
  function growth() {
    var s = S(), g = growthRate(s.나이), spec = E.spec().능력치;
    E.posStats().forEach(function (k) {
      var d = g + (k === spec && g > 0 ? cfg().특기성장보너스 : 0);
      var v = Math.abs(d) * (0.5 + rnd()), n = Math.floor(v) + (rnd() < v % 1 ? 1 : 0);
      if (!n) return;
      if (d > 0) { if (s.능력치[k] < E.cap()) s.능력치[k] = Math.min(E.cap(), s.능력치[k] + n); }
      else s.능력치[k] = Math.max(1, s.능력치[k] - n);
    });
  }

  I.enterStage = enterStage;
  I.flowHelpers = { tick: tick, growth: growth, drawCard: drawCard };
})();
