// Baseball portable saves, with validation before any state/storage mutation.
(function () {
  var I = E._internal, keys = [I.SAVE_KEY, 'baseball-life-collection', 'baseball-life-bonus-looks'];
  var recovery = 'baseball-life-recovery-v1', stamp = 'baseball-life-saved-at-v1', limit = 2 * 1024 * 1024;
  var sportStats = I.POS_STATS.투수.concat(I.POS_STATS.야수);
  E.saveStatus = { time: null, error: null };
  try { E.saveStatus.time = localStorage.getItem(stamp); } catch (_) {}
  function fail(message) { throw new Error(message); }
  function safeParse(raw) {
    if (typeof raw !== 'string' || raw.length > limit || unescape(encodeURIComponent(raw)).length > limit) fail('파일 크기 제한은 2MB입니다.');
    var data = JSON.parse(raw);
    function walk(v, depth) {
      if (depth > 40) fail('저장 구조가 너무 깊습니다.');
      if (typeof v === 'number' && (!Number.isFinite(v) || Math.abs(v) > 1e15)) fail('올바르지 않은 숫자입니다.');
      if (typeof v === 'string' && (v.length > 30000 || /[<>]/.test(v))) fail('허용되지 않는 저장 문자열입니다.');
      if (v && typeof v === 'object') Object.keys(v).forEach(function (k) {
        if (['__proto__','prototype','constructor'].indexOf(k) >= 0 || /[<>]/.test(k)) fail('허용되지 않는 저장 속성입니다.');
        if(k==='효과' && v[k]!=null) {
          if(!object(v[k]))fail('효과 구조 오류');
          Object.keys(v[k]).forEach(function(stat){
            if(sportStats.concat(I.COMMON,['모든능력치','특기능력치','부상','부상감소','슬럼프','슬럼프감소','애정도','애정도2','행복도','성적','돈','만남확률','호감']).indexOf(stat)<0)fail('효과 능력 오류');
            var value=v[k][stat];if(!(typeof value==='number'||(Array.isArray(value)&&value.length===2&&value.every(function(n){return typeof n==='number';}))))fail('효과 수치 오류');
          });
        }
        walk(v[k], depth + 1);
      });
    }
    walk(data,0); return data;
  }
  function object(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function number(v, min, max) { return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max; }
  function validateState(s) {
    if (s === null) return;
    if (!object(s) || s.버전 !== 1 || (s.게임 != null && s.게임 !== 'baseball-life')) fail('지원하지 않는 경력 버전입니다.');
    if (typeof s.이름 !== 'string' || s.이름.length > 100 || !GD.포지션.some(function (p) { return p.이름 === s.포지션; }) || !GD.특기.some(function (p) { return p.이름 === s.특기; })) fail('선수 정보가 올바르지 않습니다.');
    if (!GD.설정.시기[s.시기] || ['카드','결과','엔딩'].indexOf(s.단계) < 0 || !number(s.나이,10,100) || !Number.isInteger(s.총턴) || s.총턴 < 0) fail('경력 진행 정보가 올바르지 않습니다.');
    if (!object(s.능력치)) fail('능력치가 없습니다.');
    I.POS_STATS[GD.포지션.find(function(p){return p.이름===s.포지션;}).분류].concat(I.COMMON).forEach(function (k) { if (!number(s.능력치[k],0,100)) fail('능력치 범위 오류: ' + k); });
    Object.keys(s.능력치).forEach(function(k) { if (sportStats.concat(I.COMMON).indexOf(k) < 0) fail('알 수 없는 능력치입니다.'); });
    ['플래그','본카드'].forEach(function (k) { if (!object(s[k])) fail('저장 필드 오류: ' + k); });
    ['기록','수상','순간','대기열','현재옵션','지난히로인','만난히로인'].forEach(function (k) { if (!Array.isArray(s[k]) || s[k].length > 10000) fail('저장 목록 오류: ' + k); });
    ['행복도','성적','부상','슬럼프','올해카드','올해부상카드'].forEach(function(k) { if (!number(s[k],0,1e9)) fail('저장 수치 오류: ' + k); });
    ['돈','총수입','연차','팀이동','자녀','시기턴','진입나이','다음자유나이','외모','세대','상속금'].forEach(function(k){if(s[k]!=null&&!number(s[k],0,1e12))fail('저장 수치 오류: '+k);});
    s.기록.forEach(function(row){if(!object(row))fail('시즌 기록 오류');['나이','연도'].forEach(function(k){if(!number(row[k],0,1e9))fail('시즌 기록 수치 오류');});});
    if(s.알아가는인연!=null && (!Array.isArray(s.알아가는인연)||!s.알아가는인연.every(function(h){return object(h)&&GD.히로인.some(function(d){return d.아이디===h.아이디;})&&number(h.애정도,0,100);})))fail('인연 목록 오류');
    ['구매','본뉴스'].forEach(function(k){if(s[k]!=null&&!object(s[k]))fail('저장 필드 오류: '+k);});
    function person(h) { return object(h) && GD.히로인.some(function(d){return d.아이디===h.아이디;}) && number(h.애정도,0,100) && ['만남','연인','배우자'].indexOf(h.관계)>=0; }
    ['히로인','히로인2'].forEach(function(k){if(s[k]&&!person(s[k]))fail('인연 정보 오류');});
    if(s.알아가는인연 && !s.알아가는인연.every(person))fail('인연 목록 오류');
    s.기록.forEach(function(row){
      var fields=row.평균자책점!=null?['평균자책점','탈삼진','이닝']:['타율','홈런','타점','도루','안타','타수'];
      fields.forEach(function(k){if(!number(row[k],0,1e9))fail('야구 기록 수치 오류: '+k);});
    });
    if(s.선수생활!=null) {
      var d=s.선수생활;
      if(!object(d)||(d.버전!=null&&d.버전!==1))fail('선수 수첩 버전 오류');
      if(d.버전===1 && (!object(d.완료)||!object(d.기억)||!Array.isArray(d.목표이력)||!d.목표이력.every(object)))fail('선수 수첩 구조 오류');
      if(d.기억)Object.keys(d.기억).forEach(function(id){if(!GD.히로인.some(function(h){return h.아이디===id;})||!object(d.기억[id]))fail('인연 기억 오류');});
      ['목표','진행','계약','기회'].forEach(function(k){if(d[k]!=null&&!object(d[k]))fail('선수 수첩 항목 오류');});
    }
    if(s.단계==='결과') {
      var r=s.결과;
      if(!object(r)||(r.알림!=null&&!Array.isArray(r.알림)))fail('결과 구조 오류');
      if(r.미니게임 && (!object(r.미니게임)||!number(r.미니게임.확률,0,1)||(!r.미니게임.표시&&!number(r.미니게임.타이밍,0,100))))fail('미니게임 결과 오류');
    }
    if(s.단계==='엔딩'&&!s.엔딩)fail('엔딩이 없습니다.');
    function validateCard(c){
      if(!object(c)||!Array.isArray(c.선택지)||!c.선택지.length)fail('카드 구조 오류');
      c.선택지.forEach(function(o){
        if(!object(o)||typeof o.글!=='string')fail('선택지 오류');
        if(o.이동 && o.이동!=='엔딩'&&!GD.설정.시기[o.이동])fail('이동 시기 오류');
        ['비용','비용비율'].forEach(function(k){if(o[k]!=null&&!number(o[k],0,1e12))fail('비용 오류');});
      });
    }
    if(s.현재카드)validateCard(s.현재카드);
    s.대기열.forEach(function(c){if(typeof c!=='string')validateCard(c);});
    if(s.엔딩 && (!object(s.엔딩)||!object(s.엔딩.기본)||!Array.isArray(s.엔딩.칭호)||!Array.isArray(s.엔딩.히로인들)))fail('엔딩 구조 오류');
    ['히로인','히로인2'].forEach(function(k) { if (s[k] && (!GD.히로인.some(function(h) { return h.아이디 === s[k].아이디; }) || !number(s[k].애정도,0,100))) fail('인연 정보 오류'); });
    if (s.단계 === '카드' && (!object(s.현재카드) || !Array.isArray(s.현재카드.선택지) || !s.현재옵션.every(function(i) { return Number.isInteger(i) && object(s.현재카드.선택지[i]); }))) fail('진행 카드 오류');
  }
  function validateCollection(c) {
    if (c === null) return;
    if (!object(c) || !number(c.인생수 || 0,0,1e9)) fail('도감 형식 오류');
    ['엔딩','업적','레어'].forEach(function(k) { if (c[k] != null && (!object(c[k]) || !Object.values(c[k]).every(function(v) { return object(v) && number(v.횟수,0,1e9) && number(v.처음,0,1e15); }))) fail('도감 항목 오류'); });
  }
  function validateBonus(b) {
    if (b === null) return;
    if (typeof b === 'number') { if (!number(b,1,10)) fail('보너스 오류'); return; }
    if (!object(b) || (b.외모 != null && !number(b.외모,1,10))) fail('보너스 오류');
    if (b.이어하기 && (!object(b.이어하기) || typeof b.이어하기.아버지 !== 'string' || !number(b.이어하기.외모,1,10) || !number(b.이어하기.돈,0,1e12))) fail('2세 정보 오류');
  }
  function bundle(data) { return { format:'baseball-life-transfer', version:1, exportedAt:new Date().toISOString(), career:data[0], collection:data[1], bonus:data[2] }; }
  E.previewImport = function(raw) {
    var b = safeParse(raw);
    if (!object(b) || b.format !== 'baseball-life-transfer' || b.version !== 1 || !('career' in b) || !('collection' in b) || !('bonus' in b)) fail('야구 인생 내보내기 파일이 아닙니다.');
    validateState(b.career); validateCollection(b.collection); validateBonus(b.bonus); return b;
  };
  E.exportSave = function() { var data=keys.map(function(k,i){if(i===0 && I.S)return I.S;var raw=localStorage.getItem(k);return raw?safeParse(raw):null;}); return JSON.stringify(bundle(data), null, 2); };
  E.importSave = function(raw) {
    var b = E.previewImport(raw), previous = keys.map(function(k) { return localStorage.getItem(k); }), oldState = I.S, oldStamp = localStorage.getItem(stamp), oldStatus = E.saveStatus;
    var data = [b.career,b.collection,b.bonus];
    // A recovery copy is mandatory. Quota failure here leaves all active keys intact.
    var previousData; try { previousData=previous.map(function(x) { return x ? safeParse(x) : null; }); } catch (_) { localStorage.setItem('baseball-life-damaged-v1',JSON.stringify(previous)); }
    if (previousData) { if (oldState) previousData[0] = oldState; localStorage.setItem(recovery, JSON.stringify(bundle(previousData))); }
    try {
      keys.forEach(function(k,i) { if (data[i] === null) localStorage.removeItem(k); else localStorage.setItem(k,JSON.stringify(data[i])); });
      if (b.career) { if (!E.load()) fail('경력 복원에 실패했습니다.'); } else I.S = null;
      var time = new Date().toISOString(); localStorage.setItem(stamp,time); E.saveStatus = {time:time,error:null};
    } catch (error) {
      I.S = oldState; E.saveStatus = oldStatus;
      try { if (oldStamp === null) localStorage.removeItem(stamp); else localStorage.setItem(stamp,oldStamp); } catch (_) {}
      keys.forEach(function(k,i) { try { if (previous[i] === null) localStorage.removeItem(k); else localStorage.setItem(k,previous[i]); } catch (_) {} });
      throw error;
    }
    if (typeof document !== 'undefined') { var notice = document.getElementById('save-error'); if (notice) notice.remove(); }
    return true;
  };
  E.recoverySave = function() { return localStorage.getItem(recovery); };
  E.save = function() {
    try {
      var raw = JSON.stringify(E.state());
      localStorage.setItem(keys[0],raw);
      var time = new Date().toISOString(); localStorage.setItem(stamp,time); E.saveStatus = {time:time,error:null}; if(typeof document !== 'undefined') {var oldNotice=document.getElementById('save-error');if(oldNotice)oldNotice.remove();} return true;
    } catch (error) {
      E.saveStatus.error = '저장 실패: ' + error.message;
      if (typeof document !== 'undefined') {
        var notice = document.getElementById('save-error');
        if (!notice) { notice = document.createElement('div'); notice.id='save-error'; notice.setAttribute('role','alert'); document.body.appendChild(notice); }
        notice.textContent = '자동 저장에 실패했습니다. 저장 메뉴에서 파일로 내보내세요.';
      }
      return false;
    }
  };
})();
