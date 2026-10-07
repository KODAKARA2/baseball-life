// 1~2년마다 주어지는 자유행동. 메뉴 이동은 턴을 쓰지 않고, 행동 완료만 한 번 기록합니다.
(function () {
  var I = E._internal;
  function rules() { return GD.설정.자유행동; }
  function nextAge() {
    var gap = rules().간격년;
    return E.state().나이 + gap[0] + Math.floor(Math.random() * (gap[1] - gap[0] + 1));
  }
  E.initFreeTime = function () {
    var s = E.state();
    if (s.다음자유나이 == null) s.다음자유나이 = nextAge();
  };
  E.freeTimeDue = function () {
    var s = E.state();
    E.initFreeTime();
    return !s.엔딩 && s.나이 >= s.다음자유나이 && rules().시기.indexOf(s.시기) >= 0 && !s.플래그.외국인작별;
  };
  E.freeTimeCandidates = function () {
    var s = E.state();
    if (s.히로인2 || s.플래그.외국인작별) return [];
    return GD.히로인.filter(function (h) {
      return I.arr(h.만나는시기).indexOf(s.시기) >= 0 && E.check(h.만남조건) &&
        (!s.히로인 || s.히로인.아이디 !== h.아이디) && s.만난히로인.indexOf(h.아이디) < 0;
    });
  };
  function option(text, action, extra) { return Object.assign({ 글: text, 자유선택: action }, extra || {}); }
  function back(screen) { return option("← 돌아가기", "이동", { 화면: screen }); }
  function card(title, text, options, extra) {
    return Object.assign({ 시스템: true, 자유행동: true, 제목: title, 내용: text, 선택지: options }, extra || {});
  }
  E.freeTimeCard = function () {
    var s = E.state(), f = s.자유시간, L = rules();
    if (f.화면 === "데이트") {
      var opts = [];
      if (s.히로인) opts.push(option(E.heroDef().이름 + (s.히로인.관계 === "만남" ? " · 알아가는 시간" : " · 데이트"), "데이트"));
      opts.push(option("다른 히로인을 직접 찾아간다", "이동", { 화면: "찾기" }), back("메뉴"));
      return card("누구와 시간을 보낼까", "현재 인연과 대화를 나누거나 새로운 사람을 찾아가자. 알아가는 사이에서는 대화 1회와 호감이 쌓이고, 교제는 별도의 고백으로 시작한다.", opts);
    }
    if (f.화면 === "찾기") {
      var candidates = E.freeTimeCandidates();
      var text = candidates.length ? "만나고 싶은 사람을 직접 골라 보자. 이름을 누르면 만남과 관계 정리 여부를 확인할 수 있다." :
        (s.히로인2 ? "지금은 두 인연 사이에서 관계를 정리해야 한다. 현재 인연과 시간을 보내거나 다른 자유행동을 골라 보자." : "지금 시기와 상황에서는 새로 만날 수 있는 사람이 없다. 릴리는 메이저리그에서, 지안은 국내 1군에서, 채윤은 재활이 필요할 때 만날 수 있다. 현재 인연을 만나거나 다른 자유행동을 골라 보자.");
      return card("새로운 인연을 찾아서", text, candidates.map(function (h) {
        return option(h.이름 + " · " + h.유형, "이동", { 화면: "만남", 대상: h.아이디 });
      }).concat([back("데이트")]));
    }
    if (f.화면 === "만남") {
      var h = E.heroDef(f.대상), current = s.히로인 && E.heroDef();
      if (!h || !E.freeTimeCandidates().some(function (x) { return x.아이디 === f.대상; })) {
        return card("다음 기회를 기다리며", "지금은 이 사람을 만날 수 없다. 다른 인연이나 활동을 골라 보자.", [back("찾기")]);
      }
      var notice = "직접 인사를 건네며 알아가는 사이로 시작한다. 호감 30, 대화 0회부터 시작하며 교제는 나중에 고백해야 한다.";
      if (current) notice += "\n\n" + E.tpl(s.히로인.관계 === "만남" ? "{히로인}와 연락을 정리한 뒤 새 인연을 알아간다." : "{히로인}와 현재 관계를 먼저 끝낸다. 이별로 멘탈·행복도가 감소한다.");
      return card(h.이름 + "에게 다가가기", h.소개 + "\n\n" + notice, [
        option(current ? "현재 인연을 정리하고 " + h.이름 + "에게 인사한다" : h.이름 + "에게 먼저 인사한다", "만남", { 대상: h.아이디 }), back("찾기")
      ], { _만남: h.아이디 });
    }
    return card("나를 위한 자유시간", (s.시기 === "군복무" ? "모처럼 받은 휴가. " : "모처럼 비워 둔 일정. ") + "이번에는 무엇을 할까? 자유행동은 1~2년에 한 번 찾아오며, 한 가지 활동을 마치면 일상으로 돌아간다.", [
      option("⚾ 연습 · 능력치 하나 +1", "연습"),
      option("💗 데이트 · 현재 인연 / 새로운 만남", "이동", { 화면: "데이트" }),
      option("🎣 취미활동 · 무작위 취미로 행복 충전", "취미"),
      option("🛌 휴식 · 부상·슬럼프 1턴씩 회복", "휴식")
    ]);
  };
  E.chooseFreeTime = function (index) {
    var s = E.state(), c = s.현재카드, o = c.선택지[s.현재옵션[index]], L = rules();
    if (s.단계 !== "카드" || !s.자유시간 || !o) return s.결과;
    var r = { 결과: "", 효과: {}, 알림: [] }, done = true;
    function apply(fx) { E.applyEffects(fx, r.효과); }
    if (o.자유선택 === "이동") {
      s.자유시간 = { 화면: o.화면, 대상: o.대상 || null }; done = false;
      r.결과 = o.화면 === "만남" ? "어떻게 다가갈지 생각해 보자. 아직 현재 관계는 바뀌지 않았다." : "천천히 골라도 괜찮다. 활동을 마칠 때까지 자유시간은 남아 있다.";
    } else if (o.자유선택 === "연습") {
      var stats = E.posStats().filter(function (k) { return s.능력치[k] < E.cap(); });
      if (stats.length) { var stat = I.pick(stats); s.능력치[stat]++; r.효과[stat] = 1; r.결과 = "기본 동작을 차분히 반복했다. " + stat + " 감각이 조금 더 좋아졌다."; }
      else { apply({ 멘탈: 1 }); r.결과 = "현재 실력의 한계에 도달해 이미지 트레이닝으로 마음을 다잡았다."; }
    } else if (o.자유선택 === "데이트" && s.히로인 && !s.플래그.외국인작별) {
      apply({ 애정도: L.데이트호감, 행복도: L.데이트행복 });
      if (s.히로인.관계 === "만남") {
        s.히로인.교류횟수 = (s.히로인.교류횟수 || 0) + 1;
        r.결과 = E.tpl("{히로인}와 취향과 일상에 대해 이야기를 나눴다. 서로를 조금 더 알게 됐다.");
        r.알림.push("알아가는 대화 +1 · 고백 조건을 채우면 별도의 고백 카드가 나타납니다");
      } else r.결과 = s.플래그.장거리 ? "시간을 맞춰 영상통화를 했다. 서로의 하루를 들으며 멀리 있어도 같은 시간을 보냈다." : E.tpl("약속 시간을 비워 두고 {히로인}와 천천히 시간을 보냈다. 함께하는 일상이 소중하게 느껴졌다.");
    } else if (o.자유선택 === "만남" && E.freeTimeCandidates().some(function (h) { return h.아이디 === o.대상; })) {
      var old = s.히로인 && E.heroDef().이름, happy = s.행복도, mental = s.능력치.멘탈;
      if (s.히로인) I.setRelation("이별");
      I.attachHeroine(o.대상);
      if (s.행복도 !== happy) r.효과.행복도 = s.행복도 - happy;
      if (s.능력치.멘탈 !== mental) r.효과.멘탈 = s.능력치.멘탈 - mental;
      r.결과 = (old ? old + "에게 작별을 전한 뒤, " : "") + E.heroDef().이름 + "에게 먼저 인사를 건넸다. 서로 연락을 주고받으며 알아가 보기로 했다.";
      r.알림.push("🌱 " + E.heroDef().이름 + " · 알아가는 중 (호감 30)");
    } else if (o.자유선택 === "취미") {
      var hobby = I.pick(L.취미.filter(function (h) { return !h.최소나이 || s.나이 >= h.최소나이; }));
      apply({ 행복도: L.취미행복 }); r.결과 = "오늘의 취미: " + hobby.이름 + "\n\n" + hobby.내용;
    } else if (o.자유선택 === "휴식") {
      var injury = s.부상, slump = s.슬럼프;
      s.부상 = Math.max(0, injury - 1); s.슬럼프 = Math.max(0, slump - 1);
      apply({ 컨디션: L.휴식컨디션 }); r.결과 = "일정을 비우고 충분히 쉬었다. 몸과 마음을 서두르지 않고 돌본 하루였다.";
      if (injury) r.알림.push("부상 회복 · " + injury + " → " + s.부상 + "턴");
      if (slump) r.알림.push("슬럼프 회복 · " + slump + " → " + s.슬럼프 + "턴");
    } else { s.자유시간 = { 화면: "메뉴" }; done = false; r.결과 = "상황이 달라졌다. 가능한 활동을 다시 골라 보자."; }
    if (done) {
      s.총턴++; s.다음자유나이 = nextAge(); delete s.자유시간;
      r.알림.push("다음 자유행동: " + s.다음자유나이 + "세 무렵");
    }
    s.결과 = r; s.단계 = "결과"; E.save(); return r;
  };
})();
