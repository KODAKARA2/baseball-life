// First encounter this page only. Confirmation and automatic PLAY BALL never coexist.
(function () {
  if(typeof document==='undefined')return;
  var seen=new Set();
  U.guideMini=function(name,start,abort){
    if(seen.has(name))return start();
    var games=U.practiceGames(),g=Object.values(games).find(function(x){return x.play===U[name];});
    if(!g)return start();
    var m=document.createElement('div'),closed=false,app=document.querySelector('#app'),inert=app.inert,confirmed=false,held=new Set();
    m.className='modal mini-guide';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',g.title+' 준비 안내');
    m.innerHTML='<div class="sheet"><span class="eyebrow">첫 승부 · 준비 안내</span><h2>'+U.esc(g.title)+'</h2><p>'+U.esc(g.help)+'</p><p>'+U.esc(g.keys||'터치·클릭 또는 스페이스·엔터')+'</p><p>'+U.esc(g.levels)+'</p><p class="hint">좋은 판정일수록 카드 성공 확률이 높아집니다. 최고 판정도 이야기의 성공을 보장하지 않습니다. 안내 중에는 시간이 흐르지 않습니다. 이번 접속에서 같은 종목은 바로 시작합니다.</p><button class="big guide-start">준비 완료 · 플레이볼</button><button class="sheet-close">선택으로 돌아가기</button></div>';
    app.inert=true;document.body.appendChild(m);
    function cleanup(){closed=true;m.remove();app.inert=inert;document.removeEventListener('keydown',keys,true);document.removeEventListener('keyup',released,true);document.removeEventListener('visibilitychange',hidden);}
    var cancelGame;
    function cancel(){if(!closed)cleanup();if(cancelGame)cancelGame();}
    function launch(){if(closed||!confirmed||held.size)return;seen.add(name);cleanup();cancelGame=start();}
    function released(e){held.delete(e.code);if(confirmed){e.preventDefault();e.stopImmediatePropagation();launch();}}
    function keys(e){
      held.add(e.code);
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();cancel();abort();}
      else if(e.key==='Tab'){var first=m.querySelector('.guide-start'),last=m.querySelector('.sheet-close');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
      else if(e.repeat){e.preventDefault();e.stopImmediatePropagation();}
    }
    function hidden(){if(document.hidden&&!closed){cancel();abort();}}
    document.addEventListener('visibilitychange',hidden);
    document.addEventListener('keydown',keys,true);
    document.addEventListener('keyup',released,true);
    m.querySelector('.sheet-close').onclick=function(){cancel();abort();};
    m.querySelector('.guide-start').onclick=function(e){
      e.preventDefault();e.stopPropagation();if(closed)return;
      confirmed=true;this.disabled=true;this.textContent='입력을 놓으면 시작합니다';launch(); // Held Enter/Space must release before the automatic gate exists.
    };
    m.querySelector('.guide-start').focus();return cancel;
  };
})();
