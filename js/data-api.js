// 데이터 파일(data 폴더)에서 쓰는 등록 함수들입니다. 이 파일은 고치지 않아도 됩니다.
window.GD = {
  설정: {}, 포지션: [], 특기: [], 카드: [], 히로인: [],
  기본엔딩: [], 직업엔딩: [], 조연: {}, 메이저리그: {}, 뉴스: [], 상점: []
};

function _병합(대상, 원본) {
  Object.keys(원본).forEach(function (k) {
    var v = 원본[k];
    if (v && typeof v === "object" && !Array.isArray(v) && 대상[k] && typeof 대상[k] === "object") _병합(대상[k], v);
    else 대상[k] = v;
  });
}

function 설정(o) { _병합(GD.설정, o); }
function 메이저리그설정(o) { _병합(GD.메이저리그, o); }
function 포지션() { GD.포지션.push.apply(GD.포지션, arguments); }
function 특기() { GD.특기.push.apply(GD.특기, arguments); }
function 조연(o) { _병합(GD.조연, o); }
function 카드() { GD.카드.push.apply(GD.카드, arguments); }
function 히로인(o) { GD.히로인.push(o); }
function 기본엔딩() { GD.기본엔딩.push.apply(GD.기본엔딩, arguments); }
function 직업엔딩() { GD.직업엔딩.push.apply(GD.직업엔딩, arguments); }
function 뉴스() { GD.뉴스.push.apply(GD.뉴스, arguments); }
function 상점() { GD.상점.push.apply(GD.상점, arguments); }
