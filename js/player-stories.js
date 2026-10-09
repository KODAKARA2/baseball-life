// 연속 사건·시즌 목표·라이벌·선수 유형·인연의 기억·계약. 저장에 들어가는 값은 모두 JSON입니다.
(function () {
  var P = E.story = {}, I = E._internal, R = GD.선수이야기;
  function state() { return E.state(); }
  function pro() { return ["프로", "메이저리그"].indexOf(state().시기) >= 0; }
  function playing() { var s = state(); return s.시기 === "프로" ? s.일군 : s.시기 === "메이저리그" && s.플래그.빅리거; }
  function people() { var s = state(); return [s.히로인].concat(s.알아가는인연 || []).filter(Boolean); }
  function person(id) { return people().find(function (h) { return h.아이디 === id; }); }
  function available(h) { return h && (!E.heroDef(h.아이디).외국인 || state().시기 === "메이저리그"); }
  P.init = function () {
    var s = state(); if (!s) return null;
    if (s.선수생활 && s.선수생활.버전 === 1) return s.선수생활;
    var defaults = { 유형: null, 일반턴: 0, 마지막서사: -2, 진행: null, 완료: {}, 라이벌친밀: 0,
      라이벌승: 0, 라이벌패: 0, 목표: null, 목표이력: [], 기억: {}, 계약: null, 다음제안: 25, 유형변경나이: 0 };
    s.선수생활 = s.선수생활 || {};
    Object.keys(defaults).forEach(function(k){ if(s.선수생활[k] == null) s.선수생활[k] = defaults[k]; });
    s.선수생활.버전 = 1;
    return s.선수생활;
  };
  function note(text) { state().순간.push({ 나이: state().나이, 글: text }); }
  function type() { var d = P.init(); return R.유형.find(function (t) { return t.id === d.유형 && t.분류 === E.pos().분류; }); }
  P.type = type;
  P.contract = function () {
    var s = state(), c = P.init().계약;
    return c && c.팀 === s.팀 && c.시기 === s.시기 && s.나이 < c.끝나이 ? c : null;
  };
  P.playtime = function () {
    var c = P.contract(), k = P.init().기회, s = state(), base = c ? c.출전 : 1;
    return k && k.팀 === s.팀 && k.시기 === s.시기 && k.나이 === s.나이 ? Math.min(1.15,base+.15) : base;
  };
  P.salary = function (pay) { var c = P.contract(); return Math.round(pay * (c ? c.연봉 : 1)); };
  P.adjustLine = function (L, factor) {
    var t = type(); if (!t || !L) return;
    L.선수유형 = t.이름;
    if (t.id === "power") { L.홈런 += Math.round(3 * factor); L.타율 = Math.max(.17, L.타율 - .005); }
    if (t.id === "contact") { L.타율 = Math.min(.40, L.타율 + .008); L.홈런 = Math.max(0, L.홈런 - Math.round(factor)); }
    if (t.id === "speed") { L.도루 += Math.round(4 * factor); L.홈런 = Math.max(0, L.홈런 - Math.round(2 * factor)); }
    if (L.타율 != null) { L.안타 = Math.round(L.타수 * L.타율); L.타점 = Math.round(L.홈런 * 2.3 + L.안타 * .22); }
    if (t.id === "velocity") { L.탈삼진 = Math.round(L.탈삼진 * 1.07); L.평균자책점 += .1; }
    if (t.id === "control") { L.평균자책점 = Math.max(1, L.평균자책점 - .15); L.탈삼진 = Math.round(L.탈삼진 * .97); }
    if (t.id === "stamina") { var extra = Math.round(10 * factor); L.탈삼진 = Math.round(L.탈삼진 * (L.이닝 + extra) / Math.max(1, L.이닝)); L.이닝 += extra; L.평균자책점 += .08; }
  };
  function option(label, action, effects, result) { return { 글: label, 선수행동: action, 효과: effects || {}, 결과: result || "선택을 마음에 새기고 다음 날을 준비했다." }; }
  function card(title, text, options, kind, system, art) {
    return { 제목: title, 내용: text, 선택지: options, 선수서사: kind, 시스템: !!system, 그림: art || "hero_pro" };
  }
  function challenge(label, action, chance, success, failure, extra) {
    var o = option(label, null); o.확률결과 = { 확률: I.clamp(chance,.15,.9), 성공: Object.assign({ 선수행동: Object.assign({},action,{성공:true}) },success), 실패: Object.assign({ 선수행동: Object.assign({},action,{성공:false}) },failure) };
    return Object.assign(o,extra || {});
  }
  function route(kind, step, extra) { return Object.assign({ 종류: kind, 다음: step }, extra || {}); }
  P.profileCard = function () {
    return card("어떤 선수로 기억될까", "모든 것을 똑같이 잘할 필요는 없다. 나만의 무기를 정하자. 유형은 시즌 기록과 전용 선택에 영향을 주며, 몇 년 뒤 다른 방향으로 바꿀 수도 있다.",
      R.유형.filter(function (t) { return t.분류 === E.pos().분류; }).map(function (t) { return option(t.이름 + " · " + t.설명, { 종류: "type", 값: t.id }, {}, t.이름 + "의 길을 택했다. " + t.설명); }), "type", true);
  };
  function recordTarget() {
    var p = E.pos();
    if (p.분류 === "투수") return p.역할 === "선발" ? { 키:"승", 값:10, 이름:"시즌 10승" } : p.역할 === "마무리" ? { 키:"세이브", 값:20, 이름:"시즌 20세이브" } : { 키:"홀드", 값:15, 이름:"시즌 15홀드" };
    return type() && type().id === "speed" ? { 키:"도루", 값:20, 이름:"시즌 20도루" } : type() && type().id === "contact" ? { 키:"타율", 값:.28, 이름:"시즌 타율 .280" } : { 키:"홈런", 값:15, 이름:"시즌 15홈런" };
  }
  P.goalCard = function () {
    var s = state(), target = recordTarget(), recovering = s.부상 > 0;
    return card("올해, 내가 이루고 싶은 것", "한 시즌을 모두 잡을 수는 없다. 이번 해 가장 중요하게 지킬 목표를 골라 보자. 시즌 결산에서 결과를 돌아보고, 달성한 경험은 다음 기회에 도움이 된다.", [
      option("꾸준한 출전 기회 확보", {종류:"goal",값:"role",이름:"출전 기회 확보"}, {}, "1군에서 정상 출전량의 85% 이상을 확보하는 것이 목표다. 강팀의 백업 계약은 이 목표에 불리하다."),
      option(target.이름 + "에 도전", {종류:"goal",값:"record",키:target.키,목표치:target.값,이름:target.이름}, {}, target.이름 + "을 목표로 적었다. 시즌 기록으로 결과를 확인한다."),
      option(recovering ? "건강하게 복귀하기" : "부상 없이 시즌 마치기", {종류:"goal",값:recovering?"recover":"health",이름:recovering?"건강하게 복귀":"부상 없는 시즌"}, {}, recovering ? "시즌이 끝날 때 부상을 회복하고 1군에 서는 것을 목표로 삼았다." : "시즌 내내 부상으로 빠지는 카드가 없도록 몸을 챙기기로 했다.")
    ],"goal",true,"manager_pro");
  };
  P.contractCard = function () {
    var s=state(), teams = s.시기 === "프로" ? I.cfg().국내팀 : GD.메이저리그.팀;
    var choices = R.계약.map(function(c,index) {
      var pool=teams.filter(function(n){return n!==s.팀;}), team=pool[((s.연차||0)+index)%pool.length] || s.팀;
      var o=option(team+" · "+c.이름+" · 계약금 "+E.money(c.계약금),{종류:"contract",값:c.id,팀:team},{},c.설명+". 유니폼의 이름이 바뀌었다. 해외 진출이나 재이적을 하면 이 계약 조건은 끝난다.");
      o.안내=c.설명; if(c.id==="short")o.조건={최소:{평균:60}};return o;
    });
    choices.push(option("현재 팀에 남아 경쟁한다",{종류:"contract",값:"stay"},{멘탈:1},"계약 제안을 접었다. 다음 제안은 2년 뒤 다시 검토한다."));
    return card("연봉만으로 고를 수 없는 계약", "같은 선수를 두고도 구단이 바라는 역할은 다르다. 우승에 가까운 벤치, 충분한 출전 기회, 짧지만 큰 보수. 시즌 목표와 함께 생각해 보자. 고액 단기 제안은 평균 능력치 60 이상일 때 받을 수 있다.",choices,"contract",true,"agent");
  };
  P.routeCard = function (kind, step, personId) {
    var s=state(),d=P.init(),t=type(),r=d.진행 || {},chance=.35+(E.avg()-45)/100+(d.목표이력.some(function(g){return g.달성;})?.05:0), rival=E.tpl("{라이벌}");
    if(kind==="role") {
      if(step===0)return card("빈자리 하나, 경쟁자 둘", "감독이 다음 시즌의 한 자리를 두고 경쟁을 예고했다. 훈련 성적뿐 아니라 어떤 역할을 맡을지도 보여 줘야 한다.",[
        option("내 강점으로 경쟁하겠다",route(kind,1,{방식:"special"}),{컨디션:-5},"평가전에 나만의 무기를 보여 주기로 했다."),
        option("팀이 필요한 일을 먼저 맡는다",route(kind,1,{방식:"team"}),{멘탈:2},"눈에 띄지 않는 일부터 해냈다. 코치가 다음 평가전 명단에 네 이름을 적었다.")],kind,false,"manager_pro");
      if(step===1)return card("평가전 전날의 선택", "기회는 가까워졌다. 마지막 준비가 남았다. 지난 면담에서 한 말을 실제 경기에서 보여 줄 때다.",[
        option(t ? t.이름+"의 무기를 점검한다" : "기본기를 점검한다",route(kind,2,{준비:t?"type":"basic"}),{컨디션:-4},"기록만으로 보이지 않는 자신의 역할을 정리했다."),
        option("동료와 호흡을 맞춘다",route(kind,2,{준비:"team"}),{행복도:2},"경쟁자에게도 먼저 말을 걸었다. 코치는 소통하는 모습을 지켜봤다.")],kind,false);
      var boost=(r.준비==="type"&&t? .15: .05)+(r.방식==="team"&&r.준비==="team"?.1:0);
      return card("기회를 결정하는 평가전", "감독이 마지막 평가를 시작한다. 준비한 역할을 보여 주면 앞으로의 출전 기회를 얻을 수 있다.",[
        challenge("준비한 플레이를 보여 준다",route(kind,3),chance+boost,{효과:{인기:3},결과:"감독이 다음 경기 선발 명단을 건넸다. 한 시즌 동안 출전 기회를 더 얻는다."},{효과:{멘탈:-2},결과:"이번 자리는 경쟁자에게 돌아갔다. 남은 숙제는 분명해졌다. 코치와 함께 다음 기회를 준비한다."}),
        option("지금은 백업 역할을 받아들인다",route(kind,3,{성공:false}),{멘탈:2},"무리하게 자리를 요구하지 않았다. 시즌 목표는 현재 역할에 맞춰 다시 생각해 보기로 했다.")],kind,false,"manager_pro");
    }
    if(kind==="rehab") {
      if(step===0)return card("복귀를 서두르는 마음", "부상 이후 감독의 연락과 빈 경기 일정표가 마음을 흔든다. 지금 복귀할지, 회복을 끝까지 마칠지 결정해야 한다.",[
        option("회복 계획을 끝까지 따른다",route(kind,1,{방식:"safe"}),{컨디션:5},"복귀 날짜보다 통증과 움직임을 기록하기 시작했다."),
        option("빠른 복귀를 목표로 강도를 높인다",route(kind,1,{방식:"rush"}),{컨디션:-10},"복귀를 앞당기기로 했다. 몸이 준비됐는지는 다음 검사에서 드러날 것이다.")],kind,false);
      if(step===1)return card("재활실에서 보낸 시간", r.방식==="safe"?"꾸준히 쌓은 기록에 회복의 흔적이 보인다. 마지막에는 무엇을 점검할까?":"움직임은 돌아왔지만 피로가 남았다. 더 밀어붙일지 한발 물러날지 고민된다.",[
        option("통증을 솔직히 말하고 자세를 점검한다",route(kind,2,{준비:"honest"}),{컨디션:8},"몸의 신호를 숨기지 않았다. 코치와 함께 복귀 기준을 다시 세웠다."),
        option("괜찮다고 말하고 실전에 집중한다",route(kind,2,{준비:"push"}),{컨디션:-5},"실전 감각은 돌아왔다. 회복을 충분히 마쳤는지는 아직 확신할 수 없다.")],kind,false);
      return card("복귀전의 첫 공", "관중의 소리보다 자신의 호흡이 크게 들린다. 재활 기간의 선택이 오늘의 몸에 남아 있다.",[
        challenge("준비한 만큼만 뛰어 본다",route(kind,3),r.방식==="safe"&&r.준비==="honest"?.85:.45,{효과:{부상:0,멘탈:4},결과:"통증 없이 경기를 마쳤다. 재활을 함께 버틴 시간이 다시 뛸 자신감이 됐다."},{효과:{부상:3,멘탈:-2},결과:"익숙한 부위에 통증이 돌아왔다. 이번에는 재활 계획을 다시 세워야 한다."}),
        option("조금 더 쉬고 복귀를 미룬다",route(kind,3,{성공:false}),{컨디션:12,멘탈:2},"당장의 출전은 미뤘지만 몸을 속이지 않았다. 다음 기회까지 회복을 이어 간다.")],kind,false);
    }
    if(kind==="rival") {
      if(step===0)return card("라이벌에게 온 연락", rival+"가 개인 훈련을 함께하자고 연락했다. 오래된 경쟁을 어떤 관계로 이어 갈지는 네 선택에 달려 있다.",[
        option("서로의 약점을 함께 고친다",route(kind,1,{친밀:2}),{멘탈:2},"먼저 약점을 털어놓았다. 상대도 자신의 고민을 이야기했다."),
        option("훈련보다 다음 맞대결이 기대된다고 도발한다",route(kind,1,{친밀:-2}),{인기:2},"메시지는 짧게 끝났다. 다음 대결은 두 사람 모두에게 특별해졌다.")],kind,false,"rival");
      if(step===1)return card(d.라이벌친밀>=2?"함께 뛰는 두 라이벌":"기사로 시작된 신경전",d.라이벌친밀>=2?rival+"가 자신만의 훈련 노트를 건넸다. 다음 대결에서 써먹어도 좋다며 웃는다.":"기자가 두 사람의 말을 번갈아 전한다. 야구보다 인터뷰가 먼저 경기가 되어 버렸다.",[
        option(d.라이벌친밀>=2?"서로의 노트를 비교한다":"상대의 실력을 인정한다",route(kind,2,{친밀:1,준비:"respect"}),{멘탈:3},"상대를 알아야 제대로 경쟁할 수 있었다."),
        option("내 기록으로 압도하겠다고 선언한다",route(kind,2,{친밀:-1,준비:"challenge"}),{인기:4,컨디션:-5},"도전장을 던졌다. 다음 경기에서 말의 무게를 견뎌야 한다.")],kind,false,"rival");
      return card("다시 쓰는 라이벌전",rival+"와 마주 섰다. 지금까지 맞대결 "+d.라이벌승+"승 "+d.라이벌패+"패. "+(d.라이벌친밀>=2?"서로의 준비를 아는 만큼 더 진지한 승부가 된다.":"자존심을 건 승부지만 이번 결과도 긴 이야기의 한 장이다."),[
        challenge("내 야구로 답한다",route(kind,3,{맞대결:true}),chance+(r.준비==="respect"?.12:0),{효과:{인기:4,성적:3},결과:"이번에는 네가 웃었다. 라이벌은 다음에는 꼭 이기겠다며 손을 내밀었다."},{효과:{멘탈:-2},결과:"이번 승리는 라이벌에게 돌아갔다. 경기 뒤 복기할 장면이 노트에 남았다."})],kind,false,"rival");
    }
    if(kind==="memory") {
      var h=person(personId || r.인물),name=h?E.heroDef(h.아이디).이름:"그 사람",id=h&&h.아이디;
      if(step===0)return card("비워 둔 저녁", name+"가 이번에는 함께 시간을 보내자고 했다. 바쁜 일정 사이에서 약속 하나를 지킬 수 있을까?",[
        option("그날만큼은 시간을 비워 두겠다고 약속한다",route(kind,1,{인물:id,약속:true}),{},"달력에 날짜를 적었다. "+name+"도 그 저녁을 기다리기로 했다."),
        option("확실하지 않은 약속은 하지 않는다",route(kind,3,{인물:id,약속:false}),{멘탈:1},"지키지 못할 약속을 하기보다 솔직히 말했다. 다른 날 다시 시간을 맞춰 보기로 했다.")],kind,false,id);
      if(step===1)return card("약속했던 그날",name+"와 만나기로 한 날, 추가 훈련 제안이 들어왔다. 기다리는 사람에게 어떻게 답할까?",[
        option("훈련을 마무리하고 약속을 지킨다",route(kind,2,{인물:id,지킴:true}),{컨디션:3},"문을 열자 "+name+"가 먼저 웃었다. 오늘을 위해 비워 둔 시간은 헛되지 않았다."),
        option("연락 없이 훈련장에 남는다",route(kind,2,{인물:id,지킴:false}),{멘탈:1},"늦게 확인한 휴대폰에는 기다렸다는 메시지가 남아 있었다.")],kind,false,id);
      return card("그날을 기억하는 사람", name+(r.지킴?"가 문득 약속했던 저녁을 이야기했다. ‘바쁜데도 와 줬잖아. 그게 생각보다 오래 기억에 남더라.’":"가 조심스럽게 입을 열었다. ‘못 올 수는 있어. 그런데 기다리게 하지는 말아 줬으면 좋겠어.’"),[
        option(r.지킴?"함께한 시간이 나에게도 소중했다고 말한다":"변명하지 않고 사과한다",route(kind,3,{인물:id,회상:true}),{행복도:r.지킴?4:0},r.지킴?"두 사람만 아는 기억이 하나 더 생겼다.":"사과 한마디로 모두 돌아오지는 않는다. 다음 약속에서는 행동으로 보여 주기로 했다."),
        option("야구가 우선이라고 말한다",route(kind,3,{인물:id,회상:true,무심:true}),{멘탈:1},"서로 무엇을 기대하는지 조금 더 분명해졌다.")],kind,false,id);
    }
    return null;
  };

  function scope() { var s=state(); return s.시기+":"+s.나이; }
  P.specialCard = function () {
    var t=type(), texts={power:["장타가 필요한 마지막 타석","초구부터 장타를 노린다"],contact:["끈질긴 승부가 필요한 타석","파울로 버티며 실투를 기다린다"],speed:["한 베이스의 차이","상대의 빈틈을 노려 다음 베이스로 뛴다"],velocity:["타자의 방망이가 빨라졌다","몸쪽 강속구로 정면 승부한다"],control:["풀카운트, 한 공의 선택","가장 자신 있는 코스에 던진다"],stamina:["불펜이 지쳐 있는 날","한 이닝을 더 책임진다"]};
    if(!t)return null;
    var pair=texts[t.id];
    return card(pair[0],"벤치가 너의 무기를 필요로 한다. 무리하면 몸이 힘들지만, 성공하면 팀 안에서 역할이 더 분명해진다.",[
      challenge(pair[1],{종류:"special"},.4+(E.avg()-45)/100,{효과:{인기:3,컨디션:-5},결과:"자신만의 무기로 경기를 풀었다. 이번 시즌 출전 기회가 조금 더 늘어난다."},{효과:{멘탈:-2,컨디션:-5},결과:"이번에는 뜻대로 되지 않았다. 무기를 다듬기 위한 숙제가 남았다."}),
      option("동료에게 맡기고 다음 기회를 준비한다",{종류:"special"},{컨디션:3},"오늘은 동료를 믿었다. 오래 뛰기 위해 힘을 아끼는 것도 선택이다.")],"special",false);
  };
  // 그리기와 저장 복원은 시간을 진행시키지 않습니다. 일반 카드 선택 때만 간격을 셉니다.
  P.card = function () {
    var s=state(),d=P.init();
    if(["고등학교","대학","프로","메이저리그"].indexOf(s.시기)<0)return null;
    if(!type() || (pro() && s.나이>=d.유형변경나이))return P.profileCard();
    if(!pro())return null;
    if(!P.contract() && playing() && s.나이>=d.다음제안 && (s.시기==="메이저리그" || s.연차>=4))return P.contractCard();
    if(!d.목표 || d.목표.scope!==scope())return P.goalCard();
    if(d.일반턴-d.마지막서사<R.서사간격)return null;
    var r=d.진행;
    if(r && r.종류==="memory" && !available(person(r.인물))) { d.진행=null; r=null; }
    if(r)return P.routeCard(r.종류,r.단계,r.인물);
    if(s.부상>0 && d.완료.rehab==null)return P.routeCard("rehab",0);
    if(d.완료.role==null)return P.routeCard("role",0);
    if(d.완료.rival==null)return P.routeCard("rival",0);
    var h=people().find(function(h){return available(h) && d.완료["memory:"+h.아이디]==null;});
    if(h)return P.routeCard("memory",0,h.아이디);
    if(playing() && d.일반턴-(d.특기턴==null?-10:d.특기턴)>=8)return P.specialCard();
    if(d.일반턴-d.완료.rival>=16)return P.routeCard("rival",0);
    return null;
  };
  function affection(h,amount,res) {
    if(!h)return;
    h.애정도=I.clamp(h.애정도+amount,0,100);
    res.알림.push(E.heroDef(h.아이디).이름+" · "+(h.관계==="만남"?"호감":"애정")+" "+(amount>0?"+":"")+amount);
  }
  P.onChoose = function(c,out,res) {
    var s=state(),d=P.init(),a=out.선수행동;
    if(!c.시스템)d.일반턴++;
    if(!a) {
      // 예전 학창 시절 카드도 같은 라이벌 관계에 기록합니다.
      if(c.그림==="rival") {
        var friendly=/손을|관찰|축하|인사를|병문안|술잔|격려/.test(out.글||"");
        var hostile=/도발|소리친다/.test(out.글||"");
        d.라이벌친밀=I.clamp(d.라이벌친밀+(friendly?1:hostile?-1:0),-5,5);
        if(res.성공!=null){if(res.성공)d.라이벌승++;else d.라이벌패++;}
      }
      return;
    }
    if(a.종류==="type") {
      var t=R.유형.find(function(t){return t.id===a.값&&t.분류===E.pos().분류;});
      if(t){d.유형=t.id;d.유형변경나이=s.나이+R.유형재선택간격;note(t.이름+"의 길을 선택했다");}return;
    }
    if(a.종류==="goal") { d.목표=Object.assign({},a,{scope:scope(),나이:s.나이,시기:s.시기});return; }
    if(a.종류==="contract") {
      if(a.값==="stay"){d.다음제안=s.나이+2;return;}
      var offer=R.계약.find(function(x){return x.id===a.값;});
      if(!offer)return;
      if(s.시기==="프로" && s.팀!==a.팀)s.팀이동++;
      s.팀=a.팀;if(s.시기==="프로")s.국내팀=s.팀;else s.해외팀=s.팀;
      d.계약=Object.assign({},offer,{팀:s.팀,시기:s.시기,끝나이:s.나이+offer.기간});
      d.다음제안=d.계약.끝나이;
      E.applyEffects({돈:offer.계약금},res.효과);
      note(s.팀+" · "+offer.이름+" ("+offer.기간+"년)");return;
    }
    d.마지막서사=d.일반턴;
    if(a.종류==="special") {
      d.특기턴=d.일반턴;
      if(a.성공)d.기회={팀:s.팀,시기:s.시기,나이:s.나이};return;
    }
    var r=Object.assign({},d.진행||{},a,{단계:a.다음});
    if(a.친밀)d.라이벌친밀=I.clamp(d.라이벌친밀+a.친밀,-5,5);
    if(a.맞대결){if(a.성공)d.라이벌승++;else d.라이벌패++;note("라이벌전 "+(a.성공?"승리":"패배")+" · 통산 "+d.라이벌승+"승 "+d.라이벌패+"패");}
    if(a.종류==="memory") {
      var h=person(a.인물);
      if(a.지킴!=null && h){
        d.기억[a.인물]={지킴:a.지킴,나이:s.나이};
        affection(h,a.지킴?8:-8,res);
        if(a.지킴 && h.관계==="만남")h.교류횟수=(h.교류횟수||0)+1;
        note(E.heroDef(a.인물).이름+"와의 약속을 "+(a.지킴?"지켰다":"지키지 못했다"));
      }
      if(a.회상)affection(h,a.무심?-4:r.지킴?3:2,res);
    }
    if(a.다음>=3) {
      d.완료[a.종류+(a.종류==="memory"?":"+a.인물:"")]=d.일반턴;d.진행=null;
      if(a.종류==="role" && a.성공){
        if(s.시기==="프로")s.일군=true;else s.플래그.빅리거=true;
        d.기회={팀:s.팀,시기:s.시기,나이:s.나이};
        res.알림.push("이번 시즌 출전량 +15%p");note("평가전에서 출전 기회를 얻었다");
      }
    } else d.진행=r;
  };
  P.endYear = function(L,partial) {
    var s=state(),d=P.init(),g=d.목표,lines=[],c=P.contract();
    if(g && g.scope===scope() && !g.결산) {
      g.결산=true;
      var ok=g.값==="role"?!!L&&L.출전비율>=.85:g.값==="record"?!!L&&(L[g.키]||0)>=g.목표치:g.값==="recover"?!!L&&s.부상===0:s.올해부상카드===0&&s.부상===0;
      g.달성=!partial&&ok;g.결과=partial?"무대 이동으로 종료":ok?"달성":"미달성";
      d.목표이력.push(Object.assign({},g));
      lines.push("시즌 목표 · "+g.이름+" — "+g.결과);
      if(g.달성){var reward={};E.applyEffects({행복도:3,인기:2},reward);lines.push("목표 달성: 행복 +"+(reward.행복도||0)+" · 인기 +"+(reward.인기||0)+". 다음 평가전의 자신감이 되었다.");}
      note(g.이름+" · "+g.결과);
    }
    if(c && L && !partial && d.우승결산!==scope()) {
      d.우승결산=scope();
      if(I.rnd()<c.우승){
        var title=L.메이저?"월드시리즈 우승":"통합 우승";
        I.addAward(title,L.연도);lines.push(s.팀+" · "+title);note(s.팀+"에서 "+title);
      }
    }
    if(c)lines.push(c.이름+" · 계약 "+Math.max(0,c.끝나이-s.나이-1)+"년 남음");
    return lines;
  };
  P.stage = function(prev,next) {
    var d=P.init();if(prev===next)return;
    d.진행=null;d.계약=null;d.기회=null;
    // 국내 복귀 후 이전 계약의 만료 나이에 묶이지 않습니다.
    d.다음제안=Math.max(25,state().나이);
  };
  P.eligible = function(c) { return c.제목!=="다년 계약 제안" || !P.contract(); };
  P.summary = function () {
    var s=state(),d=P.init(),t=type(),c=P.contract(),lines=[];
    if(t)lines.push("선수 유형 · "+t.이름+"\n"+t.설명+"\n"+d.유형변경나이+"세부터 방향을 다시 정할 수 있습니다.");
    if(d.목표)lines.push("이번 시즌 목표 · "+d.목표.이름+(d.목표.결산?" · "+d.목표.결과:" · 진행 중"));
    if(d.진행)lines.push("이어지는 이야기 · "+({role:"주전 경쟁",rehab:"부상과 복귀",rival:"라이벌",memory:"인연의 약속"}[d.진행.종류])+" · "+d.진행.단계+"/3\n다음 사건은 다른 카드 사이에 이어집니다.");
    lines.push(E.tpl("{라이벌}")+" · "+(d.라이벌친밀>=2?"서로를 인정하는 경쟁자":d.라이벌친밀<=-2?"날 선 경쟁 관계":"승부를 통해 알아가는 중")+"\n맞대결 "+d.라이벌승+"승 "+d.라이벌패+"패");
    if(c)lines.push(c.팀+" · "+c.이름+"\n"+c.설명+"\n"+(c.끝나이-s.나이)+"시즌 남음 · 시즌 팀 우승 확률 "+Math.round(c.우승*100)+"%");
    Object.keys(d.기억).forEach(function(id){var m=d.기억[id];lines.push(E.heroDef(id).이름+"와의 기억 · "+m.나이+"세\n"+(m.지킴?"바쁜 일정에도 약속을 지켜 주었던 저녁":"연락 없이 약속 장소에 나오지 않았던 날"));});
    d.목표이력.slice(-3).forEach(function(g){lines.push(g.나이+"세 · "+g.이름+" · "+g.결과);});
    return lines;
  };
})();
