// 메뉴, 상세 카드 창, 커리어 요약과 엔딩, 시작
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var esc = U.esc, br = U.br, I = E._internal;

  function modal(html) {
    var m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="sheet"><button class="close" aria-label="닫기">✕</button>' + html + "</div>";
    m.onclick = function (e) { if (e.target === m || e.target.classList.contains("close")) m.remove(); };
    document.body.appendChild(m); return m;
  }
  U.closeModals = function () { [].forEach.call(document.querySelectorAll(".modal"), function (m) { m.remove(); }); };

  U.openMenu = function () {
    modal('<h2>메뉴</h2><div class="menu-list">' +
      '<button onclick="U.closeModals();U.openHero()">🧢 내 인생 카드 · 능력치</button>' +
      '<button onclick="U.closeModals();U.openHeroine()">💗 히로인 카드 · 애정도</button>' +
      '<button onclick="U.closeModals();U.openCareer()">📊 커리어 기록</button>' +
      '<button onclick="U.closeModals();U.openShop()">💰 지갑 · 상점</button>' +
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
      '<p class="kv">🏅 성적 점수 <b>' + s.성적 + "</b> · 상태: " + st + "</p>");
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
      (msg || "") + (s.돈 || s.총수입 ? "" : '<p class="hint">프로 선수가 되면 연봉과 계약금을 받습니다.</p>') + '<div class="shop">' + rows + "</div>");
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
    var s = E.state(), en = s.엔딩 || E.computeEnding(), p = E.pos();
    var hs = en.히로인들.map(function (h) {
      return '<div class="mini">' + U.art(U.heroineKeys(h.아이디, h.관계), "💗", "<b>" + esc(h.이름) + "</b><small>" + esc(h.결말) + "</small>", "card-art") + "</div>";
    }).join("") || "<p>함께한 히로인이 없습니다.</p>";
    $("#app").innerHTML = '<section class="ending deal">' +
      '<div class="bigcard">' + U.art(["hero_retired"], '<span class="posicon">' + U.icon() + "</span>",
        "<b>" + esc(s.이름) + "</b><small>" + esc(p.이름) + " · " + (s.은퇴나이 || s.나이) + '세 은퇴</small><div class="ovstats">성적 ' + en.성적 + " · 행복도 " + en.행복도 + "</div>", "card-art") + "</div>" +
      '<div class="end-title">' + en.기본.아이콘 + " " + esc(en.기본.이름) + "</div><p>" + br(E.tpl(en.기본.내용)) + "</p>" +
      en.칭호.map(function (t) { return '<div class="badge">' + t.아이콘 + " " + esc(t.이름) + "<small>" + esc(E.tpl(t.내용)) + "</small></div>"; }).join("") +
      (en.직업 ? '<div class="badge job">' + en.직업.아이콘 + " 은퇴 후: " + esc(en.직업.이름) + "<small>" + esc(E.tpl(en.직업.내용)) + "</small></div>" : "") +
      "<h3>통산 기록</h3>" + totalsHTML() + '<p class="kv">💰 통산 수입 ' + E.money(s.총수입) + " · 은퇴 때 자산 " + E.money(s.돈) + "</p><h3>수상</h3>" + awardsHTML() +
      "<h3>결정적 순간들</h3>" + momentsHTML(12) + '<h3>함께했던 히로인들</h3><div class="heroines">' + hs + "</div>" + seasonsHTML() +
      '<button class="big" onclick="E.reset();U.showSetup()">새 인생 시작</button></section>';
  };

  // ---------------- 시작 ----------------
  window.addEventListener("load", function () {
    if (E.load()) U.showGame(); else U.showSetup();
  });
})();
