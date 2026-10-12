// Observe resolved values only: never roll rewards or apply them again.
(function () {
  function snapshot() {
    var s=E.state(), v={};
    Object.keys(s.능력치).forEach(function(k){v[k]={이름:k,값:s.능력치[k]};});
    ['돈','행복도','성적','부상','슬럼프'].forEach(function(k){v[k]={이름:k,값:s[k]||0};});
    [s.히로인,s.히로인2].concat(s.알아가는인연||[]).filter(Boolean).forEach(function(h){
      v['인연:'+h.아이디]={이름:E.heroDef(h.아이디).이름,값:h.애정도,관계:h.관계};
    });
    return v;
  }
  var caps=null;
  E.beginOutcome=function(){caps=[];return snapshot();};
  E.noteCap=function(name,requested,actual){if(caps&&requested>0&&actual<requested)caps.push({이름:name,요청:requested,반영:actual});};
  E.finishOutcome=function(r,before){
    var after=snapshot();r.실제변화=[];
    Array.from(new Set(Object.keys(before).concat(Object.keys(after)))).forEach(function(k){
      var b=before[k],a=after[k];
      if(!b||!a||b.값!==a.값||b.관계!==a.관계)r.실제변화.push({키:k,이름:(a||b).이름,이전:b?b.값:null,이후:a?a.값:null,이전관계:b?b.관계:null,이후관계:a?a.관계:null});
    });
    r.상한안내=caps||[];caps=null;
  };
})();
