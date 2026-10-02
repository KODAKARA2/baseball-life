// 화면 그리기 (시작 화면, 인생 카드, 이벤트 카드, 애니메이션)
(function () {
  var U = window.U = {};
  var $ = function (s) { return document.querySelector(s); };
  var I = E._internal;
  var EMOJI = { rival: "🔥", parents: "👪", coach_little: "🧢", coach_high: "📣", buddy: "🤝", manager_pro: "📋",
    agent: "💼", child: "👶", interpreter: "🗣️", mlb_teammate: "🤜" };
  var ICON = {
    공: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#333" stroke-width="1.2"/><path d="M7 4.5c2 2.5 2 12.5 0 15M17 4.5c-2 2.5-2 12.5 0 15" fill="none" stroke="#d33" stroke-width="1.3" stroke-dasharray="1.6 1.4"/></svg>',
    미트: '<svg viewBox="0 0 24 24"><path d="M5 9c0-4 3-7 7-7s7 3 7 7v6c0 4-3 7-7 7s-7-3-7-7z" fill="#b5651d" stroke="#5a3210" stroke-width="1.2"/><circle cx="12" cy="11" r="3.2" fill="#8a4a14"/></svg>',
    배트: '<svg viewBox="0 0 24 24"><path d="M20.5 2.5c1 1 .9 2.3 0 3.2L9 17.2l-2.2-2.2L18.3 3.5c.9-.9 1.6-1.6 2.2-1z" fill="#d9a35b" stroke="#6b4419" stroke-width="1"/><path d="M6.6 15.2l2.2 2.2-1.6 1.6-2.2-2.2z" fill="#333"/><circle cx="4.6" cy="19.4" r="1.6" fill="#333"/></svg>'
  };
  U.icon = function () { return ICON[E.pos().아이콘] || ICON.공; };

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function br(t) { return esc(t).replace(/\n/g, "<br>"); }
  U.esc = esc; U.br = br;

  // 그림: 파일이 없으면 다음 후보 → 모두 없으면 기본 카드 디자인
  U.art = function (keys, fallbackIcon, overlay, cls) {
    keys = I.arr(keys).filter(Boolean);
    return '<div class="art ' + (cls || "") + '"><div class="art-fallback">' + (fallbackIcon || "⚾") + '</div>' +
      (keys.length ? '<img alt="" data-keys="' + esc(keys.join(",")) + '" src="images/' + esc(keys[0]) + '.png" onerror="U.imgFail(this)">' : "") +
      (overlay ? '<div class="overlay">' + overlay + "</div>" : "") + "</div>";
  };
  U.imgFail = function (img) {
    var keys = img.dataset.keys.split(","), i = keys.indexOf(img.getAttribute("src").replace(/^images\/|\.png$/g, ""));
    if (i >= 0 && i + 1 < keys.length) img.src = "images/" + keys[i + 1] + ".png"; else img.remove();
  };

  U.heroKeys = function () {
    var s = E.state(), base = s.단계 === "엔딩" ? "hero_retired" : (I.sdef(s.시기).그림 || "hero_pro");
    if (s.부상 > 0) return ["hero_injured", base];
    if (s.슬럼프 > 0) return ["hero_slump", base];
    return [base];
  };
  U.heroineKeys = function (id, rel) { var h = E.heroDef(id); return h ? [h.그림[rel] || h.그림.만남, h.그림.만남] : []; };

  // ---------------- 시작 화면 ----------------
  U.showSetup = function () {
    var sel = { pos: null, spec: null };
    $("#app").innerHTML =
      '<section class="setup"><h1>⚾ ' + esc(GD.설정.게임제목) + '</h1><p class="sub">한 장의 카드로 시작하는 야구 인생</p>' +
      '<label>주인공 이름<input id="nm" maxlength="8" placeholder="예: 강민준" autocomplete="off"></label>' +
      '<h3>포지션</h3><div class="grid" id="pos"></div><h3>특기</h3><div class="grid" id="spec"><p class="hint">포지션을 먼저 고르세요</p></div>' +
      '<button class="big" id="go" disabled>인생 시작!</button></section>';
    $("#pos").innerHTML = GD.포지션.map(function (p, i) { return '<button class="chip" data-i="' + i + '">' + esc(p.이름) + "</button>"; }).join("");
    function ok() { $("#go").disabled = !(sel.pos && sel.spec && $("#nm").value.trim()); }
    $("#pos").onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      sel.pos = GD.포지션[b.dataset.i]; sel.spec = null;
      [].forEach.call($("#pos").children, function (c) { c.classList.toggle("on", c === b); });
      var list = GD.특기.filter(function (t) { return t.분류 === sel.pos.분류; });
      $("#spec").innerHTML = list.map(function (t) { return '<button class="chip" data-n="' + esc(t.이름) + '"><b>' + esc(t.이름) + "</b><small>" + esc(t.설명) + "</small></button>"; }).join("");
      ok();
    };
    $("#spec").onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      sel.spec = b.dataset.n; [].forEach.call($("#spec").children, function (c) { c.classList.toggle("on", c === b); }); ok();
    };
    $("#nm").oninput = ok;
    $("#go").onclick = function () { E.newGame($("#nm").value.trim(), sel.pos.이름, sel.spec); U.showGame(); };
  };

  // ---------------- 게임 화면 ----------------
  U.showGame = function () {
    $("#app").innerHTML = '<header class="top" id="top"></header><section class="life" id="life"></section>' +
      '<section class="table" id="table"></section><nav class="actions" id="actions"></nav>';
    U.renderAll(true);
  };
  U.renderAll = function (deal) {
    var s = E.state();
    if (s.단계 === "엔딩") return U.showEnding();
    U.renderTop(); U.renderLife(); U.renderCard(deal);
  };

  U.renderTop = function () {
    var s = E.state(), sd = I.sdef(s.시기), yr = GD.설정.시작연도 + s.나이 - 10;
    $("#top").innerHTML = '<div class="stage">' + (sd.아이콘 || "⚾") + " <b>" + esc(s.시기) + "</b> · " + s.나이 + "세 · " + yr + "년" +
      (s.팀 && (s.시기 === "프로" || s.시기 === "메이저리그" || s.시기 === "군복무") ? '<small>' + esc(s.팀) + (s.시기 === "프로" ? (s.일군 ? " · 1군" : " · 2군") : s.플래그.마이너 ? " · 마이너" : "") + "</small>" : "") +
      '</div><button class="menu" onclick="U.openMenu()" aria-label="메뉴">☰</button>';
  };

  function bar(v, cls) { return '<span class="bar ' + (cls || "") + '"><i style="width:' + Math.max(0, Math.min(100, v)) + '%"></i></span>'; }
  U.bar = bar;

  U.renderLife = function (animateHeroine) {
    var s = E.state(), p = E.pos();
    var stats = E.posStats().map(function (k) { return "<span>" + k + " <b>" + s.능력치[k] + "</b></span>"; }).join("");
    var status = (s.부상 > 0 ? '<em class="bad">부상</em>' : "") + (s.슬럼프 > 0 ? '<em class="warn">슬럼프</em>' : "");
    var hero = '<div class="mini hero-mini" onclick="U.openHero()">' +
      U.art(U.heroKeys(), '<span class="posicon">' + U.icon() + "</span>",
        "<b>" + esc(s.이름) + '</b><small><span class="pi">' + U.icon() + "</span>" + esc(p.약칭) + "</small>", "card-art") + "</div>";
    var mid = '<div class="lifestats">' + '<div class="row">' + stats + "</div>" +
      '<div class="row common"><span>멘탈 <b>' + s.능력치.멘탈 + "</b></span><span>인기 <b>" + s.능력치.인기 + "</b></span><span>컨디션 <b>" + s.능력치.컨디션 + "</b></span>" +
      (s.시기 === "메이저리그" ? "<span>적응 <b>" + s.능력치.적응 + "</b></span>" : "") + "</div>" +
      '<div class="row"><span>😊 행복도 ' + bar(s.행복도, "happy") + "</span><span>🏅 성적 <b>" + s.성적 + "</b></span>" + status + "</div></div>";
    var her = "";
    if (s.히로인) {
      var h = E.heroDef(), rel = s.히로인.관계;
      her = '<div class="mini heroine-mini ' + (animateHeroine ? "attach" : "") + '" onclick="U.openHeroine()">' +
        U.art(U.heroineKeys(h.아이디, rel), "💗", "<b>" + esc(h.이름) + "</b><small>" + esc(rel) + "</small>", "card-art") +
        '<div class="aff">❤ ' + s.히로인.애정도 + bar(s.히로인.애정도, "love") + "</div></div>";
    } else her = '<div class="mini empty" onclick="U.openHeroine()"><span>💗</span><small>인연을<br>기다리는 중</small></div>';
    $("#life").innerHTML = hero + mid + her;
  };

  U.cardArtKeys = function (card) {
    var s = E.state();
    if (card._만남) return { keys: U.heroineKeys(card._만남, "만남"), icon: "💗", label: "<b>" + esc(E.heroDef(card._만남).이름) + "</b><small>첫 만남</small>" };
    if (card.히로인 && s.히로인) { var h = E.heroDef(); return { keys: U.heroineKeys(h.아이디, s.히로인.관계), icon: "💗", label: "<b>" + esc(h.이름) + "</b><small>" + esc(s.히로인.관계) + " · ❤ " + s.히로인.애정도 + "</small>" }; }
    var g = card.그림;
    if (g && GD.조연[g]) return { keys: [g], icon: EMOJI[g] || "👤", label: "<b>" + esc(GD.조연[g].이름) + "</b><small>" + esc(GD.조연[g].역할) + "</small>" };
    if (g && /^hero/.test(g)) return { keys: [g].concat(U.heroKeys()), icon: U.icon(), label: "<b>" + esc(s.이름) + "</b>" };
    return null;
  };

  U.renderCard = function (deal) {
    var s = E.state(), c = s.현재카드, sd = I.sdef(s.시기);
    if (!c) return;
    var a = U.cardArtKeys(c), r = s.결과;
    var front = '<div class="face front">' +
      (a ? U.art(a.keys, a.icon, a.label, "banner") : '<div class="art banner plain"><div class="art-fallback">' + (sd.아이콘 || "⚾") + "</div></div>") +
      '<div class="txt"><div class="tag">' + esc(c.시스템 ? "시즌" : s.시기) + (c.히로인 || c._만남 ? " · 💗" : "") + "</div><h2>" + esc(E.tpl(c.제목)) + "</h2><p>" + br(E.tpl(c.내용)) + "</p></div></div>";
    var back = '<div class="face back">' + (r ? U.resultHTML(r) : "") + "</div>";
    $("#table").innerHTML = '<div class="card3d ' + (r ? "flipped " : "") + (deal ? "deal" : "") + '" id="card">' + front + back + "</div>";
    U.renderActions();
  };

  U.resultHTML = function (r) {
    var chips = Object.keys(r.효과 || {}).filter(function (k) { return r.효과[k]; }).map(function (k) {
      var v = r.효과[k]; if (k === "부상" || k === "슬럼프") return '<span class="fx bad">' + k + (v > 0 ? " " + v + "장" : " 회복") + "</span>";
      return '<span class="fx ' + (v > 0 ? "up" : "down") + '">' + k + " " + (v > 0 ? "+" : "") + v + "</span>";
    }).join("");
    var pic = r.그림 ? U.art([r.그림].concat(U.heroKeys()), U.icon(), "<b>" + esc(E.state().이름) + "</b>", "banner small") : "";
    return pic + '<div class="txt">' + (r.성공 === true ? '<div class="tag ok">성공!</div>' : r.성공 === false ? '<div class="tag ng">실패…</div>' : "") +
      "<p>" + br(r.결과 || "…") + '</p><div class="fxs">' + chips + "</div>" +
      (r.알림 || []).map(function (n) { return '<div class="note">' + esc(n) + "</div>"; }).join("") + "</div>";
  };

  U.renderActions = function () {
    var s = E.state(), c = s.현재카드;
    if (s.단계 === "결과") { $("#actions").innerHTML = '<button class="big next" onclick="U.next()">다음 카드 ▶</button>'; return; }
    $("#actions").innerHTML = s.현재옵션.map(function (oi, i) {
      return '<button class="opt" onclick="U.choose(' + i + ')">' + esc(E.tpl(c.선택지[oi].글)) + "</button>";
    }).join("");
  };

  var busy = false;
  U.choose = function (i) {
    if (busy) return; busy = true;
    var before = E.state().히로인 && E.state().히로인.아이디;
    var r = E.choose(i);
    var after = E.state().히로인 && E.state().히로인.아이디;
    var card = $("#card"); card.querySelector(".back").innerHTML = U.resultHTML(r);
    card.classList.remove("deal"); card.classList.add("flipped");
    if (before && !after) { var m = document.querySelector(".heroine-mini"); if (m) m.classList.add("detach"); }
    setTimeout(function () { U.renderTop(); if (!(before && !after)) U.renderLife(!before && after); U.renderActions(); busy = false; }, before && !after ? 700 : 350);
    if (before && !after) setTimeout(function () { U.renderLife(); }, 750);
  };
  U.next = function () {
    if (busy) return; busy = true;
    $("#card").classList.add("discard");
    setTimeout(function () { E.next(); busy = false; U.renderAll(true); }, 320);
  };
})();
