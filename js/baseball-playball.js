// Automatic introduction; the input curtain outlives the picture, not the game clock.
(function () {
  if (typeof document === 'undefined') return;
  var activeCancel;
  function run(start, onAbort) {
    if (activeCancel) activeCancel();
    var modal = document.createElement('div');
    modal.className = 'modal baseball-playball';
    modal.innerHTML = '<div class="baseball-playball-panel" role="dialog" aria-modal="true" aria-label="플레이볼!" tabindex="-1"><img src="images/minigames/playball-generated.png" alt=""><strong>플레이볼!</strong></div>';
    var phase = 'intro', visualDone = false, timer, releaseTimer, gameCancel, game;
    var keys = new Set(), pointers = new Set(), touches = new Set();
    var events = ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel', 'click', 'keydown', 'keyup'];
    function unlisten() { events.forEach(function (name) { document.removeEventListener(name, input, true); }); }
    function cleanup() {
      clearTimeout(timer); clearTimeout(releaseTimer); unlisten(); observer.disconnect();
      document.removeEventListener('visibilitychange', hidden); modal.remove();
    }
    function cancel() {
      phase = 'closed'; cleanup();
      if (gameCancel) { gameCancel(); gameCancel = null; }
      if (activeCancel === cancel) activeCancel = null;
    }
    function abort() { cancel(); if (onAbort) { var cb = onAbort; onAbort = null; cb(); } }
    function hidden() { if (document.hidden) { if (phase === 'intro') abort(); else unlisten(); } }
    function settle() {
      clearTimeout(releaseTimer);
      if (!visualDone || keys.size || pointers.size || touches.size) return;
      // No game exists until 220ms after both picture removal and the last release/input.
      releaseTimer = setTimeout(function () {
        if (phase !== 'intro' || document.hidden || !modal.isConnected) return;
        phase = 'game'; modal.remove(); gameCancel = start(); game = document.querySelector('.mg-wrap');
      }, 220);
    }
    function block(e) { e.preventDefault(); e.stopImmediatePropagation(); }
    function input(e) {
      if (phase === 'closed') return;
      if (phase === 'game') {
        // A delayed compatibility click/up from the old scene is not a fresh gesture.
        if (e.type === 'pointerdown' || e.type === 'touchstart' || (e.type === 'keydown' && !e.repeat)) { unlisten(); return; }
        block(e); return;
      }
      block(e);
      if (e.type === 'keydown' && e.key === 'Escape') return abort();
      if (e.type === 'keydown') keys.add(e.code);
      if (e.type === 'keyup') keys.delete(e.code);
      if (e.type === 'pointerdown') pointers.add(e.pointerId);
      if (e.type === 'pointerup' || e.type === 'pointercancel') pointers.delete(e.pointerId);
      if (e.type === 'touchstart') Array.from(e.changedTouches).forEach(function (t) { touches.add(t.identifier); });
      if (e.type === 'touchend' || e.type === 'touchcancel') Array.from(e.changedTouches).forEach(function (t) { touches.delete(t.identifier); });
      settle();
    }
    var observer = new MutationObserver(function () {
      if (phase === 'intro' && !modal.isConnected) abort();
      else if (phase === 'game' && game && !game.isConnected) { phase = 'closed'; cleanup(); }
    });
    document.body.appendChild(modal); observer.observe(document.body, {childList: true, subtree: true});
    events.forEach(function (name) { document.addEventListener(name, input, {capture: true, passive: false}); });
    document.addEventListener('visibilitychange', hidden);
    modal.querySelector('img').onerror = function () { this.hidden = true; };
    modal.firstElementChild.focus({preventScroll: true});
    timer = setTimeout(function () { visualDone = true; modal.classList.add('playball-settling'); settle(); }, document.documentElement.dataset.reducedMotion === 'true' ? 250 : 500);
    activeCancel = cancel;
    return cancel;
  }
  window.BaseballPlayball = {run: run};
  ['miniTimer', 'miniBat', 'miniPitch', 'miniSteal', 'miniThrow', 'miniSigns', 'miniFly', 'miniBunt', 'miniDiscipline', 'miniDefense'].forEach(function (name) {
    var play = U[name];
    U[name] = function (cb, ready, abort) {
      return run(function () { var cancel = play(cb); if (ready) ready(); return cancel; }, abort);
    };
  });
})();
