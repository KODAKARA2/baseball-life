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
  // 주인공 그림은 외모 레벨에 맞는 그림을 먼저 찾음: 미남(기본) / 평범 _plain / 추남 _ugly. 없으면 기본 그림
  U.looksSuffix = function () {
    var L = GD.설정.외모 || {}, v = (E.state() || {}).외모 || 5;
    return v >= (L.미남 || 8) ? "" : v <= (L.추남 || 3) ? "_ugly" : "_plain";
  };
  U.heroArt = function (keys) {
    var sx = U.looksSuffix(), out = [];
    I.arr(keys).forEach(function (k) { if (sx && /^hero_/.test(k)) out.push(k + sx); out.push(k); });
    return out;
  };
  U.art = function (keys, fallbackIcon, overlay, cls, bg) {
    keys = U.heroArt(I.arr(keys).filter(Boolean));
    var st = bg ? ' style="background-image:url(images/' + esc(bg) + (/\.\w+$/.test(bg) ? "" : ".png") + '),linear-gradient(160deg,#2c5d8f,#173556)"' : "";
    return '<div class="art ' + (cls || "") + (bg ? " has-bg" : "") + '"' + st + '><div class="art-fallback">' + (fallbackIcon || "⚾") + '</div>' +
      (keys.length ? '<img alt="" data-keys="' + esc(keys.join(",")) + '" src="images/' + esc(keys[0]) + '.png" onload="U.imgLoad(this)" onerror="U.imgFail(this)">' : "") +
      (overlay ? '<div class="overlay">' + overlay + "</div>" : "") + "</div>";
  };
  // 작은 픽셀 그림(가로 400 이하)은 확대해도 흐려지지 않게 또렷한 픽셀로 보여 줌
  U.imgLoad = function (img) { img.classList.toggle("px", img.naturalWidth <= 400); };
  U.imgFail = function (img) {
    var keys = img.dataset.keys.split(","), i = keys.indexOf(img.getAttribute("src").replace(/^images\/|\.png$/g, ""));
    if (i >= 0 && i + 1 < keys.length) img.src = "images/" + keys[i + 1] + ".png"; else img.remove();
  };

  // 카드 배경: 내용의 낱말을 보고 장소를 고름 (카드에 배경: "경기장"|"거리"|"실내"|"교실"|"학교"|"집"|"방"|"사무실"|"행사장" 으로 직접 정할 수도 있음)
  var BG = { 경기장: "bg_stadium", 거리: "bg_street", 실내: "bg_indoor", 교실: "bg_classroom.jpg", 학교: "bg_school.jpg",
    집: "bg_home.jpg", 방: "bg_room.jpg", 사무실: "bg_office.jpg", 행사장: "bg_hall.jpg" };
  var SCHOOL = ["초등학교", "중학교", "고등학교", "대학", "드래프트", "대학드래프트"];
  // 위에 있는 장소일수록 낱말 수가 같을 때 먼저 골라짐
  var BG_RULES = [
    ["경기장", /경기|마운드|타석|결승|대회|시즌|구장|등판|투구|홈런|안타|삼진|세이브|타자|9회|이닝|불펜|더블헤더|올스타|캠프|훈련|펑고|연습|드래프트|콜업|데뷔|국가대표|대표팀|전광판|관중|더그아웃|그라운드|도루|승부|외야|내야|스트라이크|번트|우천|마이너|빅리그|리그|타율/g],
    ["행사장", /기자회견|시상식|입단식|은퇴식|졸업식|행사|축하연|팬미팅|사인회|발표회|무대/g],
    ["사무실", /사무실|협상|계약서|계약|단장실|에이전트|프런트|구단주|트레이드/g],
    ["실내", /병원|재활|인터뷰|라커룸|식당|카페|면회|영화관|노래방|PC방|모텔|호텔|센터|훈련소|기숙사|클럽하우스|숙소|수술|레스토랑|옥상/g],
    ["교실", /교실|수업|시험|숙제|반장|칠판|성적표|자습|담임|학급|공부|노트|책상/g],
    ["학교", /교문|운동장|축제|복도|하굣길|등굣길|급식|방과 후|점심시간|학교 앞|매점/g],
    ["집", /집에|집으로|우리 집|거실|부엌|식탁|부모님|엄마|아빠|아내|명절|가족|밥상|신혼집|소파/g],
    ["방", /내 방|방에|방 안|침대|새벽|밤새|일기|이불|잠이|잠을|문자/g],
    ["거리", /거리|공원|한강|골목|놀이공원|여행|바다|데이트|공항|포장마차|버스|산책|소나기|우산|가게|마트|동네|놀이터|해변|바닷가|영화관 앞|대문|집 앞/g]
  ];
  U.bgOf = function (card) {
    if (!card) return null;
    if (card.배경) return BG[card.배경] || card.배경;
    var t = (card.제목 || "") + " " + (card.내용 || ""), best = null, bs = 0;
    BG_RULES.forEach(function (r) { var m = t.match(r[1]), n = m ? m.length : 0; if (n > bs) { bs = n; best = r[0]; } });
    var school = SCHOOL.indexOf((E.state() || {}).시기) >= 0;
    if ((best === "교실" || best === "학교") && !school) best = best === "교실" ? "실내" : "거리";
    return BG[best || (card.히로인 || card._만남 || card._끼어들기 ? (school ? "학교" : "거리") : "경기장")];
  };

  // 외모 레벨 표시: "외모 9 미남"
  U.looksTag = function () {
    var s = E.state(), L = GD.설정.외모 || {}, v = s.외모 || 5;
    return "외모 <b>" + v + "</b>" + (v >= (L.미남 || 8) ? ' <em class="look hand">미남</em>' : v <= (L.추남 || 3) ? ' <em class="look ugly">추남</em>' : "");
  };
  U.BONUS_KEY = "baseball-life-bonus-looks";

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
      '<button class="big" id="go" disabled>인생 시작!</button><button class="link-btn" onclick="U.openCollection()">📖 엔딩 도감 · 업적</button></section>';
    // 엔딩에서 고른 새 인생 보너스 ({외모: 10} / {외모: 1} / {랜덤보너스: true} / {이어하기: {아버지, 외모, 돈, 세대}})
    var bonus = null;
    try { var raw = localStorage.getItem(U.BONUS_KEY); if (raw) { bonus = JSON.parse(raw); if (typeof bonus === "number") bonus = { 외모: bonus }; } } catch (e) { bonus = null; }
    var heir = bonus && bonus.이어하기;
    if (bonus) $(".setup .sub").insertAdjacentHTML("afterend", '<p class="bonus">' + (heir ? "👶 " + esc(heir.아버지) + "의 아이로 태어났습니다! (" + ((heir.세대 || 1) + 1) + "대째)<br><small>아빠의 재능과 인기를 물려받고, 프로에 입단하면 유산을 받을 수 있어요. 아빠의 라이벌 집안과의 승부도 이어집니다.</small>"
      : bonus.외모 ? (bonus.외모 >= 10 ? "✨" : "😅") + " 이번 인생은 외모 레벨 " + bonus.외모 + "에서 시작합니다"
      : "🎁 이번 인생은 랜덤 보너스! 특기 말고도 능력치 하나가 특기만큼 빠르게 자랍니다") + "</p>");
    if (heir) $("#nm").value = String(heir.아버지 || "").charAt(0);
    $("#pos").innerHTML = GD.포지션.map(function (p, i) { return p.시작선택 === false ? "" : '<button class="chip" data-i="' + i + '">' + esc(p.이름) + "</button>"; }).join("");
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
    $("#go").onclick = function () {
      E.newGame($("#nm").value.trim(), sel.pos.이름, sel.spec, bonus);
      try { localStorage.removeItem(U.BONUS_KEY); } catch (e) {}
      U.showGame();
    };
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
    var stats = E.posStats().map(function (k) { return "<span>" + k + (k === s.보조특기 ? "🎁" : "") + " <b>" + s.능력치[k] + "</b></span>"; }).join("");
    var status = (s.부상 > 0 ? '<em class="bad">부상</em>' : "") + (s.슬럼프 > 0 ? '<em class="warn">슬럼프</em>' : "");
    var hero = '<div class="mini hero-mini" onclick="U.openHero()">' +
      U.art(U.heroKeys(), '<span class="posicon">' + U.icon() + "</span>",
        "<b>" + esc(s.이름) + '</b><small><span class="pi">' + U.icon() + "</span>" + esc(p.약칭) + "</small>", "card-art") + "</div>";
    var mid = '<div class="lifestats">' + '<div class="row">' + stats + "</div>" +
      '<div class="row common"><span>' + U.looksTag() + '</span><span>멘탈 <b>' + s.능력치.멘탈 + "</b></span><span>인기 <b>" + s.능력치.인기 + "</b></span><span>컨디션 <b>" + s.능력치.컨디션 + "</b></span>" +
      (s.시기 === "메이저리그" ? "<span>적응 <b>" + s.능력치.적응 + "</b></span>" : "") + "</div>" +
      '<div class="row"><span>😊 행복도 ' + bar(s.행복도, "happy") + "</span><span>🏅 성적 <b>" + s.성적 + "</b></span>" + status + "</div>" +
      '<div class="row"><button class="money" onclick="U.openShop()">💰 ' + E.money(s.돈) + ' · 상점</button></div></div>';
    var her = "";
    if (s.히로인) {
      var h = E.heroDef(), rel = s.히로인.관계;
      her = '<div class="mini heroine-mini ' + (animateHeroine ? "attach" : "") + '" onclick="U.openHeroine()">' +
        U.art(U.heroineKeys(h.아이디, rel), "💗", "<b>" + esc(h.이름) + "</b><small>" + esc(rel) + "</small>", "card-art") +
        '<div class="aff">❤ ' + s.히로인.애정도 + bar(s.히로인.애정도, "love") + "</div>" +
        (s.히로인2 ? '<div class="aff2">🤫 ' + esc(E.heroDef(s.히로인2.아이디).이름) + " ❤" + s.히로인2.애정도 + "</div>" : "") + "</div>";
    } else her = '<div class="mini empty" onclick="U.openHeroine()"><span>💗</span><small>인연을<br>기다리는 중</small></div>';
    $("#life").innerHTML = hero + mid + her;
  };

  U.cardArtKeys = function (card) {
    var s = E.state();
    if (card._끼어들기) { var hi = E.heroDef(card._끼어들기); return { keys: U.heroineKeys(hi.아이디, "만남"), icon: "💗", label: "<b>" + esc(hi.이름) + "</b><small>끼어든 인연</small>" }; }
    if (card.히로인 === "양다리" && s.히로인2) { var hs = E.heroDef(s.히로인2.아이디); return { keys: U.heroineKeys(hs.아이디, "연인"), icon: "🤫", label: "<b>" + esc(hs.이름) + "</b><small>비밀 연인 · ❤ " + s.히로인2.애정도 + "</small>" }; }
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
    var front = '<div class="face front' + (c.레어 ? " rare" : "") + '">' +
      (a ? U.art(a.keys, a.icon, a.label, "banner", U.bgOf(c)) : U.art([], sd.아이콘 || "⚾", null, "banner plain", U.bgOf(c))) +
      '<div class="txt"><div class="tag">' + (c.레어 ? '<span class="rare-tag">✨ 레어 카드</span> ' : "") + esc(c.시스템 ? "시즌" : s.시기) + (c.히로인 || c._만남 ? " · 💗" : "") + "</div><h2>" + esc(E.tpl(c.제목)) + "</h2><p>" + br(E.tpl(c.내용)) + "</p></div></div>";
    var back = '<div class="face back">' + (r ? U.resultHTML(r) : "") + "</div>";
    $("#table").innerHTML = '<div class="card3d ' + (r ? "flipped " : "") + (deal ? "deal" : "") + '" id="card">' + front + back + "</div>";
    U.renderActions();
  };

  U.chips = function (eff) {
    return Object.keys(eff || {}).filter(function (k) { return eff[k]; }).map(function (k) {
      var v = eff[k];
      if (k === "돈") return '<span class="fx money">💰 ' + (v > 0 ? "+" : "") + E.money(v) + "</span>";
      if (k === "부상감소" || k === "슬럼프감소") return '<span class="fx up">' + k.replace("감소", "") + " 기간 -" + v + "%</span>";
      if (k === "만남확률") return '<span class="fx up">💗 만남 확률 +' + v + "%</span>";
      if (k === "부상" || k === "슬럼프") return '<span class="fx bad">' + k + (v > 0 ? " " + v + "장" : " 회복") + "</span>";
      return '<span class="fx ' + (v > 0 ? "up" : "down") + '">' + k + " " + (v > 0 ? "+" : "") + v + "</span>";
    }).join("");
  };

  U.resultHTML = function (r) {
    var chips = U.chips(r.효과);
    var pic = r.결혼그림 ? U.art(r.결혼그림.키, "💍", "<b>" + esc(r.결혼그림.이름) + "</b><small>결혼식</small>", "banner", "bg_hall.jpg")
      : r.그림 ? U.art([r.그림].concat(U.heroKeys()), U.icon(), "<b>" + esc(E.state().이름) + "</b>", "banner small", U.bgOf(E.state().현재카드)) : "";
    var mg = r.미니게임 ? '<div class="tag">⏱ ' + r.미니게임.타이밍.toFixed(2) + "초" + (r.미니게임.목표 != null ? " (목표 " + r.미니게임.목표.toFixed(1) + "초)" : "") + " · 성공 확률 " + Math.round(r.미니게임.확률 * 100) + "%</div> " : "";
    return pic + '<div class="txt">' + mg + (r.성공 === true ? '<div class="tag ok">성공!</div>' : r.성공 === false ? '<div class="tag ng">실패…</div>' : "") +
      "<p>" + br(r.결과 || "…") + '</p><div class="fxs">' + chips + "</div>" +
      (r.알림 || []).map(function (n) { return '<div class="note">' + esc(n) + "</div>"; }).join("") +
      (r.뉴스 ? '<div class="news"><b>📰 야구 소식</b>' + esc(r.뉴스) + "</div>" : "") + "</div>";
  };

  U.renderActions = function () {
    var s = E.state(), c = s.현재카드;
    if (s.단계 === "결과") { $("#actions").innerHTML = '<button class="big next" onclick="U.next()">다음 카드 ▶</button>'; return; }
    $("#actions").innerHTML = s.현재옵션.map(function (oi, i) {
      var o = c.선택지[oi];
      return '<button class="opt" onclick="U.choose(' + i + ')">' + esc(E.tpl(o.글)) + (o.비용 ? ' <small class="cost">💰 ' + E.money(o.비용) + "</small>" : "") +
        (o.비용비율 ? ' <small class="cost">💰 가진 돈의 ' + o.비용비율 + "% (" + E.money(Math.floor((E.state().돈 || 0) * o.비용비율 / 100)) + ")</small>" : "") + "</button>";
    }).join("");
  };

  var busy = false;
  var BALL = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fffdf6" stroke="#d8d2c4" stroke-width="2"/>' +
    '<path d="M24 12C42 30 42 70 24 88M76 12C58 30 58 70 76 88" fill="none" stroke="#d33a2c" stroke-width="3.2" stroke-dasharray="5 4"/></svg>';
  // 승부의 순간 미니게임: 5초부터 줄어드는 시계를 목표(1.0초)에 가깝게 멈출수록 성공 확률이 높음
  U.miniGame = function (cb) {
    var M = GD.설정.미니게임 || {}, start = M.시작초 || 5, top = M.최고확률 || 0.95;
    // 목표 시간: 목표최소~목표최대 사이에서 매번 랜덤 (0.1초 단위)
    var lo = M.목표최소 != null ? M.목표최소 : (M.목표초 || 1), hi = M.목표최대 != null ? M.목표최대 : lo;
    var target = Math.round((lo + Math.random() * (hi - lo)) * 10) / 10;
    var pit = E.pos().분류 === "투수", m = document.createElement("div");
    m.className = "modal mg-wrap";
    m.innerHTML = '<div class="mg"><div class="mg-title">⚾ 승부의 순간!</div>' +
      '<div class="mg-sub">시계가 <b>' + target.toFixed(2) + '초</b>에 가장 가까울 때 공을 누르세요</div>' +
      '<div class="scoreboard"><span class="mg-time">' + start.toFixed(2) + "</span><small>SEC</small></div>" +
      '<div class="mg-track"><i class="mg-fill"></i><b class="mg-target" data-t="' + target.toFixed(1) + '" style="left:' + (100 - target / start * 100) + '%"></b></div>' +
      '<button class="mg-ball">' + BALL + "<span>" + (pit ? "투구!" : "스윙!") + '</span></button><div class="mg-result"></div></div>';
    document.body.appendChild(m);
    var t0 = performance.now(), done = false, timeEl = m.querySelector(".mg-time"), fill = m.querySelector(".mg-fill");
    function left() { return Math.max(0, start - (performance.now() - t0) / 1000); }
    // 시간 초과(0초까지 안 누름)는 헛스윙 → 최저 확률
    function finish(t, timeout) {
      if (done) return; done = true;
      var diff = Math.abs(t - target), p = timeout ? M.최저확률 || 0.05 : Math.max(M.최저확률 || 0.05, Math.min(top, top - diff * (M.감소 || 0.7)));
      timeEl.textContent = t.toFixed(2); m.querySelector(".mg-ball").classList.add(pit ? "throw" : "hit");
      m.querySelector(".mg-result").innerHTML = (timeout ? "⏰ 시간 초과! 공을 그냥 보냈다" : diff <= 0.05 ? "🎯 퍼펙트 타이밍!" : diff <= 0.2 ? "👍 좋은 타이밍!" : diff <= 0.5 ? "😅 조금 빗나갔다" : "😱 타이밍이 크게 어긋났다") +
        " <b>성공 확률 " + Math.round(p * 100) + "%</b>";
      setTimeout(function () { m.remove(); cb({ 확률: p, 타이밍: Math.round(t * 100) / 100, 목표: target }); }, 1200);
    }
    (function frame() {
      if (done) return; var t = left();
      timeEl.textContent = t.toFixed(2); fill.style.width = ((start - t) / start * 100) + "%";
      if (t <= 0) finish(0, true); else requestAnimationFrame(frame);
    })();
    m.querySelector(".mg-ball").addEventListener("pointerdown", function (e) { e.preventDefault(); finish(left()); });
  };

  U.choose = function (i) {
    if (busy) return;
    var s = E.state(), o = s.현재카드.선택지[s.현재옵션[i]];
    if (o.미니게임 && o.확률결과) { busy = true; return U.miniGame(function (mg) { busy = false; doChoose(i, mg); }); }
    doChoose(i);
  };
  function doChoose(i, mg) {
    if (busy) return; busy = true;
    var before = E.state().히로인 && E.state().히로인.아이디;
    var r = E.choose(i, mg);
    var after = E.state().히로인 && E.state().히로인.아이디;
    var card = $("#card"); card.querySelector(".back").innerHTML = U.resultHTML(r);
    card.classList.remove("deal"); card.classList.add("flipped");
    if (before && !after) { var m = document.querySelector(".heroine-mini"); if (m) m.classList.add("detach"); }
    setTimeout(function () { U.renderTop(); if (!(before && !after)) U.renderLife(!before && after); U.renderActions(); busy = false; }, before && !after ? 700 : 350);
    if (before && !after) setTimeout(function () { U.renderLife(); }, 750);
  }
  U.next = function () {
    if (busy) return; busy = true;
    $("#card").classList.add("discard");
    setTimeout(function () { E.next(); busy = false; U.renderAll(true); }, 320);
  };
})();
