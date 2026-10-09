// 테스트 서버에서만 로드합니다. 버튼을 누를 때만 테스트 인생을 시작합니다.
(function(){
  window.addEventListener('load',function(){
    var panel=document.createElement('details');panel.className='story-demo';panel.open=true;
    panel.innerHTML='<summary>선수 생활 업데이트 · 체험 메뉴</summary><p>이 주소의 저장은 실제 서비스와 별개입니다. 아래 버튼은 현재 테스트 인생을 새 장면으로 바꿉니다.</p><div class="demo-buttons"></div>';
    var style=document.createElement('style');style.textContent='.story-demo{box-sizing:border-box;max-width:920px;margin:16px auto;padding:14px 18px;border:1px solid #728e85;border-radius:14px;background:#163e38;color:#f4efdf;font:14px/1.6 sans-serif}.story-demo summary{cursor:pointer;font-weight:bold}.story-demo p{margin:8px 0}.demo-buttons{display:flex;flex-wrap:wrap;gap:8px}.demo-buttons button{padding:9px 12px;border:1px solid #849e94;border-radius:9px;background:#f0ebd9;color:#163e38;cursor:pointer;font:inherit}@media(max-width:600px){.story-demo{margin:10px}.demo-buttons button{flex:1 1 40%}}';document.head.appendChild(style);document.body.prepend(panel);
    var choices=[['처음부터 플레이','full'],['선수 유형','type'],['올해의 목표','goal'],['주전 경쟁','role'],['부상과 복귀','rehab'],['라이벌과의 관계','rival'],['인연과의 약속','memory'],['새 계약 제안','contract'],['투수의 선택','pitcher']];
    choices.forEach(function(item){var b=document.createElement('button');b.textContent=item[0];b.dataset.demo=item[1];b.onclick=function(){start(item[1]);};panel.querySelector('.demo-buttons').appendChild(b);});
    function start(kind){
      U.closeModals();
      if(kind==='full'){E.reset();U.showSetup();panel.open=false;return;}
      var pitcher=kind==='pitcher',p=GD.포지션.find(function(p){return p.분류==='투수';}),sp=GD.특기.find(function(t){return t.분류==='투수';});
      E.newGame('강민준',pitcher?p.이름:'유격수',pitcher?sp.이름:'수비',{외모:5});
      var s=E.state();Object.assign(s,{시기:'프로',나이:26,진입나이:20,연차:6,팀:GD.설정.국내팀[0],국내팀:GD.설정.국내팀[0],일군:true,다음자유나이:28,올해카드:0,부상:0,대기열:[],돈:50000});
      Object.keys(s.능력치).forEach(function(k){s.능력치[k]=65;});
      s.플래그.군필=true;
      s.히로인={아이디:'heroine1',관계:'연인',애정도:65,만난시기:'고등학교',만남턴:0,교류횟수:4};
      s.알아가는인연=[{아이디:'heroine2',관계:'만남',애정도:45,만난시기:'프로',만남턴:0,교류횟수:2}];s.만난히로인=['heroine1','heroine2'];
      var d=E.story.init();Object.assign(d,{유형:pitcher?'control':'contact',유형변경나이:30,다음제안:30});
      d.목표={종류:'goal',값:'role',이름:'출전 기회 확보',scope:'프로:26',나이:26,시기:'프로'};
      var c;
      if(kind==='type'||pitcher)c=E.story.profileCard();
      else if(kind==='goal')c=E.story.goalCard();
      else if(kind==='contract')c=E.story.contractCard();
      else{if(kind==='rehab')s.부상=5;c=E.story.routeCard(kind,0,kind==='memory'?'heroine2':null);}
      s.현재카드=c;s.단계='카드';s.결과=null;E.refreshOptions();E.save();U.showGame();
      panel.open=false;
    }
  });
})();
