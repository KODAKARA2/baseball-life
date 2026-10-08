// Original, quiet synthesized feedback. Never reads game state or consumes game RNG.
(function () {
  'use strict';
  if (typeof document === 'undefined') return; // Engine-only simulations have no feedback.
  var key = 'baseball-life-feedback-v1', prefs = { muted: false, volume: 0.22, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  try { var saved = JSON.parse(localStorage.getItem(key)); if (saved) {
    if (typeof saved.muted === 'boolean') prefs.muted = saved.muted;
    if (typeof saved.reduced === 'boolean') prefs.reduced = saved.reduced;
    if (typeof saved.volume === 'number' && isFinite(saved.volume)) prefs.volume = Math.max(0, Math.min(1, saved.volume));
  } } catch (_) {}
  var ctx, master, unlocked = false, voices = new Set(), animations = new Set(), scopes = new Map(), last = {};
  var tones = { select: [180, 100, .045], kick: [125, 48, .10], catch: [190, 65, .075], tackle: [260, 75, .065], bat: [920, 180, .055], good: [440, 590, .13], great: [660, 990, .21], bad: [170, 110, .105], result: [350, 470, .12], fail: [145, 95, .11] };
  function motion() { document.documentElement.dataset.reducedMotion = String(prefs.reduced); if (prefs.reduced) { animations.forEach(function(a){ a.cancel(); }); animations.clear(); } }
  function stop() { voices.forEach(function(v){ try { v.osc.stop(); v.osc.disconnect(); v.gain.disconnect(); } catch (_) {} }); voices.clear(); last = {}; }
  function unlock(e) {
    if (!e.isTrusted || document.hidden) return;
    unlocked = true;
    if (prefs.muted || !prefs.volume) return;
    try { if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); master = ctx.createGain(); master.gain.value = prefs.volume * .16; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume().catch(function(){});
    } catch (_) { /* Unsupported/blocked audio never blocks play. */ }
  }
  ['pointerdown','touchstart','keydown'].forEach(function(n){ document.addEventListener(n, unlock, {capture:true, passive:true}); });
  function play(kind) {
    var tone = tones[kind], now = performance.now();
    if (!tone || !unlocked || !ctx || ctx.state !== 'running' || prefs.muted || !prefs.volume || document.hidden || voices.size >= 4 || now - (last[kind] == null ? -Infinity : last[kind]) < 75) return false;
    last[kind] = now;
    try {
      var osc = ctx.createOscillator(), gain = ctx.createGain(), t = ctx.currentTime, v = {osc:osc, gain:gain};
      osc.type = /bat|tackle/.test(kind) ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(tone[0],t); osc.frequency.exponentialRampToValueAtTime(tone[1],t+tone[2]);
      gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(.18,t+.004); gain.gain.exponentialRampToValueAtTime(.0001,t+tone[2]);
      osc.connect(gain); gain.connect(master); voices.add(v);
      osc.onended = function(){ voices.delete(v); osc.disconnect(); gain.disconnect(); };
      osc.start(t); osc.stop(t+tone[2]+.01); return true;
    } catch (_) { return false; }
  }
  function pulse(el, strong) {
    if (!el || !el.isConnected || prefs.reduced || document.hidden || !el.animate) return;
    // Individual translate/scale preserve existing card flip and ball transforms.
    var a = el.animate([{translate:'0 0',scale:'1'},{translate:'0 '+(strong?'-3px':'-1px'),scale:strong?'1.012':'1.005'},{translate:'0 0',scale:'1'}],{duration:strong?220:140,easing:'ease-out'});
    animations.add(a); a.onfinish = a.oncancel = function(){ animations.delete(a); };
  }
  function cue(kind, el, strong) { play(kind); pulse(el,strong); }
  function scope(el) { if (!scopes.has(el)) scopes.set(el,{timers:new Set(),frames:new Set()}); return scopes.get(el); }
  function later(el, fn, ms) { var s=scope(el), id=setTimeout(function(){s.timers.delete(id);if(el.isConnected)fn();},ms);s.timers.add(id);return id; }
  function frame(el, fn) { var s=scope(el), id=requestAnimationFrame(function(t){s.frames.delete(id);if(el.isConnected)fn(t);});s.frames.add(id);return id; }
  function clear(el) { var s=scopes.get(el);if(s){s.timers.forEach(clearTimeout);s.frames.forEach(cancelAnimationFrame);scopes.delete(el);} stop(); }
  function clearAll() { scopes.forEach(function(_,el){clear(el);});stop();animations.forEach(function(a){a.cancel();});animations.clear(); }
  new MutationObserver(function(){scopes.forEach(function(_,el){if(!el.isConnected)clear(el);});}).observe(document.body,{childList:true,subtree:true});
  function settings() {
    if(document.querySelector('.feedback-settings'))return;
    var d=document.createElement('dialog');d.className='feedback-settings';
    d.innerHTML='<form method="dialog"><h2>소리·움직임 설정</h2><label><input type="checkbox" name="muted"> 효과음 끄기</label><label class="volume-label">효과음 볼륨 <output></output><input type="range" name="volume" min="0" max="100" step="1"></label><label><input type="checkbox" name="reduced"> 움직임 줄이기</label><p>이 게임에 자동 저장됩니다. 움직임을 줄여도 판정과 결과는 같습니다.</p><button class="big">닫기</button></form>';
    document.body.appendChild(d);var f=d.querySelector('form'),out=d.querySelector('output');f.elements.muted.checked=prefs.muted;f.elements.reduced.checked=prefs.reduced;f.elements.volume.value=Math.round(prefs.volume*100);
    function label(){out.value=Math.round(prefs.volume*100)+'%';}label();
    f.addEventListener('input',function(){prefs.muted=f.elements.muted.checked;prefs.reduced=f.elements.reduced.checked;prefs.volume=Number(f.elements.volume.value)/100;stop();if(master)master.gain.value=prefs.volume*.16;motion();label();try{localStorage.setItem(key,JSON.stringify(prefs));}catch(_){} });
    d.addEventListener('close',function(){d.remove();});d.showModal();
  }
  document.addEventListener('visibilitychange',function(){if(document.hidden){stop();animations.forEach(function(a){a.cancel();});animations.clear();}});
  window.addEventListener('pagehide',clearAll);
  motion();
  window.Feedback={play:play,cue:cue,pulse:pulse,stop:stop,clear:clear,clearAll:clearAll,later:later,frame:frame,settings:settings};
})();
