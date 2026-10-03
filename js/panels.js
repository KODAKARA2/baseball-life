// 메뉴, 상세 카드 창, 커리어 요약과 엔딩, 시작
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var esc = U.esc, br = U.br, I = E._internal;

  // 창: 위쪽 ✕ 버튼은 스크롤해도 따라오고, 맨 아래에 큰 닫기 버튼이 있음 (아이폰 사파리 대응)
  function modal(html, closeLabel) {
    var m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="sheet"><div class="sheet-bar"><button class="close" aria-label="닫기">✕</button></div>' + html +
      '<button class="sheet-close">' + (closeLabel || "닫기") + "</button></div>";
    m.onclick = function (e) { if (e.target === m || e.target.closest(".close, .sheet-close")) m.remove(); };
    document.body.appendChild(m); return m;
  }
  U.closeModals = function () { [].forEach.call(document.querySelectorAll(".modal"), function (m) { m.remove(); }); };

  U.openMenu = function () {
    modal('<h2>메뉴</h2><div class="menu-list">' +
      '<button onclick="U.closeModals();U.openHero()">🧢 내 인생 카드 · 능력치</button>' +
      '<button onclick="U.closeModals();U.openHeroine()">💗 히로인 카드 · 애정도</button>' +
      '<button onclick="U.closeModals();U.openCareer()">📊 커리어 기록</button>' +
      '<button onclick="U.closeModals();U.openShop()">💰 지갑 · 상점</button>' +
      '<button onclick="U.closeModals();U.openCollection()">📖 엔딩 도감 · 업적</button>' +
      '<button class="danger" onclick="U.newLife()">🔄 새 인생 시작</button></div>' +
      '<p class="hint">진행 상황은 카드를 넘길 때마다 자동 저장됩니다.</p>');
  };

  U.newLife = function () {
    if (!confirm("지금 인생을 버리고 새 인생을 시작할까요?")) return;
    U.closeModals(); E.reset(); U.showSetup();
  };

  function statLines(keys) {
    var s = E.state();
    return keys.map(function (k) { return '<div class="sl"><span>' + k + "</span>" + U.bar(s.능력치[k]) + "<b>" + s.능력치[k] + "</b></div>"; }).join("");
  }

  // 외모 효과 설명 (지금 레벨에서 몇 % 이득/손해인지)
  function looksInfo() {
    function pct(k) { var v = Math.round((E.looksMult(k) - 1) * 100); return (v > 0 ? "+" : "") + v + "%"; }
    var t = "히로인 만남·애정도 " + pct("이성") + " · 성적·행복도 " + pct("성적행복");
    if (E.looksMult("능력치") > 1) t += " · 능력치 성장 " + pct("능력치") + " (눈물)";
    return '<p class="kv">😎 ' + U.looksTag() + "<br><small>" + t + "</small></p>";
  }

  // 주인공 카드 (그림 아래 1/4에 이름과 능력치)
  U.openHero = function () {
    var s = E.state(), p = E.pos();
    var over = '<b>' + esc(s.이름) + ' <span class="pi">' + U.icon() + "</span> " + esc(p.이름) + "</b><small>" + esc(s.특기) + " · " + s.나이 + "세</small>" +
      '<div class="ovstats">' + E.posStats().map(function (k) { return k + " " + s.능력치[k]; }).join(" · ") + "</div>";
    var st = (s.부상 > 0 ? "🩹 부상 (" + s.부상 + "장 남음) " : "") + (s.슬럼프 > 0 ? "🌧️ 슬럼프 (" + s.슬럼프 + "장 남음)" : "") || "건강";
    modal('<div class="bigcard">' + U.art(U.heroKeys(), '<span class="posicon">' + U.icon() + "</span>", over, "card-art") + "</div>" +
      "<h3>포지션 능력치 <small>(상한 " + E.cap() + ")</small></h3>" + statLines(E.posStats()) +
      "<h3>공통 능력치</h3>" + statLines(["멘탈", "인기", "컨디션"].concat(s.시기 === "메이저리그" || s.능력치.적응 ? ["적응"] : [])) +
      '<div class="sl"><span>행복도</span>' + U.bar(s.행복도, "happy") + "<b>" + s.행복도 + "</b></div>" +
      '<p class="kv">🏅 성적 점수 <b>' + s.성적 + "</b> · 상태: " + st + "</p>" + looksInfo() +
      (s.보조특기 ? '<p class="kv">🎁 랜덤 보너스: <b>' + esc(s.보조특기) + "</b>도 특기(" + esc(E.spec().능력치) + ")만큼 빠르게 자랍니다</p>" : ""));
  };

  // 히로인 카드
  U.openHeroine = function () {
    var s = E.state(), html = "";
    if (s.히로인) {
      var h = E.heroDef(), r = s.히로인.관계, L = GD.설정.연애, on = s.히로인.애정도 >= L.도움기준;
      html += '<div class="bigcard">' + U.art(U.heroineKeys(h.아이디, r), "💗",
        "<b>" + esc(h.이름) + "</b><small>" + esc(r) + " · " + esc(h.유형) + '</small><div class="ovstats">❤ 애정도 ' + s.히로인.애정도 + " / 100</div>", "card-art") + "</div>" +
        '<div class="sl"><span>애정도</span>' + U.bar(s.히로인.애정도, "love") + "<b>" + s.히로인.애정도 + "</b></div>" +
        '<p class="kv">성격: ' + esc(h.성격) + "</p><p>" + esc(h.소개) + "</p>" +
        '<p class="effect ' + (on ? "on" : "") + '">✨ 고유효과 ' + (on ? "(발동 중)" : "(애정도 " + L.도움기준 + " 이상이면 발동)") + "<br>" + esc((h.고유효과 || {}).설명 || "") + "</p>" +
        '<p class="hint">데이트·기념일·고민 들어주기 카드로 애정도가 오릅니다. 훈련이나 원정에만 집중하면 더 빨리 떨어지고, 0이 되면 이별합니다.</p>';
    } else html += '<h2>💗 히로인</h2><p>아직 곁에 있는 사람이 없다. 인연은 시기마다 찾아온다.</p>';
    if (s.히로인2) {
      var h2 = E.heroDef(s.히로인2.아이디);
      html += '<h3>🤫 몰래 만나는 사람</h3><div class="bigcard">' + U.art(U.heroineKeys(h2.아이디, "연인"), "🤫",
        "<b>" + esc(h2.이름) + "</b><small>비밀 연인</small>", "card-art") + "</div>" +
        '<div class="sl"><span>애정도</span>' + U.bar(s.히로인2.애정도, "love") + "<b>" + s.히로인2.애정도 + "</b></div>" +
        '<p class="hint">양다리 중에는 프러포즈를 할 수 없고, 들키면 둘 다 잃을 수도 있습니다.</p>';
    }
    if (s.지난히로인.length) html += "<h3>지나간 인연</h3>" + s.지난히로인.map(function (x) { return "<p>💔 " + esc(x.이름) + " (" + esc(x.관계) + "에서 이별)</p>"; }).join("");
    if (s.자녀) html += "<p>👶 자녀 " + s.자녀 + "명</p>";
    modal(html);
  };

  function totalsHTML() {
    var T = E.totals(), pit = E.pos().분류 === "투수", x = [];
    if (!T.시즌) return "<p>1군(빅리그) 기록이 없습니다.</p>";
    x.push(T.시즌 + "시즌" + (T.메이저시즌 ? " (메이저리그 " + T.메이저시즌 + "시즌)" : ""));
    if (pit) {
      if (T.승 != null) x.push(T.승 + "승 " + (T.패 || 0) + "패");
      if (T.세이브) x.push(T.세이브 + "세이브"); if (T.홀드) x.push(T.홀드 + "홀드");
      x.push("평균자책점 " + T.평균자책점, T.탈삼진 + "탈삼진", T.이닝 + "이닝");
    } else x.push("타율 " + T.타율, T.안타 + "안타", T.홈런 + "홈런", T.타점 + "타점", T.도루 + "도루");
    return '<p class="totals">' + x.join(" · ") + "</p>";
  }
  function awardsHTML() {
    var cnt = {}; E.state().수상.forEach(function (a) { cnt[a.이름] = (cnt[a.이름] || 0) + 1; });
    var k = Object.keys(cnt); if (!k.length) return "<p>수상 없음</p>";
    return '<div class="awards">' + k.map(function (n) { return "<span>🏅 " + esc(n) + (cnt[n] > 1 ? " ×" + cnt[n] : "") + "</span>"; }).join("") + "</div>";
  }
  function momentsHTML(n) {
    var m = E.state().순간; if (!m.length) return "<p>-</p>";
    return '<ul class="moments">' + m.slice(-n).map(function (x) { return "<li><b>" + x.나이 + "세</b> " + esc(x.글) + "</li>"; }).join("") + "</ul>";
  }
  function seasonsHTML() {
    var r = E.state().기록; if (!r.length) return "";
    return '<details><summary>시즌별 기록 (' + r.length + ')</summary><ul class="seasons">' + r.map(function (L) {
      return "<li><b>" + L.연도 + "</b> " + esc(L.팀) + "<br><small>" + esc(E.fmtLine(L)) + "</small></li>";
    }).join("") + "</ul></details>";
  }

  // 상점: 프로가 되어 번 돈으로 선물·자동차·재활·휴식 등을 산다 (data/shop.js)
  U.openShop = function (msg) {
    U.closeModals();
    var s = E.state();
    var rows = E.shopList().sort(function (a, b) { return (b.stageOk ? 1 : 0) - (a.stageOk ? 1 : 0); }).map(function (e) {
      var it = e.item, why = e.sold ? "구입 완료" : !e.stageOk ? (it.시기설명 || "지금은 못 씀") : !e.cond ? (it.잠금설명 || "조건 안 됨") : e.wait ? "카드 " + e.wait + "장 뒤" : (s.돈 || 0) < it.가격 ? "돈 부족" : "";
      return '<div class="shop-item' + (e.ok ? "" : " off") + '"><div class="si-ic">' + (it.아이콘 || "🛍️") + '</div><div class="si-tx"><b>' + esc(it.이름) +
        "</b><small>" + esc(it.설명 || "") + '</small></div><button ' + (e.ok ? "" : "disabled ") + 'data-n="' + esc(it.이름) + '">' + (why || E.money(it.가격)) + "</button></div>";
    }).join("");
    var m = modal('<h2>💰 지갑 · 상점</h2><p class="kv">가진 돈 <b>' + E.money(s.돈) + "</b> · 통산 수입 " + E.money(s.총수입) + "</p>" +
      (msg || "") + (s.돈 || s.총수입 ? "" : '<p class="hint">프로 선수가 되면 연봉과 계약금을 받습니다.</p>') + '<div class="shop">' + rows + "</div>", "상점 나가기");
    m.querySelector(".shop").onclick = function (ev) {
      var b = ev.target.closest("button[data-n]"); if (!b || b.disabled) return;
      var r = E.buy(b.dataset.n); if (!r) return;
      U.renderLife(); if (E.state().단계 === "카드") U.renderActions();
      var chips = U.chips(r.효과);
      U.openShop('<div class="note">' + esc(r.결과) + '<div class="fxs">' + chips + "</div></div>");
    };
  };

  U.openCareer = function () {
    var s0 = E.state();
    modal("<h2>📊 커리어</h2><p class=\"kv\">💰 가진 돈 " + E.money(s0.돈) + " · 통산 수입 " + E.money(s0.총수입) + "</p><h3>통산 기록</h3>" + totalsHTML() + "<h3>수상</h3>" + awardsHTML() + "<h3>결정적 순간들</h3>" + momentsHTML(30) + seasonsHTML());
  };

  // ---------------- 은퇴 · 엔딩 ----------------
  U.showEnding = function () {
    var s = E.state(), en = s.엔딩 || E.computeEnding(), p = E.pos(), fresh = E.recordLife(), he = en.히로인엔딩;
    var hs = en.히로인들.map(function (h) {
      return '<div class="mini">' + U.art(U.heroineKeys(h.아이디, h.관계), "💗", "<b>" + esc(h.이름) + "</b><small>" + esc(h.결말) + "</small>", "card-art") + "</div>";
    }).join("") || "<p>함께한 히로인이 없습니다.</p>";
    $("#app").innerHTML = '<section class="ending deal">' +
      '<div class="bigcard">' + U.art(["hero_retired"], '<span class="posicon">' + U.icon() + "</span>",
        "<b>" + esc(s.이름) + "</b><small>" + esc(p.이름) + " · " + (s.은퇴나이 || s.나이) + '세 은퇴</small><div class="ovstats">성적 ' + en.성적 + " · 행복도 " + en.행복도 + "</div>", "card-art") + "</div>" +
      (fresh.length ? '<div class="fresh"><b>📖 도감에 새로 기록!</b>' + fresh.map(function (f) { return "<span>" + esc(f) + "</span>"; }).join("") + "</div>" : "") +
      (en.특별 ? '<div class="end-title">' + en.특별.아이콘 + " " + esc(en.특별.이름) + "</div><p>" + br(E.tpl(en.특별.내용)) + "</p>" +
        '<p class="hint" style="text-align:center">인생 유형: ' + en.기본.아이콘 + " " + esc(en.기본.이름) + "</p>"
       : '<div class="end-title">' + en.기본.아이콘 + " " + esc(en.기본.이름) + "</div><p>" + br(E.tpl(en.기본.내용)) + "</p>") +
      (he ? '<div class="he-end">' + U.art(U.heroineKeys(he.아이디, "배우자"), "💍", null, "card-art") + '<div><div class="he-title">' + he.아이콘 + " " + esc(he.이름) +
        "</div><small>" + esc(he.히로인) + " 전용 엔딩</small><p>" + br(E.tpl(he.내용)) + "</p></div></div>" : "") +
      en.칭호.map(function (t) { return '<div class="badge">' + t.아이콘 + " " + esc(t.이름) + "<small>" + esc(E.tpl(t.내용)) + "</small></div>"; }).join("") +
      (en.직업 ? '<div class="badge job">' + en.직업.아이콘 + " 은퇴 후: " + esc(en.직업.이름) + "<small>" + esc(E.tpl(en.직업.내용)) + "</small></div>" : "") +
      "<h3>통산 기록</h3>" + totalsHTML() + '<p class="kv">💰 통산 수입 ' + E.money(s.총수입) + " · 은퇴 때 자산 " + E.money(s.돈) + "</p><h3>수상</h3>" + awardsHTML() +
      "<h3>결정적 순간들</h3>" + momentsHTML(12) + '<h3>함께했던 히로인들</h3><div class="heroines">' + hs + "</div>" + seasonsHTML() +
      '<div class="share-row"><button class="big share" onclick="U.shareResult()">📤 결과 카드 공유</button><button class="big share2" onclick="U.saveResult()">💾 이미지 저장</button></div>' +
      '<button class="big alt4" onclick="U.openCollection()">📖 엔딩 도감 · 업적 보기</button>' +
      (s.자녀 > 0 ? '<button class="big heir" onclick="U.restart(2)">👶 내 아이로 이어하기 (' + ((s.세대 || 1) + 1) + "대째)</button>" : "") +
      '<button class="big" onclick="U.restart(0)">새 인생 시작</button>' +
      ((s.외모 || 0) < 10 ? '<button class="big alt" onclick="U.restart(10)">✨ 새 인생을 외모 레벨 10으로 시작하기</button>' : "") +
      ((s.외모 || 0) > 1 ? '<button class="big alt2" onclick="U.restart(1)">😅 새 인생을 외모 레벨 1로 시작하기</button>' : "") +
      '<button class="big alt3" onclick="U.restart(-1)">🎁 랜덤 보너스를 받고 새 인생 시작하기</button>' + "</section>";
    U.prepResult();
  };

  // 엔딩 뒤 새 인생: mode 10 → 외모 10, 1 → 외모 1, -1 → 랜덤 보너스, 2 → 2세 이어하기, 0 → 보너스 없음
  U.restart = function (mode) {
    var s = E.state() || {};
    var b = mode === 2 ? { 이어하기: { 아버지: s.이름, 외모: s.외모, 돈: s.돈, 세대: s.세대 || 1 } } : mode === 10 ? { 외모: 10 } : mode === 1 ? { 외모: 1 } : mode === -1 ? { 랜덤보너스: true } : null;
    try { if (b) localStorage.setItem(U.BONUS_KEY, JSON.stringify(b)); else localStorage.removeItem(U.BONUS_KEY); } catch (e) {}
    E.reset(); U.showSetup();
  };

  // ---------------- 엔딩 도감 · 업적 ----------------
  // 잠긴 엔딩의 힌트: 조건에서 자동으로 만듦
  var HINT = { 성적: ["높은 성적", "낮은 성적"], 행복도: ["행복", "불행"], 돈: ["큰 재산", "적은 재산"], 자녀: ["아이들", ""], 은퇴나이: ["늦은 은퇴", "이른 은퇴"],
    팀이동: ["이적", "원클럽맨"], 인기: ["높은 인기", ""], 수상수: ["많은 수상", "적은 수상"], 연차: ["프로 생활", "프로 미진출"], 이별수: ["이별", "한 사람만"], 멘탈: ["강한 멘탈", ""], 세대: ["2세", ""] };
  function hint(c) {
    c = c || {}; var h = [];
    Object.keys(c.최소 || {}).forEach(function (k) { if ((HINT[k] || [])[0]) h.push(HINT[k][0]); });
    Object.keys(c.최대 || {}).forEach(function (k) { if ((HINT[k] || [])[1]) h.push(HINT[k][1]); });
    if (c.관계) h.push("결혼");
    I.arr(c.수상).concat(I.arr(c.플래그), I.arr(c.구매)).forEach(function (x) { h.push(String(x).replace(/^진로_.*/, "은퇴 후 진로").replace("양다리몰락", "양다리").replace("육성출신", "육성선수")); });
    return h.length ? "힌트: " + h.join(" · ") : "";
  }
  U.openCollection = function () {
    var c = E.collection(), n = E.colCounts(c), got = c.엔딩;
    function row(g, icon, name, sub) {
      return '<div class="col-item' + (g ? "" : " locked") + '"><span class="ci">' + (g ? icon : "❓") + "</span><div><b>" + esc(g ? name : "???") + "</b>" +
        (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div>" + (g && g.횟수 > 1 ? "<em>×" + g.횟수 + "</em>" : "") + "</div>";
    }
    function sub() { return [].slice.call(arguments).filter(Boolean).join(" · "); }
    var heroes = GD.히로인.filter(function (h) { return h.엔딩; }), rares = GD.카드.filter(function (x) { return x.레어; });
    var achN = GD.업적.filter(function (a) { return c.업적[a.이름]; }).length;
    modal('<h2>📖 엔딩 도감</h2><div class="col-sum"><span>🧢 살아 본 인생 <b>' + n.인생수 + "</b></span><span>🎬 특별 엔딩 <b>" + n.엔딩수 + "/" + GD.특별엔딩.length +
      "</b></span><span>💍 히로인 엔딩 <b>" + n.히로인엔딩 + "/" + heroes.length + "</b></span><span>🏆 업적 <b>" + achN + "/" + GD.업적.length +
      "</b></span><span>✨ 레어 카드 <b>" + n.레어 + "/" + rares.length + "</b></span></div>" +
      "<h3>🎬 특별 엔딩</h3>" + GD.특별엔딩.map(function (e) { var g = got["특별:" + e.이름]; return row(g, e.아이콘, e.이름, g ? "" : hint(e.조건)); }).join("") +
      "<h3>💍 히로인 전용 엔딩</h3>" + heroes.map(function (h) { var g = got["히로인:" + h.아이디]; return row(g, h.엔딩.아이콘 || "💍", h.엔딩.이름, g ? h.이름 + " 전용 엔딩" : "힌트: " + h.이름 + " · 결혼한 채 은퇴"); }).join("") +
      "<h3>🏆 업적</h3>" + GD.업적.map(function (a) { var g = c.업적[a.이름];
        return '<div class="col-item' + (g ? "" : " locked") + '"><span class="ci">' + (g ? a.아이콘 : "🔒") + "</span><div><b>" + esc(a.이름) + "</b><small>" + esc(a.설명) + "</small></div></div>"; }).join("") +
      "<h3>✨ 레어 카드</h3>" + rares.map(function (x) { return row(c.레어[x.제목], "✨", x.제목, ""); }).join("") +
      "<h3>🌈 인생 유형</h3>" + GD.기본엔딩.map(function (e) { return row(got["기본:" + e.이름], e.아이콘, e.이름, "성적 " + e.성적 + " · 행복도 " + e.행복도); }).join("") +
      "<h3>🎖️ 칭호 · 은퇴 후 직업</h3>" + GD.직업엔딩.map(function (e) { var ch = e.종류 === "칭호", g = got[(ch ? "칭호:" : "직업:") + e.이름];
        return row(g, e.아이콘, e.이름, sub(ch ? "칭호" : "은퇴 후 직업", g ? "" : hint(e.조건))); }).join("") +
      '<p class="hint">도감은 이 기기(브라우저)에 저장되어, 새 인생을 시작해도 사라지지 않습니다.</p>');
  };

  // ---------------- 결과 카드 이미지 (공유 · 저장) ----------------
  function rrect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  // 글을 maxW 너비로 줄바꿈해서 쓰고, 다음 줄의 y를 돌려줌
  function wrap(x, text, tx, y, maxW, lh, maxLines) {
    var lines = [], line = "";
    String(text || "").replace(/\s+/g, " ").split(" ").forEach(function (w) {
      var t = line ? line + " " + w : w;
      if (x.measureText(t).width <= maxW) { line = t; return; }
      if (line) lines.push(line);
      line = w;
      while (x.measureText(line).width > maxW) {
        var ch = Array.from(line), k = ch.length;
        while (k > 1 && x.measureText(ch.slice(0, k).join("")).width > maxW) k--;
        lines.push(ch.slice(0, k).join("")); line = ch.slice(k).join("");
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = Array.from(lines[maxLines - 1]).slice(0, -1).join("") + "…"; }
    lines.forEach(function (l, i) { x.fillText(l, tx, y + i * lh); });
    return y + lines.length * lh;
  }
  function drawResult(img) {
    var s = E.state(), en = s.엔딩 || E.computeEnding(), p = E.pos(), he = en.히로인엔딩, main = en.특별 || en.기본, L = GD.설정.외모 || {};
    var W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d"), FF = 'px "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';
    function font(sz, b, color) { x.font = (b ? "bold " : "") + sz + FF; x.fillStyle = color || "#fff"; }
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1d3a5f"); g.addColorStop(1, "#0b1626");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = "#e8c15a"; x.lineWidth = 8; rrect(x, 36, 36, W - 72, H - 72, 40); x.stroke();
    x.textAlign = "left"; font(34, true, "#e8c15a"); x.fillText("⚾ " + (GD.설정.게임제목 || "야구 인생 카드"), 80, 112);
    // 왼쪽: 은퇴한 주인공 그림 (없으면 기본 디자인)
    var ix = 80, iy = 150, iw = 400, ih = 600;
    x.save(); rrect(x, ix, iy, iw, ih, 28); x.clip();
    var g2 = x.createLinearGradient(0, iy, 0, iy + ih); g2.addColorStop(0, "#2c5d8f"); g2.addColorStop(1, "#173556"); x.fillStyle = g2; x.fillRect(ix, iy, iw, ih);
    if (img) x.drawImage(img, ix, iy, iw, ih); else { x.textAlign = "center"; font(180); x.fillText("⚾", ix + iw / 2, iy + ih / 2 + 60); x.textAlign = "left"; }
    x.restore();
    // 오른쪽: 이름과 기록
    var rx = 520, y = 205;
    font(60, true); y = wrap(x, s.이름, rx, y, 480, 66, 1);
    font(30, false, "#b8c7da"); x.fillText(p.이름 + " · " + (s.은퇴나이 || s.나이) + "세 은퇴", rx, y + 2); y += 46;
    var v = s.외모 || 5; x.fillText("외모 Lv." + v + (v >= (L.미남 || 8) ? " 미남" : v <= (L.추남 || 3) ? " 추남" : "") + ((s.세대 || 1) > 1 ? " · " + s.세대 + "대째" : ""), rx, y + 2); y += 70;
    [["성적", en.성적], ["행복도", en.행복도], ["통산 수입", E.money(s.총수입)], ["은퇴 때 자산", E.money(s.돈)], ["수상", s.수상.length + "회"], ["프로 생활", (s.연차 || 0) + "년"]].forEach(function (r) {
      font(28, false, "#b8c7da"); x.fillText(r[0], rx, y); font(36, true); x.textAlign = "right"; x.fillText(String(r[1]), 1000, y); x.textAlign = "left";
      x.fillStyle = "rgba(255,255,255,.12)"; x.fillRect(rx, y + 18, 480, 2); y += 64;
    });
    // 아래: 엔딩
    x.textAlign = "center"; y = 830;
    font(50, true, "#ffe08a"); y = wrap(x, main.아이콘 + " " + main.이름, 540, y, 900, 62, 2) + 8;
    font(29, false, "#dfe8f3"); y = wrap(x, E.tpl(main.내용), 540, y, 900, 42, 4) + 14;
    var tj = en.칭호.map(function (t) { return t.아이콘 + " " + t.이름; }); if (en.직업) tj.push(en.직업.아이콘 + " " + en.직업.이름);
    if (tj.length) { font(30, true, "#e8c15a"); y = wrap(x, tj.join("  ·  "), 540, y, 900, 42, 2) + 6; }
    var love = he ? "💍 " + he.히로인 + " — 「" + he.이름 + "」" : en.히로인들.length ? "💗 " + en.히로인들.map(function (h) { return h.이름; }).join(", ") : "";
    if (love) { font(30, false, "#ffc4d6"); y = wrap(x, love, 540, y, 900, 42, 1) + 6; }
    var cnt = {}; s.수상.forEach(function (a) { cnt[a.이름] = (cnt[a.이름] || 0) + 1; });
    var aw = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (k) { return k + (cnt[k] > 1 ? " ×" + cnt[k] : ""); });
    if (aw.length) { font(27, false, "#c9d5e5"); wrap(x, "🏅 " + aw.join(" · "), 540, y, 900, 38, 3); }
    var url = /^https?:/.test(location.protocol) ? location.host + location.pathname.replace(/index\.html$/, "") : "";
    font(26, false, "#8fa3bb"); x.fillText(url ? "🔗 " + url.replace(/\/$/, "") : "야구 인생 카드", 540, H - 76);
    return cv;
  }
  // 그림이 있으면 넣어서, 그림을 못 쓰는 환경(파일로 직접 연 경우 등)이면 그림 없이 만듦
  U.resultBlob = function (cb) {
    function out(img) {
      try { drawResult(img).toBlob(function (b) { if (b) cb(b); else if (img) out(null); else cb(null); }, "image/png"); }
      catch (e) { if (img) out(null); else cb(null); }
    }
    var im = new Image(); im.onload = function () { out(im); }; im.onerror = function () { out(null); };
    im.src = "images/hero_retired.png";
  };
  var resultCache = null;
  U.prepResult = function () { resultCache = null; U.resultBlob(function (b) { resultCache = b; }); };
  function withResult(cb) { if (resultCache) cb(resultCache); else U.resultBlob(function (b) { resultCache = b; cb(b); }); }
  function resultName() { return "야구인생_" + (E.state().이름 || "카드") + ".png"; }
  // 저장: 이미지를 창에 띄워 길게 눌러 저장(휴대폰)하거나 파일로 내려받기
  U.saveResult = function () {
    withResult(function (b) {
      if (!b) { alert("이미지를 만들지 못했어요."); return; }
      var u = URL.createObjectURL(b);
      modal('<h2>💾 결과 카드</h2><img class="result-img" src="' + u + '" alt="결과 카드"><p class="hint">휴대폰은 이미지를 길게 눌러 저장하세요.</p>' +
        '<a class="big share2 dl" href="' + u + '" download="' + esc(resultName()) + '">⬇️ 파일로 내려받기</a>');
    });
  };
  // 공유: 휴대폰 공유창(카톡·인스타 등)으로 이미지 보내기. 안 되는 브라우저면 저장 창을 띄움
  U.shareResult = function () {
    withResult(function (b) {
      var s = E.state(), en = s.엔딩 || E.computeEnding(), main = en.특별 || en.기본;
      var text = "⚾ " + s.이름 + "의 야구 인생: " + main.아이콘 + " " + main.이름, url = /^https?:/.test(location.protocol) ? location.href.split("#")[0] : "";
      var f = null; try { f = b ? new File([b], resultName(), { type: "image/png" }) : null; } catch (e) {}
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: "야구 인생 카드", text: text + (url ? "\n" + url : "") }).catch(function () {});
      else U.saveResult();
    });
  };

  // ---------------- 시작 ----------------
  window.addEventListener("load", function () {
    if (E.load()) U.showGame(); else U.showSetup();
  });
})();
