// Display existing eligibility, never predict a roll or promise the next card.
(function () {
  E.careerProgress=function(){
    var s=E.state(),I=E._internal,lines=[];
    if(['프로','메이저리그'].indexOf(s.시기)<0)return ['프로에 진출하면 콜업과 계약 제안 조건을 확인할 수 있습니다.'];
    var playing=s.시기==='프로'?s.일군:s.플래그.빅리거;
    lines.push('현재 무대 · '+(s.시기==='프로'?(playing?'1군':'2군'):(playing?'빅리그':'마이너'))+' · 출전량은 계약·부상·선수 유형·시즌 기회에 따라 달라집니다.');
    if(!playing)I.CARDS().filter(function(c){
      return I.arr(c.시기).indexOf(s.시기)>=0 && (c.반복||s.본카드[c._id]==null) && c.선택지.some(function(o){return o.일군===true||I.arr(o.플래그).indexOf('빅리거')>=0;});
    }).forEach(function(c){
      var q=c.조건||{},checks=[];
      function add(label,condition){checks.push((E.check(condition)?'✓ ':'○ ')+label);}
      Object.keys(q.최소||{}).forEach(function(k){var condition={최소:{}};condition.최소[k]=q.최소[k];add(k==='이군기간'&&s._강등턴==null?'이군기간 · 강등 이력 없음':k+' '+Math.round(I.val(k)*10)/10+' / '+q.최소[k]+' 이상',condition);});
      if(q.상태)add(q.상태==='건강'?'부상·슬럼프 없음':q.상태,{상태:q.상태});
      I.arr(q.플래그).forEach(function(f){add(f+' 필요',{플래그:f});});
      I.arr(q.플래그없음).forEach(function(f){add(f+' 해제 필요',{플래그없음:f});});
      if(c.반복&&s.본카드[c._id]!=null)checks.push('재등장 간격 '+(s.총턴-s.본카드[c._id])+' / '+(c.간격||4)+'턴');
      lines.push(c.제목+' · 참고 조건\n'+checks.join(' · '));
    });
    var requirements=E.story.contractRequirements();
    lines.push('다음 계약 제안 · '+(requirements.every(function(r){return r.met;})?'자격 조건 충족':'준비 중')+'\n'+requirements.map(function(r){return (r.met?'✓ ':'○ ')+r.label;}).join(' · '));
    lines.push('조건을 채워도 즉시 출전·계약을 보장하지 않습니다. 우선 사건, 카드 이력과 간격, 선수 유형 선택 및 이야기 진행 순서가 함께 적용됩니다.');
    return lines;
  };
})();
