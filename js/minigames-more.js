// 이동·누르기/놓기·볼 판단·주자 판단. 기존 판정 5/30/70/95%와 같은 결과 경로를 사용합니다.
(function(){
  if(!window.U)return;
  var H=U._mini;
  var gloveArt='<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M22 70C10 58 7 44 8 31Q10 24 16 29L25 39 19 13Q18 5 25 5Q31 5 32 14L36 32 34 8Q34 1 41 2Q47 3 47 10L49 31 50 11Q51 4 57 7Q62 9 61 16L60 36 65 24Q69 18 74 24Q77 28 73 38L64 62Q52 79 22 70Z" fill="#be803f" stroke="#603b21" stroke-width="3"/><path d="M23 44Q37 35 57 43L58 59Q42 72 27 59Z" fill="#915a2d" stroke="#e8b575" stroke-width="2"/><path d="M23 17L29 38M40 11L42 34M56 15L54 37M17 37L25 48M24 65L51 68" fill="none" stroke="#f1c78c" stroke-width="2" stroke-dasharray="3 3"/></svg>';
  function cfg(key){return GD.설정.미니게임[key];}
  function focus(m,label){var box=m.querySelector('.mg');box.tabIndex=0;box.setAttribute('role','group');box.setAttribute('aria-label',label);box.focus({preventScroll:true});return box;}
  function clockBar(m,fraction){m.querySelector('.pf-time i').style.width=Math.max(0,Math.min(1,fraction))*100+'%';}
  function controls(items){return '<div class="more-controls">'+items.map(function(t,i){return '<button type="button" data-answer="'+i+'"><small>'+(i+1)+'</small>'+t+'</button>';}).join('')+'</div>';}

  U.miniFly=function(cb){
    var C=cfg('뜬공'),m=H.open('⚾ 뜬공 포구','좌우로 움직여 <b>낙하지점 아래</b>를 지키세요. 바람에 조금씩 밀려요.',
      '<div class="fly-fence"></div><div class="fly-shadow"></div><div class="fly-ball">'+H.ball+'</div><div class="fly-glove">'+gloveArt+'</div><div class="fly-label">낙하지점</div><div class="pf-time"><i></i></div>','fly-field');
    m.querySelector('.mgf').insertAdjacentHTML('afterend','<div class="more-controls"><button data-move="-1">◀ 왼쪽</button><button data-move="1">오른쪽 ▶</button></div>');
    var life=H.lifecycle(m,cb),box=focus(m,'뜬공 포구. 좌우 버튼 또는 방향키를 누르고 있으면 이동합니다.'),start=performance.now(),last=start,x=.5,dir=0;
    var side=Math.random()<.5?-1:1,base=.5+side*(.22+Math.random()*.08),phase=Math.random()*Math.PI*2;
    function target(t){return base+.05*Math.sin(t*2.3+phase);}
    var glove=m.querySelector('.fly-glove'),ball=m.querySelector('.fly-ball'),shadow=m.querySelector('.fly-shadow');
    function stop(){dir=0;}
    box.addEventListener('keydown',function(e){if(!life.active())return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();dir=e.key==='ArrowLeft'?-1:1;}});
    box.addEventListener('keyup',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stop();}});
    box.addEventListener('focusout',stop);
    m.querySelectorAll('[data-move]').forEach(function(b){
      b.addEventListener('pointerdown',function(e){if(!life.active()||e.isPrimary===false||e.button!==0)return;e.preventDefault();dir=Number(b.dataset.move);try{b.setPointerCapture(e.pointerId);}catch(ignore){}});
      ['pointerup','pointercancel','lostpointercapture'].forEach(function(name){b.addEventListener(name,stop);});
      // 키보드로 버튼을 누르면 한 걸음, 방향키를 누르고 있으면 계속 이동합니다.
      b.addEventListener('click',function(e){if(life.active()&&e.detail===0)x=Math.max(.08,Math.min(.92,x+Number(b.dataset.move)*.05));});
    });
    life.run(function(now){
      var t=Math.min(C.제한초,(now-start)/1000),dt=Math.max(0,Math.min(now,start+C.제한초*1000)-last)/1000;last=now;
      x=Math.max(.08,Math.min(.92,x+dir*C.이동속도*dt));var tx=target(t),progress=t/C.제한초;
      glove.style.left=x*100+'%';shadow.style.left=tx*100+'%';ball.style.left=(.5+(tx-.5)*progress)*100+'%';ball.style.top=(12+progress*64)+'%';ball.style.transform='translate(-50%,-50%) scale('+(0.45+progress*.55)+')';clockBar(m,1-progress);
      if(t>=C.제한초){var error=Math.abs(x-tx),g=H.grade(error,C);life.end(g,['공을 놓쳤어요','글러브 끝에 걸렸어요','안정적인 포구!','완벽한 낙구 판단!'][g],'낙하지점 오차 '+Math.round(error*100)+'%');}
    });return life.cancel;
  };

  U.miniBunt=function(cb){
    var C=cfg('번트'),target=.40+Math.random()*.25,m=H.open('🏏 번트 조절','버튼을 <b>누른 채 힘을 모으고</b>, 표시된 구간에서 놓으세요.',
      '<div class="bunt-line"></div><div class="bunt-ball">'+H.ball+'</div><div class="bunt-bat"></div><div class="bunt-meter"><i class="bunt-fill"></i><b class="bunt-zone"></b><span class="bunt-tick"></span></div><div class="bunt-status">힘을 조절해 수비수 앞에 떨어뜨려요</div><div class="pf-time"><i></i></div>','bunt-field');
    m.querySelector('.mgf').insertAdjacentHTML('afterend','<div class="more-controls"><button class="bunt-hold">누르고 있다가 놓기</button></div>');
    var life=H.lifecycle(m,cb),box=focus(m,'번트. 버튼 또는 스페이스를 누르고 있다가 목표 구간에서 놓으세요.'),start=performance.now(),held=null,source=null;
    var button=m.querySelector('.bunt-hold'),zone=m.querySelector('.bunt-zone');zone.style.left=(target-C.좋음)*100+'%';zone.style.width=C.좋음*200+'%';m.querySelector('.bunt-tick').style.left=target*100+'%';
    function charge(t){return held===null?0:Math.min(1,(t-held)/(C.충전초*1000));}
    function begin(kind,e){if(!life.active()||held!==null)return;held=H.time(e);source=kind;button.classList.add('charging');button.textContent='목표 구간에서 놓으세요';}
    function release(kind,e,canceled){
      if(!life.active()||held===null||source!==kind)return;
      var power=charge(H.time(e)),g=canceled||performance.now()-start>=C.제한초*1000?0:H.grade(Math.abs(power-target),C);
      button.disabled=true;m.querySelector('.bunt-ball').style.transform='translate('+(power*100)+'px,-75px)';
      life.end(g,['번트 실패','불안한 번트','희생 번트 성공!','절묘한 번트!'][g],canceled?'입력이 중단됐어요.':'목표 힘 '+Math.round(target*100)+'% · 실제 '+Math.round(power*100)+'%');
    }
    button.addEventListener('pointerdown',function(e){if(e.isPrimary===false||e.button!==0)return;e.preventDefault();begin('pointer',e);try{button.setPointerCapture(e.pointerId);}catch(ignore){}});
    button.addEventListener('pointerup',function(e){release('pointer',e,false);});button.addEventListener('pointercancel',function(e){release('pointer',e,true);});
    box.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)begin('key',e);}});
    box.addEventListener('keyup',function(e){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();release('key',e,false);}});
    life.run(function(now){var power=charge(now);m.querySelector('.bunt-fill').style.width=power*100+'%';if(held!==null)m.querySelector('.bunt-status').textContent='현재 힘 '+Math.round(power*100)+'%';clockBar(m,1-(now-start)/(C.제한초*1000));if(now-start>=C.제한초*1000 || power>=1){button.disabled=true;life.end(0,'번트 실패',power>=1?'힘을 너무 오래 모았어요.':'번트 타이밍을 놓쳤어요.');}});
    return life.cancel;
  };

  // 세 문제를 한 번씩 판정합니다. 공개 전 입력, 연타와 키 반복은 다음 문제에 넘어가지 않습니다.
  function rounds(m,cb,C,questions,show,labels){
    var life=H.lifecycle(m,cb),box=focus(m,'세 번의 판단. 화면 버튼 또는 숫자 키로 선택하세요.'),index=0,correct=0,phase='ready',at=performance.now(),buttons=m.querySelectorAll('[data-answer]');
    var status=m.querySelector('.round-status');
    function enable(on){buttons.forEach(function(b){b.disabled=!on;});}
    function settle(answer){
      if(!life.active()||phase!=='answer'||answer>=buttons.length)return;
      if(performance.now()-at>=C.판단초*1000)answer=-1;
      var good=answer===questions[index].answer;if(good)correct++;
      phase='gap';at=performance.now();enable(false);box.focus({preventScroll:true});status.textContent=(good?'좋은 판단!':'아쉬운 판단')+' · '+questions[index].reason;
      Feedback.play(good?'catch':'select');
      // 마지막 입력 직후 컷인만 먼저 표시합니다. 기존 판정·결과 대기 시간은 유지합니다.
      if(index===questions.length-1 && window.BaseballResultArt)BaseballResultArt.show(m,labels[correct],correct<2);
    }
    buttons.forEach(function(b){b.onclick=function(){settle(Number(b.dataset.answer));};});
    box.addEventListener('keydown',function(e){if(/^[123]$/.test(e.key)&&!e.repeat){e.preventDefault();settle(Number(e.key)-1);}});
    function prepare(){phase='ready';at=performance.now();enable(false);show(questions[index],false);status.textContent=(index+1)+' / 3 · 준비';}
    prepare();
    life.run(function(now){
      if(phase==='ready'&&now-at>=(C.준비초||0)*1000){phase='answer';at=now;show(questions[index],true);enable(true);status.textContent=(index+1)+' / 3 · 판단하세요';}
      else if(phase==='answer'){clockBar(m,1-(now-at)/(C.판단초*1000));if(now-at>=C.판단초*1000)settle(-1);}
      else if(phase==='gap'&&now-at>=C.간격초*1000){index++;if(index===3)life.end(correct,labels[correct],'3번 중 '+correct+'번 정확하게 판단했어요.');else prepare();}
    });return life.cancel;
  }
  U.miniDiscipline=function(cb){
    var m=H.open('👀 선구안','공이 멈춘 코스를 보고 <b>존 안이면 스윙, 밖이면 지켜보기</b>. 총 3구입니다.',
      '<div class="eye-zone"><span>스트라이크 존</span></div><div class="eye-ball">'+H.ball+'</div><div class="round-status" role="status"></div><div class="pf-time"><i></i></div>','eye-field');
    m.querySelector('.mgf').insertAdjacentHTML('afterend',controls(['스윙','지켜보기']));
    var pitches=[true,false,Math.random()<.5];if(Math.random()<.5)pitches.reverse();
    var questions=pitches.map(function(strike){var edge=Math.random()<.5?-1:1;return {answer:strike?0:1,x:strike?.38+Math.random()*.24:.5+edge*(.29+Math.random()*.06),y:.35+Math.random()*.3,reason:strike?'존 안으로 들어온 공':'존 밖으로 빠진 공'};});
    return rounds(m,cb,cfg('선구안'),questions,function(q,revealed){var ball=m.querySelector('.eye-ball');ball.hidden=!revealed;ball.style.left=q.x*100+'%';ball.style.top=q.y*100+'%';},['헷갈린 코스','한 번의 좋은 판단','침착한 선구안!','완벽한 선구안!']);
  };
  U.miniDefense=function(cb){
    var m=H.open('⚾ 수비 판단','땅볼을 잡았어요. <b>가장 앞선 주자를 포스 아웃</b>할 베이스를 고르세요.',
      '<div class="defense-diamond"></div><span class="defense-base base-first">1루</span><span class="defense-base base-second">2루</span><span class="defense-base base-third">3루</span><span class="defense-base base-home">홈</span><div class="defense-runners"></div><div class="defense-situation"></div><div class="round-status" role="status"></div><div class="pf-time"><i></i></div>','defense-field');
    m.querySelector('.mgf').insertAdjacentHTML('afterend',controls(['1루','2루','홈']));
    var scenarios=[{answer:0,bases:[],text:'주자 없음',reason:'타자주자를 1루에서 아웃'},{answer:1,bases:['first'],text:'주자 1루',reason:'1루 주자는 2루로 뛰어야 해요'},{answer:2,bases:['first','second','third'],text:'만루',reason:'3루 주자는 홈으로 뛰어야 해요'}];
    // 중복 없는 세 상황을 섞어 매번 다른 순서로 제시합니다.
    for(var i=scenarios.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),temp=scenarios[i];scenarios[i]=scenarios[j];scenarios[j]=temp;}
    return rounds(m,cb,cfg('수비판단'),scenarios,function(q){m.querySelector('.defense-situation').textContent=q.text+' · 땅볼';m.querySelectorAll('.defense-base').forEach(function(b){b.classList.remove('occupied');});q.bases.forEach(function(b){m.querySelector('.base-'+b).classList.add('occupied');});},['송구 판단 실패','한 번의 정확한 송구','침착한 수비!','완벽한 수비 판단!']);
  };
  var previous=U.extraPracticeGames;
  U.extraPracticeGames=function(){
    var levels='3 / 2 / 1 / 0 단계: '+[3,2,1,0].map(function(n){return Math.round(H.probability(n)*100)+'%';}).join(' · ');
    return Object.assign(previous(),{
      fly:{title:'뜬공 포구',icon:'⚾',play:U.miniFly,help:'바람에 움직이는 낙하지점 아래로 글러브를 옮기세요. 공이 떨어지는 순간의 거리를 판정합니다.',keys:'좌우 버튼을 길게 누르거나 ← → 방향키',levels:levels},
      bunt:{title:'번트',icon:'🏏',play:U.miniBunt,help:'버튼을 누르고 힘을 모은 뒤 초록 구간의 중앙에서 놓으세요. 목표 힘은 매번 달라집니다.',keys:'버튼 또는 스페이스·엔터를 누르고 있다가 놓기',levels:levels},
      discipline:{title:'선구안',icon:'👀',play:U.miniDiscipline,help:'공이 멈춘 위치를 보고 존 안이면 스윙, 밖이면 지켜보기를 고르세요. 총 3구입니다.',keys:'화면 버튼 또는 숫자 1·2',levels:levels},
      defense:{title:'수비 판단',icon:'⚾',play:U.miniDefense,help:'주자 없는 땅볼은 1루, 주자 1루는 2루, 만루는 홈! 가장 앞선 주자의 포스 아웃을 노리세요. 노란 베이스에 주자가 있습니다.',keys:'화면 버튼 또는 숫자 1·2·3',levels:levels}
    });
  };
})();
