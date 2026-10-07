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
  E.freeTimeMeetingChance = function () {
    var level = I.clamp(Math.floor(E.state().외모 || 5), 1, 10);
    return rules().새인연확률[level - 1];
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
      if (s.히로인 && s.히로인.관계 !== "만남") opts.push(option(E.heroDef().이름 + " · 데이트", "데이트", { 대상: s.히로인.아이디 }));
      E.acquaintances().forEach(function (h) { opts.push(option(E.heroDef(h.아이디).이름 + " · 알아가는 시간", "데이트", { 대상: h.아이디 })); });
      opts.push(option("새로운 인연을 찾아 나선다", "이동", { 화면: "찾기" }), back("메뉴"));
      return card("누구와 시간을 보낼까", "문득 안부가 궁금한 사람이 떠올랐다. 오늘은 누구에게 연락해 볼까?", opts);
    }
    // 예전 저장의 인물 지정 화면도 무작위 탐색 화면으로 보여 줍니다.
    if (f.화면 === "찾기" || f.화면 === "만남") {
      var candidates = E.freeTimeCandidates();
      var text = candidates.length ? "익숙한 하루에서 조금 벗어나 보고 싶다. 오늘은 어떤 사람과 마주치게 될까? 인연이 닿지 않아도 오늘의 자유시간은 지나간다." :
        (s.히로인2 ? "지금은 두 인연 사이에서 관계를 정리해야 한다. 현재 인연과 시간을 보내거나 다른 자유행동을 골라 보자." : "지금 시기와 상황에서는 새로 만날 수 있는 사람이 없다. 현재 인연을 만나거나 다른 자유행동을 골라 보자.");
      var search = candidates.length ? [option("새 인연을 찾아본다 · 만남 확률 " + Math.round(E.freeTimeMeetingChance() * 100) + "%", "탐색")] : [];
      return card("새로운 인연을 찾아서", text, search.concat([back("데이트")]));
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
      s.자유시간 = { 화면: o.화면 === "만남" ? "찾기" : o.화면 }; done = false;
      r.결과 = "천천히 골라도 괜찮다. 활동을 마칠 때까지 자유시간은 남아 있다.";
    } else if (o.자유선택 === "연습") {
      var stats = E.posStats().filter(function (k) { return s.능력치[k] < E.cap(); });
      if (stats.length) { var stat = I.pick(stats); s.능력치[stat]++; r.효과[stat] = 1; r.결과 = "기본 동작을 차분히 반복했다. " + stat + " 감각이 조금 더 좋아졌다."; }
      else { apply({ 멘탈: 1 }); r.결과 = "현재 실력의 한계에 도달해 이미지 트레이닝으로 마음을 다잡았다."; }
    } else if (o.자유선택 === "데이트" && !s.플래그.외국인작별 &&
        ((s.히로인 && s.히로인.아이디 === o.대상) || E.acquaintances().some(function (h) { return h.아이디 === o.대상; }))) {
      var person = E.acquaintances().find(function (h) { return h.아이디 === o.대상; });
      if (person) {
        E.focusAcquaintance(person.아이디);
        var before = person.애정도;
        person.애정도 = I.clamp(before + E.looksGain(L.데이트호감, "이성"), 0, 100); r.효과.호감 = person.애정도 - before;
        person.교류횟수 = (person.교류횟수 || 0) + 1;
        apply({ 행복도: L.데이트행복 });
        r.결과 = E.heroDef(person.아이디).이름 + "에게 안부를 물었다. 취향과 일상에 대해 이야기하다 보니 서로를 조금 더 알게 됐다.";
      } else { apply({ 애정도: L.데이트호감, 행복도: L.데이트행복 }); r.결과 = s.플래그.장거리 ? "시간을 맞춰 영상통화를 했다. 서로의 하루를 들으며 멀리 있어도 같은 시간을 보냈다." : E.tpl("약속 시간을 비워 두고 {히로인}와 천천히 시간을 보냈다. 함께하는 일상이 소중하게 느껴졌다."); }
    } else if (o.자유선택 === "탐색" || o.자유선택 === "만남") {
      var candidates = E.freeTimeCandidates(), chance = E.freeTimeMeetingChance();
      if (!candidates.length) {
        s.자유시간 = { 화면: "찾기" }; done = false;
        r.결과 = "지금은 새로운 인연을 만나기 어렵다. 다른 활동을 골라 보자.";
      } else if (Math.random() < chance) {
        var met = I.pick(candidates);
        I.attachHeroine(met.아이디);
        r.결과 = met.소개 + "\n\n" + met.이름 + "에게 먼저 인사를 건넸다. 서로 연락을 주고받으며 알아가 보기로 했다.";
        r.만남그림 = { 키: [met.그림.만남], 이름: met.이름 };
        r.알림.push("🌱 " + met.이름 + " · 알아가는 중");
      } else {
        r.결과 = "새로운 인연을 기대하며 나섰지만, 오늘은 대화가 이어지는 사람을 만나지 못했다. 아쉬움을 뒤로하고 집으로 돌아왔다.";
      }
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
      E.growHeroineAffection();
      s.총턴++; s.다음자유나이 = nextAge(); delete s.자유시간;
      r.알림.push("다음 자유행동: " + s.다음자유나이 + "세 무렵");
    }
    s.결과 = r; s.단계 = "결과"; E.save(); return r;
  };
})();
