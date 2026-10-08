// Generated umpire introduction. Game clocks and input begin only after this gate.
(function () {
  if (typeof document === 'undefined') return;
  var activeCancel;
  function run(start, onAbort) {
    if (activeCancel) activeCancel();
    var modal = document.createElement('div');
    modal.className = 'modal baseball-playball';
    modal.innerHTML = '<div class="baseball-playball-panel" role="dialog" aria-modal="true" aria-label="플레이볼!"><img src="images/minigames/playball-generated.png" alt=""><strong>플레이볼!</strong><button type="button" data-start>시작</button><button type="button" data-close aria-label="미니게임 닫기">닫기</button></div>';
    var done = false, requested = false, timer, releaseTimer, gameCancel;
    var keys = new Set(), pointers = new Set();
    function clearGate() {
      clearTimeout(timer); clearTimeout(releaseTimer);
      observer.disconnect(); document.removeEventListener('visibilitychange', hidden);
      events.forEach(function (name) { document.removeEventListener(name, input, true); });
      modal.remove();
    }
    function cancel() {
      if (!done) { done = true; clearGate(); }
      if (gameCancel) { gameCancel(); gameCancel = null; }
      if (activeCancel === cancel) activeCancel = null;
    }
    function launch() {
      if (done || !requested || keys.size || pointers.size) return;
      clearTimeout(releaseTimer);
      // Keep the gate over the page through synthetic click and key-repeat events.
      releaseTimer = setTimeout(function () {
        if (done || keys.size || pointers.size || document.hidden || !modal.isConnected) return;
        done = true; clearGate(); gameCancel = start();
      }, 180);
    }
    function requestStart() { requested = true; launch(); }
    function abort() { cancel(); if (onAbort) { var cb = onAbort; onAbort = null; cb(); } }
    function hidden() { if (document.hidden) abort(); }
    function input(e) {
      if (done) return;
      var close = e.target.closest && e.target.closest('[data-close]');
      if (e.type === 'keydown') keys.add(e.code);
      if (e.type === 'keyup') keys.delete(e.code);
      if (e.type === 'pointerdown') pointers.add(e.pointerId);
      if (e.type === 'pointerup' || e.type === 'pointercancel') pointers.delete(e.pointerId);
      if (e.type === 'keydown' && e.key === 'Tab') {
        e.preventDefault(); e.stopImmediatePropagation();
        var buttons = modal.querySelectorAll('button');
        (document.activeElement === buttons[0] ? buttons[1] : buttons[0]).focus(); return;
      }
      e.preventDefault(); e.stopImmediatePropagation();
      clearTimeout(releaseTimer);
      if ((e.type === 'keydown' && e.key === 'Escape') || (close && (e.type === 'click' || (e.type === 'keyup' && ['Space', 'Enter'].indexOf(e.code) >= 0)))) return abort();
      if (e.type === 'click' || (e.type === 'keyup' && ['Space', 'Enter'].indexOf(e.code) >= 0)) requested = true;
      if (requested) launch();
    }
    var events = ['pointerdown', 'pointerup', 'pointercancel', 'click', 'keydown', 'keyup'];
    var observer = new MutationObserver(function () { if (!modal.isConnected) abort(); });
    document.body.appendChild(modal);
    observer.observe(document.body, {childList: true, subtree: true});
    events.forEach(function (name) { document.addEventListener(name, input, true); });
    document.addEventListener('visibilitychange', hidden);
    modal.querySelector('img').onerror = function () { this.hidden = true; };
    modal.querySelector('[data-start]').focus({preventScroll: true});
    timer = setTimeout(requestStart, document.documentElement.dataset.reducedMotion === 'true' ? 350 : 850);
    activeCancel = cancel;
    return cancel;
  }
  window.BaseballPlayball = {run: run};
  ['miniTimer', 'miniBat', 'miniPitch', 'miniSteal', 'miniThrow', 'miniSigns'].forEach(function (name) {
    var play = U[name];
    U[name] = function (cb, ready, abort) {
      return run(function () { var cancel = play(cb); if (ready) ready(); return cancel; }, abort);
    };
  });
})();
