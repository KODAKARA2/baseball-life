// 시즌 기록, 수상, 엔딩, 저장
(function () {
  var I = E._internal, cfg = I.cfg, sdef = I.sdef, rnd = I.rnd, clamp = I.clamp;
  function S() { return I.S; }
  function year() { return cfg().시작연도 + S().나이 - 10; }

  // ---------------- 시즌 경기력 ----------------
  function perf() {
    var s = S(), p = E.pos(), w = 0, t = 0;
    E.posStats().forEach(function (k) { var x = (p.비중 || {})[k] || 1; w += x; t += x * s.능력치[k]; });
    var q = t / w + (s.능력치.멘탈 - 50) / 10 + (s.능력치.컨디션 - 60) / 15;
    if (s.슬럼프 > 0) q -= 8;
    if (s.시기 === "메이저리그") q += (GD.메이저리그.경기력보정 || -8) - (100 - s.능력치.적응) * (GD.메이저리그.적응반영 || 0.12);
    return q + rnd() * 8 - 4;
  }

  function seasonLine() {
    var s = S();
    var playing = (s.시기 === "프로" && s.일군) || (s.시기 === "메이저리그" && s.플래그.빅리거);
    if (!playing) return null;
    var q = perf(), p = E.pos(), A = s.능력치;
    var gf = clamp(1 - 0.5 * s.올해부상카드 / (sdef(s.시기).한해카드수 || 2), 0.3, 1);
    var L = { 연도: year(), 나이: s.나이, 팀: s.팀, 메이저: s.시기 === "메이저리그", 경기력: Math.round(q) };
    if (p.분류 === "투수") {
      L.평균자책점 = clamp(7.2 - (q - 40) * 0.09, 1.2, 9);
      if (p.역할 === "선발") {
        L.이닝 = Math.round((70 + A.체력 * 1.3) * gf);
        L.승 = Math.round(clamp((q - 38) / 3.2, 0, 22) * gf); L.패 = Math.round(clamp(15 - (q - 38) / 4, 3, 15) * gf);
      } else if (p.역할 === "불펜") {
        L.이닝 = Math.round(65 * gf); L.홀드 = Math.round(clamp((q - 40) / 1.6, 0, 38) * gf); L.승 = Math.round(clamp((q - 40) / 10, 0, 8) * gf);
      } else {
        L.이닝 = Math.round(62 * gf); L.세이브 = Math.round(clamp((q - 40) / 1.2, 0, 45) * gf);
      }
      L.탈삼진 = Math.round(L.이닝 * (0.55 + A.구속 / 150));
    } else {
      var avg = clamp(0.2 + (A.컨택 - 40) * 0.0026 + (q - 60) * 0.0008 + rnd() * 0.02 - 0.01, 0.17, 0.38);
      L.타수 = Math.round(500 * gf); L.안타 = Math.round(L.타수 * avg); L.타율 = avg;
      L.홈런 = Math.round(clamp((A.파워 - 35) * 0.8 + (q - 60) * 0.2, 0, 58) * gf);
      L.도루 = Math.round(clamp((A.주루 - 40) * 0.9, 0, 60) * gf);
      L.타점 = Math.round(L.홈런 * 2.3 + L.안타 * 0.22);
    }
    L.가치 = Math.max(0, Math.round((q - cfg().시즌.기준선) * cfg().시즌.점수배율 * gf));
    return L;
  }

  function awards(L) {
    var s = S(), A = cfg().수상, P = A.점수, got = [], pit = E.pos().분류 === "투수";
    function give(n, pts) { got.push(n); I.addAward(n, L.연도); s.성적 += E.looksGain(pts || 0, "성적행복"); }
    if (!L.메이저) {
      if (!s.플래그._신인왕체크) { s.플래그._신인왕체크 = true; if (L.경기력 >= A.신인왕) give("신인왕", P.신인왕); }
      if (L.경기력 >= A.MVP && rnd() < 0.5) give("MVP", P.MVP);
      if (L.경기력 >= A.골든글러브 && rnd() < 0.7) give("골든글러브", P.골든글러브);
      var T = pit ? [["승", 16, "다승왕"], ["세이브", 35, "세이브왕"], ["홀드", 30, "홀드왕"], ["탈삼진", 190, "탈삼진왕"]]
                  : [["홈런", 35, "홈런왕"], ["도루", 45, "도루왕"], ["타율", 0.34, "타격왕"]];
      T.forEach(function (t) { if ((L[t[0]] || 0) >= t[1] && rnd() < 0.6) give(t[2], P.타이틀); });
    } else {
      if (L.경기력 >= 76 && rnd() < 0.6) give("MLB 올스타", P.올스타);
      if (L.경기력 >= 88 && rnd() < 0.4) give(pit ? "사이영상" : "메이저리그 MVP", pit ? P.사이영상 : P.메이저MVP);
      if (!pit && L.경기력 >= 82 && rnd() < 0.5) give("실버슬러거", P.실버슬러거);
    }
    return got;
  }

  function fmtLine(L) {
    var x = [];
    if (L.평균자책점 != null) {
      if (L.승 != null) x.push(L.승 + "승" + (L.패 != null ? " " + L.패 + "패" : ""));
      if (L.세이브 != null) x.push(L.세이브 + "세이브");
      if (L.홀드 != null) x.push(L.홀드 + "홀드");
      x.push("평균자책점 " + L.평균자책점.toFixed(2), L.탈삼진 + "탈삼진");
    } else x.push("타율 " + L.타율.toFixed(3).replace(/^0/, ""), L.홈런 + "홈런", L.타점 + "타점", L.도루 + "도루");
    return x.join(" · ");
  }
  E.fmtLine = fmtLine;

  // 연봉 (단위: 만원) — 한 해에 한 번만 받음
  function salary(L) {
    var s = S(), M = (cfg().돈 || {}).연봉 || {}, pay = 0;
    if (s._연봉연도 === s.나이) return s._연봉;
    if (s.시기 === "프로") pay = L ? (M.일군기본 || 0) + Math.max(0, L.경기력 - 50) * (M.경기력당 || 0) : (M.이군 || 0);
    else if (s.시기 === "메이저리그") pay = L ? (M.메이저기본 || 0) + Math.max(0, L.경기력 - 60) * (M.메이저경기력당 || 0) : (M.마이너 || 0);
    pay = Math.round(pay); s.돈 = (s.돈 || 0) + pay; s.총수입 = (s.총수입 || 0) + pay;
    s._연봉연도 = s.나이; s._연봉 = pay; return pay;
  }
  E.money = function (n) {
    n = Math.round(n || 0); var sg = n < 0 ? "-" : ""; n = Math.abs(n);
    if (n >= 10000) return sg + (Math.round(n / 1000) / 10) + "억";
    return sg + n.toLocaleString("ko-KR") + "만원";
  };

  // ---------------- 상점 (data/shop.js) ----------------
  E.shopList = function () {
    var s = S();
    return (GD.상점 || []).map(function (it) {
      var last = (s.구매 || {})[it.이름];
      var wait = last == null ? 0 : Math.max(0, (it.간격 == null ? 4 : it.간격) - (s.총턴 - last));
      var stageOk = !it.시기 || I.arr(it.시기).indexOf(s.시기) >= 0;
      var sold = !!it.한번만 && last != null, cond = stageOk && E.check(it.조건);
      return { item: it, wait: wait, sold: sold, cond: cond, stageOk: stageOk, ok: cond && !sold && !wait && (s.돈 || 0) >= it.가격 };
    });
  };
  E.buy = function (name) {
    var s = S(), e = E.shopList().find(function (x) { return x.item.이름 === name; });
    if (!e || !e.ok) return null;
    s.돈 -= e.item.가격; s.구매[name] = s.총턴;
    var fx = Object.assign({}, e.item.효과 || {}), lim = (cfg().상점 || {}).애정도한계;
    if (lim != null && fx.애정도 > lim) fx.애정도 = lim;          // 아이템으로 오르는 애정도는 한계까지만
    var out = {}; E.applyEffects(fx, out);
    if (lim != null && out.애정도 > lim && s.히로인) { s.히로인.애정도 -= out.애정도 - lim; out.애정도 = lim; }   // 외모 보너스가 있어도 한계까지만
    if (fx.만남확률) { s.만남버프 = { 값: fx.만남확률 / 100, 남은: e.item.지속 || (cfg().상점 || {}).버프지속 || 10 }; out.만남확률 = fx.만남확률; }
    if (e.item.기록) s.순간.push({ 나이: s.나이, 글: E.tpl(e.item.기록) });
    if (s.단계 === "카드" && s.현재카드 && s.현재카드.자유행동 && s.자유시간) s.현재카드 = E.freeTimeCard();
    E.refreshOptions(); E.save();
    return { 결과: E.tpl(e.item.결과 || ""), 효과: out };
  };

  E.endYear = function () {
    var s = S(), L = seasonLine();
    if (L) {
      s.기록.push(L); s.성적 += E.looksGain(L.가치, "성적행복");
      var got = awards(L);
      var lines = [s.팀 + " · " + (L.메이저 ? "메이저리그" : "1군"), fmtLine(L), "💰 연봉 " + E.money(salary(L))];
      if (got.length) lines.push("🏅 " + got.join(", "));
      s.대기열.unshift({ 시스템: true, 제목: L.연도 + " 시즌 결산", 내용: lines.join("\n"), 그림: got.length ? "hero_victory" : null,
        선택지: [{ 글: "다음 시즌으로" }] });
    }
    if (!L) salary(null);
    if (s.시기 === "프로") s.연차++;
    s.나이++; s.올해카드 = 0; s.올해부상카드 = 0;
  };

  // ---------------- 통산 기록과 엔딩 ----------------
  E.totals = function () {
    var s = S(), T = { 시즌: s.기록.length, 메이저시즌: 0 }, er = 0, inn = 0, ab = 0, h = 0;
    s.기록.forEach(function (L) {
      if (L.메이저) T.메이저시즌++;
      ["승", "패", "세이브", "홀드", "탈삼진", "홈런", "타점", "도루", "안타"].forEach(function (k) { if (L[k] != null) T[k] = (T[k] || 0) + L[k]; });
      if (L.이닝) { inn += L.이닝; er += L.평균자책점 * L.이닝 / 9; }
      if (L.타수) { ab += L.타수; h += L.안타; }
    });
    if (inn) { T.이닝 = inn; T.평균자책점 = (er * 9 / inn).toFixed(2); }
    if (ab) T.타율 = (h / ab).toFixed(3).replace(/^0/, "");
    return T;
  };

  E.computeEnding = function () {
    var s = S(), C = cfg().엔딩기준;
    var ph = s.성적 >= C.성적높음, hh = s.행복도 >= C.행복도높음;
    var base = GD.기본엔딩.find(function (e) { return e.조건 && E.check(e.조건); }) ||
      GD.기본엔딩.find(function (e) { return !e.조건 && (e.성적 === "높음") === ph && (e.행복도 === "높음") === hh; }) || GD.기본엔딩[0];
    var titles = GD.직업엔딩.filter(function (e) { return e.종류 === "칭호" && E.check(e.조건); });
    var job = GD.직업엔딩.find(function (e) { return e.종류 !== "칭호" && E.check(e.조건); });
    var heroines = s.지난히로인.slice();
    (s.알아가는인연 || []).forEach(function (person) { heroines.push({ 아이디: person.아이디, 이름: E.heroDef(person.아이디).이름, 관계: "만남", 결말: "알아가던 인연" }); });
    if (s.히로인) { var h = E.heroDef(); heroines.push({ 아이디: h.아이디, 이름: h.이름, 관계: s.히로인.관계, 결말: s.히로인.관계 === "배우자" ? "평생의 반려자" : "함께" }); }
    if (s.히로인2) { var h2 = E.heroDef(s.히로인2.아이디); heroines.push({ 아이디: h2.아이디, 이름: h2.이름, 관계: "연인", 결말: "끝까지 비밀이었던 연인" }); }
    var special = (GD.특별엔딩 || []).find(function (e) { return E.check(e.조건); });
    var he = null;
    if (s.히로인 && s.히로인.관계 === "배우자") {
      var hd = E.heroDef();
      if (hd.엔딩) he = { 아이디: hd.아이디, 히로인: hd.이름, 이름: hd.엔딩.이름, 아이콘: hd.엔딩.아이콘 || "💍", 내용: hd.엔딩.내용 };
    }
    return { 특별: special || null, 히로인엔딩: he, 기본: base, 칭호: titles, 직업: job, 히로인들: heroines, 성적: s.성적, 행복도: s.행복도 };
  };

  // ---------------- 저장 ----------------
  E.save = function () { try { localStorage.setItem(I.SAVE_KEY, JSON.stringify(S())); } catch (e) {} };
  E.load = function () {
    try {
      var raw = localStorage.getItem(I.SAVE_KEY); if (!raw) return null;
      var s = JSON.parse(raw); if (!s || s.버전 !== 1) return null;
      // 이전 버전 저장 파일에 없는 항목 채우기
      s.돈 = s.돈 || 0; s.총수입 = s.총수입 || 0; s.구매 = s.구매 || {}; s.본뉴스 = s.본뉴스 || {};
      s.알아가는인연 = s.알아가는인연 || [];
      if (!s.외모) s.외모 = 1 + Math.floor(Math.random() * 10);
      if (s.히로인 && s.히로인.관계 === "만남") {
        if (s.히로인.만남턴 == null) s.히로인.만남턴 = s.총턴;
        if (s.히로인.교류횟수 == null) s.히로인.교류횟수 = 0;
      }
      I.buildCards(); I.S = s;
      E.initFreeTime();
      // 이전 저장의 고백·커플 카드나 즉시 교제 선택지를 그대로 실행하지 않도록 갱신합니다.
      if (s.단계 === "카드" && s.현재카드 && s.현재카드.자유행동 && s.자유시간) { s.현재카드 = E.freeTimeCard(); E.refreshOptions(); }
      if (s.단계 === "카드" && s.현재카드 && !s.현재카드.자유행동 && (s.현재카드._끼어들기 || (s.히로인 && s.히로인.관계 === "만남" && s.현재카드.히로인))) {
        var current = I.CARDS().find(function (c) { return c._id === s.현재카드._id; });
        if (current && I.eligible(current)) { s.현재카드 = I.clone(current); E.refreshOptions(); }
        else E.next();
      }
      return s;
    } catch (e) { return null; }
  };
  // ---------------- 도감 (인생이 바뀌어도 남는 기록) ----------------
  var COL_KEY = "baseball-life-collection";
  E.collection = function () {
    var c = null; try { c = JSON.parse(localStorage.getItem(COL_KEY)); } catch (e) {}
    c = c || {}; c.엔딩 = c.엔딩 || {}; c.업적 = c.업적 || {}; c.레어 = c.레어 || {}; c.인생수 = c.인생수 || 0;
    return c;
  };
  function saveCol(c) { try { localStorage.setItem(COL_KEY, JSON.stringify(c)); } catch (e) {} }
  function addTo(c, group, key, fresh, label) {
    if (!c[group][key]) { c[group][key] = { 처음: Date.now(), 횟수: 0 }; if (fresh) fresh.push(label || key); }
    c[group][key].횟수++;
  }
  E.colCounts = function (c) {
    var k = Object.keys(c.엔딩);
    return { 인생수: c.인생수, 엔딩수: k.filter(function (x) { return x.indexOf("특별:") === 0; }).length,
      히로인엔딩: k.filter(function (x) { return x.indexOf("히로인:") === 0; }).length, 레어: Object.keys(c.레어).length, 업적: Object.keys(c.업적).length };
  };
  E.noteRare = function (title) { var c = E.collection(); addTo(c, "레어", title); saveCol(c); };
  // 엔딩을 볼 때 한 번: 엔딩·업적을 도감에 기록하고 새로 발견한 이름들을 돌려줌
  E.recordLife = function () {
    var s = S(); if (s._도감) return s._도감새로 || [];
    var en = s.엔딩 || E.computeEnding(), c = E.collection(), fresh = [];
    c.인생수++;
    if (en.특별) addTo(c, "엔딩", "특별:" + en.특별.이름, fresh, en.특별.아이콘 + " " + en.특별.이름);
    addTo(c, "엔딩", "기본:" + en.기본.이름, fresh, en.기본.아이콘 + " " + en.기본.이름);
    if (en.직업 && s.진로확정) addTo(c, "엔딩", "직업:" + en.직업.이름, fresh, en.직업.아이콘 + " " + en.직업.이름);
    en.칭호.forEach(function (t) { addTo(c, "엔딩", "칭호:" + t.이름, fresh, t.아이콘 + " " + t.이름); });
    if (en.히로인엔딩) addTo(c, "엔딩", "히로인:" + en.히로인엔딩.아이디, fresh, en.히로인엔딩.아이콘 + " " + en.히로인엔딩.이름);
    var n = E.colCounts(c);
    (GD.업적 || []).forEach(function (a) {
      var ok = E.check(a.조건) && Object.keys(a.도감 || {}).every(function (k) { return (n[k] || 0) >= a.도감[k]; });
      if (ok) addTo(c, "업적", a.이름, fresh, "🏆 " + a.이름);
    });
    saveCol(c); s._도감 = true; s._도감새로 = fresh; E.save();
    return fresh;
  };

  // 엔딩에서 한 번만 진로 확정. 인생 수나 기존 엔딩의 획득 횟수는 다시 올리지 않습니다.
  E.chooseCareer = function (id) {
    var s = S(); if (!s || s.단계 !== "엔딩" || s.진로확정) return false;
    var career = GD.진로.find(function (c) { return c.아이디 === id; });
    if (!career) return false;
    E.recordLife();
    Object.keys(s.플래그).forEach(function (key) { if (key.indexOf("진로_") === 0) delete s.플래그[key]; });
    s.플래그[career.플래그] = true; s.진로확정 = id;
    var ending = E.computeEnding();
    if (s.엔딩) s.엔딩.직업 = ending.직업; else s.엔딩 = ending;
    var collection = E.collection(), fresh = [];
    addTo(collection, "엔딩", "직업:" + ending.직업.이름, fresh, ending.직업.아이콘 + " " + ending.직업.이름);
    saveCol(collection); s._도감새로 = (s._도감새로 || []).concat(fresh); E.save();
    return true;
  };

  E.reset = function () { try { localStorage.removeItem(I.SAVE_KEY); } catch (e) {} I.S = null; };
})();
