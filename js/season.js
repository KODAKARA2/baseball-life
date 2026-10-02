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
    function give(n, pts) { got.push(n); I.addAward(n, L.연도); s.성적 += pts || 0; }
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

  E.endYear = function () {
    var s = S(), L = seasonLine();
    if (L) {
      s.기록.push(L); s.성적 += L.가치;
      var got = awards(L);
      var lines = [s.팀 + " · " + (L.메이저 ? "메이저리그" : "1군"), fmtLine(L)];
      if (got.length) lines.push("🏅 " + got.join(", "));
      s.대기열.unshift({ 시스템: true, 제목: L.연도 + " 시즌 결산", 내용: lines.join("\n"), 그림: got.length ? "hero_victory" : null,
        선택지: [{ 글: "다음 시즌으로" }] });
    }
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
    var base = GD.기본엔딩.find(function (e) { return (e.성적 === "높음") === ph && (e.행복도 === "높음") === hh; }) || GD.기본엔딩[0];
    var titles = GD.직업엔딩.filter(function (e) { return e.종류 === "칭호" && E.check(e.조건); });
    var job = GD.직업엔딩.find(function (e) { return e.종류 !== "칭호" && E.check(e.조건); });
    var heroines = s.지난히로인.slice();
    if (s.히로인) { var h = E.heroDef(); heroines.push({ 아이디: h.아이디, 이름: h.이름, 관계: s.히로인.관계, 결말: s.히로인.관계 === "배우자" ? "평생의 반려자" : "함께" }); }
    return { 기본: base, 칭호: titles, 직업: job, 히로인들: heroines, 성적: s.성적, 행복도: s.행복도 };
  };

  // ---------------- 저장 ----------------
  E.save = function () { try { localStorage.setItem(I.SAVE_KEY, JSON.stringify(S())); } catch (e) {} };
  E.load = function () {
    try {
      var raw = localStorage.getItem(I.SAVE_KEY); if (!raw) return null;
      var s = JSON.parse(raw); if (!s || s.버전 !== 1) return null;
      I.buildCards(); I.S = s; return s;
    } catch (e) { return null; }
  };
  E.reset = function () { try { localStorage.removeItem(I.SAVE_KEY); } catch (e) {} I.S = null; };
})();
