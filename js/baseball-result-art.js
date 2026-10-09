// Original baseball result artwork; presentation never changes game state or sound.
(function(){
  if(typeof document==='undefined')return;
  var states=new WeakMap(), kinds={bf:'hit',pf:'pitch','throw-field':'throw','steal-field':'steal','sign-field':'signs','timer-hit':'hit','timer-pitch':'pitch','fly-field':'throw','bunt-field':'hit','eye-field':'hit','defense-field':'throw'};
  var accepted={hit:['홈런!','안타!','좋은 타이밍!','희생 번트 성공!','절묘한 번트!','침착한 선구안!','완벽한 선구안!'],pitch:['삼진!','스트라이크!','좋은 타이밍!'],throw:['안정적인 송구!','정확한 송구!','안정적인 포구!','완벽한 낙구 판단!','침착한 수비!','완벽한 수비 판단!'],steal:['도루 성공!','완벽한 스타트!'],signs:['완벽한 호흡!']};
  function prepare(m,type){var kind=kinds[type];if(!kind)return;var image=new Image();image.alt='';image.draggable=false;image.src='images/minigames/result-'+kind+'.png';states.set(m,{kind:kind,image:image,used:false});}
  function show(m,title,bad){
    var s=states.get(m);if(!s||s.used)return;s.used=true;
    if(bad||accepted[s.kind].indexOf(title)<0||!m.isConnected||document.hidden||document.documentElement.dataset.reducedMotion==='true'||!s.image.complete||!s.image.naturalWidth)return;
    var host=m.querySelector('.mgf')||m.querySelector('.mg');host.classList.add('baseball-art-host');
    var panel=document.createElement('div');panel.className='baseball-result-art';panel.dataset.scene=s.kind;panel.setAttribute('aria-hidden','true');
    var label=document.createElement('strong');label.textContent=title;panel.append(s.image,label);host.appendChild(panel);
    function clear(){panel.remove();watch.disconnect();window.removeEventListener('resize',clear);document.removeEventListener('visibilitychange',clear);}
    var watch=new MutationObserver(function(){if(!m.isConnected||document.documentElement.dataset.reducedMotion==='true')clear();});
    watch.observe(document.body,{childList:true,subtree:true});watch.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced-motion']});
    window.addEventListener('resize',clear);document.addEventListener('visibilitychange',clear);Feedback.later(m,clear,320);
  }
  window.BaseballResultArt={prepare:prepare,show:show};
})();
