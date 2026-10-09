// 기존 미니게임과 같은 성공 확률을 쓰는 도루·송구·구종 기억 게임.
(function () {
  if (!window.U) return; // 화면 없이 실행하는 엔진 시뮬레이션에서는 생략합니다.
  var U = window.U, H = U._mini;
  function config(name) { return (GD.설정.미니게임 || {})[name] || {}; }
  function probability(grade) {
    var M = GD.설정.미니게임 || {}, A = M.추가게임 || {};
    return [M.최저확률 == null ? 0.05 : M.최저확률, A.보통확률 == null ? 0.3 : A.보통확률,
      A.좋음확률 == null ? 0.7 : A.좋음확률, M.최고확률 == null ? 0.95 : M.최고확률][grade];
  }
  function grade(error, C) { return error <= C.퍼펙트 ? 3 : error <= C.좋음 ? 2 : error <= C.보통 ? 1 : 0; }
  // 종료·중단·창 제거 뒤에는 프레임이나 결과 콜백이 게임을 다시 진행시키지 않습니다.
  function lifecycle(m, cb) {
    var done = false, frameId;
    return {
      active: function () { return !done && m.isConnected; },
      run: function (update) {
        function frame() {
          if (done || !m.isConnected) return;
          update(performance.now());
          if (!done && m.isConnected) frameId = Feedback.frame(m, frame);
        }
        frame();
      },
      end: function (level, title, message) {
        if (done || !m.isConnected) return;
        done = true; cancelAnimationFrame(frameId);
        H.end(m, title, level < 2, message, probability(level), title, cb);
      },
      cancel: function () { done = true; cancelAnimationFrame(frameId); Feedback.clear(m); m.remove(); }
    };
  }

  U.miniSteal = function (cb) {
    var C = Object.assign({ 대기최소: 1.4, 대기최대: 2.8, 견제확률: 0.5, 퍼펙트: 0.18, 좋음: 0.30, 보통: 0.45, 제한초: 0.8 }, config("도루"));
    var m = H.open("⚡ 도루 스타트", "<b>출발!</b> 신호에 누르세요. ‘견제!’에는 기다리세요.",
      '<div class="steal-route"></div><span class="steal-base first">1루</span><span class="steal-base second">2루</span>' +
      '<div class="steal-runner">●</div><div class="steal-signal" role="status">준비…</div><div class="mini-instruction">터치 · 클릭 · 스페이스</div>', "steal-field");
    var life = lifecycle(m, cb), signal = m.querySelector(".steal-signal"), runner = m.querySelector(".steal-runner");
    var start = performance.now(), wait = (C.대기최소 + Math.random() * (C.대기최대 - C.대기최소)) * 1000;
    var go = start + wait, feint = Math.random() < C.견제확률, displayed = false;
    life.run(function (now) {
      if (now >= go) {
        if (!displayed) { displayed = true; signal.textContent = "출발!"; signal.classList.remove("feint"); signal.classList.add("go"); }
        if (now >= go + C.제한초 * 1000) life.end(0, "늦은 출발", "출발 신호를 놓쳤어요.");
      } else {
        var watching = feint && now - start >= wait * 0.45 && now - start < wait * 0.45 + 400;
        signal.textContent = watching ? "견제! 기다려요" : "투수를 지켜봐요…";
        signal.classList.toggle("feint", watching);
      }
    });
    H.input(m, function (e) {
      if (!life.active()) return;
      var t = H.time(e), reaction = (t - go) / 1000;
      if (!displayed || reaction < 0) return life.end(0, "견제 아웃!", "투수가 던지기 전에 뛰었어요.");
      var level = reaction > C.제한초 ? 0 : grade(reaction, C);
      runner.classList.add("running");
      life.end(level, ["태그 아웃!", "아슬아슬한 출발", "도루 성공!", "완벽한 스타트!"][level], "출발 반응 " + reaction.toFixed(2) + "초");
    });
    return life.cancel;
  };

  U.miniThrow = function (cb) {
    var C = Object.assign({ 제한초: 6, 속도: 0.55, 퍼펙트: 0.06, 좋음: 0.14, 보통: 0.25 }, config("송구"));
    var m = H.open("🧤 정확한 송구", "<b>두 번</b> 눌러 가로 → 세로 조준을 멈추세요.",
      '<div class="throw-diamond"></div><div class="throw-target">1루</div><div class="throw-x"></div><div class="throw-y"></div>' +
      '<div class="throw-dot"></div><div class="throw-ball">' + H.ball + '</div><div class="mg-pitch">1 / 2 · 가로 조준</div><div class="pf-time"><i></i></div>', "throw-field");
    var life = lifecycle(m, cb), xLine = m.querySelector(".throw-x"), yLine = m.querySelector(".throw-y"), dot = m.querySelector(".throw-dot");
    var target = m.querySelector(".throw-target"), label = m.querySelector(".mg-pitch"), bar = m.querySelector(".pf-time i");
    var tx = 0.30 + Math.random() * 0.40, ty = 0.30 + Math.random() * 0.40;
    var start = performance.now(), phaseStart = start, phase = 0, x = 0.12, y = 0.12;
    var initial = Math.random() * Math.PI * 2;
    target.style.left = tx * 100 + "%"; target.style.top = ty * 100 + "%";
    function position(t) { return 0.5 + 0.38 * Math.sin(initial + (t - phaseStart) / 1000 * Math.PI * 2 * C.속도); }
    function put(t) {
      if (phase === 0) x = position(t); else y = position(t);
      xLine.style.left = x * 100 + "%"; yLine.style.top = y * 100 + "%";
      yLine.hidden = phase === 0; dot.hidden = phase === 0;
      dot.style.left = x * 100 + "%"; dot.style.top = y * 100 + "%";
    }
    life.run(function (now) {
      put(now); bar.style.width = Math.max(0, 1 - (now - start) / (C.제한초 * 1000)) * 100 + "%";
      if (now - start >= C.제한초 * 1000) life.end(0, "송구 시간 초과", "두 방향의 조준을 끝내지 못했어요.");
    });
    H.input(m, function (e) {
      if (!life.active()) return;
      var t = H.time(e);
      if (t - start >= C.제한초 * 1000) return life.end(0, "송구 시간 초과", "두 방향의 조준을 끝내지 못했어요.");
      // 더블 탭 한 번으로 두 방향이 모두 고정되지 않도록 입력 사이 여유를 둡니다.
      if (phase === 1 && t - phaseStart < 180) return;
      put(t);
      if (phase === 0) {
        phase = 1; phaseStart = t; initial = Math.random() * Math.PI * 2;
        xLine.classList.add("locked"); label.textContent = "2 / 2 · 세로 조준"; put(t); return;
      }
      var d = Math.hypot(x - tx, y - ty), level = grade(d, C), ball = m.querySelector(".throw-ball");
      ball.style.left = x * 100 + "%"; ball.style.top = y * 100 + "%"; ball.classList.add("thrown");
      if (level > 0) Feedback.play("catch");
      life.end(level, ["악송구!", "힘겨운 포구", "안정적인 송구!", "정확한 송구!"][level], "목표에서 " + Math.round(d * 100) + "% 벗어났어요.");
    });
    return life.cancel;
  };

  U.miniSigns = function (cb) {
    var C = Object.assign({ 표시초: 0.65, 간격초: 0.15, 입력초: 5 }, config("사인"));
    var names = ["직구", "커브", "체인지업"], sequence = [0, 0, 0].map(function () { return Math.floor(Math.random() * names.length); });
    var m = H.open("🧠 구종 사인 기억", "사인 <b>3개를 순서대로</b> 기억한 뒤 같은 순서로 고르세요.",
      '<div class="sign-display" role="status">준비</div><div class="sign-progress">포수의 사인을 기억하세요</div>' +
      '<div class="sign-answers">' + names.map(function (name, i) { return '<button disabled data-sign="' + i + '"><small>' + (i + 1) + '</small>' + name + '</button>'; }).join("") + '</div>' +
      '<div class="sign-slots">○ ○ ○</div><div class="pf-time"><i></i></div>', "sign-field");
    var life = lifecycle(m, cb), display = m.querySelector(".sign-display"), progress = m.querySelector(".sign-progress"), slots = m.querySelector(".sign-slots");
    var buttons = m.querySelectorAll("[data-sign]"), bar = m.querySelector(".pf-time i"), box = m.querySelector(".mg");
    var start = performance.now(), beat = (C.표시초 + C.간격초) * 1000, revealEnd = start + beat * 3;
    var input = false, answers = [], correct = 0;
    box.tabIndex = 0; box.setAttribute("role", "group"); box.setAttribute("aria-label", "구종 사인 기억. 사인을 본 뒤 버튼 또는 숫자 1, 2, 3으로 입력");
    box.focus({ preventScroll: true });
    function end(timeout) {
      buttons.forEach(function (b) { b.disabled = true; });
      display.textContent = sequence.map(function (n) { return names[n]; }).join(" → ");
      life.end(correct, ["사인 불일치", "1개 일치", "2개 일치!", "완벽한 호흡!"][correct], (timeout ? "입력 시간 초과 · " : "") + "3개 중 " + correct + "개를 기억했어요.");
    }
    function answer(n) {
      if (!life.active() || !input) return;
      if (performance.now() >= revealEnd + C.입력초 * 1000) return end(true);
      if (sequence[answers.length] === n) correct++;
      answers.push(n); slots.textContent = answers.map(function (v) { return names[v]; }).concat(Array(3 - answers.length).fill("○")).join(" · ");
      if (answers.length === 3) end(false);
      else progress.textContent = (answers.length + 1) + "번째 사인을 골라 주세요";
    }
    buttons.forEach(function (b) { b.onclick = function () { answer(Number(b.dataset.sign)); }; });
    box.addEventListener("keydown", function (e) {
      if (/^[123]$/.test(e.key) && !e.repeat) { e.preventDefault(); answer(Number(e.key) - 1); }
    });
    life.run(function (now) {
      if (now < revealEnd) {
        var i = Math.min(2, Math.floor((now - start) / beat));
        display.textContent = (now - start) % beat < C.표시초 * 1000 ? (i + 1) + ". " + names[sequence[i]] : "· · ·";
        bar.style.width = Math.max(0, 1 - (now - start) / (beat * 3)) * 100 + "%";
      } else {
        if (!input) { input = true; display.textContent = "기억한 순서는?"; progress.textContent = "1번째 사인을 골라 주세요"; buttons.forEach(function (b) { b.disabled = false; }); buttons[0].focus({ preventScroll: true }); }
        bar.style.width = Math.max(0, 1 - (now - revealEnd) / (C.입력초 * 1000)) * 100 + "%";
        if (now >= revealEnd + C.입력초 * 1000) end(true);
      }
    });
    return life.cancel;
  };

  U.extraPracticeGames = function () {
    var levels = "최고 " + Math.round(probability(3) * 100) + "% · 좋음 " + Math.round(probability(2) * 100) + "% · 보통 " + Math.round(probability(1) * 100) + "% · 실패 " + Math.round(probability(0) * 100) + "%";
    return {
      steal: { title: "도루", icon: "⚡", play: U.miniSteal, help: "‘견제!’에는 기다리고 ‘출발!’에 빠르게 누르세요. 미리 누르면 아웃입니다.", levels: levels },
      throw: { title: "송구", icon: "🧤", play: U.miniThrow, help: "1루 표적에 맞춰 가로·세로 조준을 차례로 멈추세요. 총 " + (config("송구").제한초 || 6) + "초 안에 두 번 누릅니다.", levels: levels },
      signs: { title: "사인 기억", icon: "🧠", play: U.miniSigns, help: "구종 사인 3개를 기억한 뒤 같은 순서로 고르세요. 구종 버튼 또는 숫자 1·2·3으로 입력합니다.", levels: "3개 / 2개 / 1개 / 0개 정답 순서: " + levels, keys: "터치·클릭 또는 숫자 1·2·3" }
    };
  };
  Object.assign(H, { lifecycle: lifecycle, probability: probability, grade: grade });
})();
