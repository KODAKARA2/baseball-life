const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const root=path.join(__dirname,'..'),out=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'baseball-roster-'));
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'msedge'});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.join(root,'index.html')).href);
    async function candidateScreen(stage){await page.evaluate(stage=>{U.closeModals();E.newGame('강민준','유격수','수비',{외모:5});const s=E.state();s.시기=stage;s.나이=s.진입나이=stage==='고등학교'?17:25;s.일군=true;s.팀=stage==='메이저리그'?'뉴욕 타이탄스':'서울 블루호크스';s.총턴=100;s.시기턴=1;s.대기열=[];s.다음자유나이=s.나이;s.자유시간={화면:'찾기'};E.next();U.showGame();},stage);}
    async function loadedImages(){await page.waitForFunction(()=>[...document.querySelectorAll('#app img')].every(i=>i.complete&&i.naturalWidth>0));}
    for(const [stage,names]of [['고등학교',['한지우','서미래','윤채아','강민서','백소율']],['프로',['오하린','정예린']],['메이저리그',['에밀리 워커','제이든 박']]]){
      for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});await candidateScreen(stage);await page.waitForTimeout(800);const text=await page.locator('#actions').innerText();for(const name of names)assert.ok(!text.includes(name));assert.match(text,/새 인연을 찾아본다/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
    }
    await page.setViewportSize({width:390,height:844});await candidateScreen('고등학교');await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'school-candidates.png'),fullPage:true,animations:'disabled'});
    await page.evaluate(()=>{E.state().외모=10;Math.random=()=>0.4;});
    await page.locator('#actions button').filter({hasText:'새 인연을 찾아본다'}).click();await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>E.state().히로인.관계),'만남');assert.equal(await page.evaluate(()=>E.state().히로인.교류횟수),0);
    await page.reload();assert.equal(await page.evaluate(()=>E.state()?.히로인?.아이디||JSON.parse(localStorage.getItem('baseball-life-save-v1')).히로인.아이디),'heroine7');
    for(let n=7;n<=15;n++){
      await page.evaluate(id=>{U.closeModals();E.newGame('강민준','유격수','수비',{외모:5});const h=E.heroDef(id),s=E.state();s.시기=h.만나는시기[0];s.나이=s.진입나이=s.시기==='고등학교'?17:25;s.일군=true;s.총턴=100;s.대기열=[];s.현재카드=E._internal.CARDS().find(c=>c._만남===id);s.단계='카드';E.refreshOptions();U.showGame();},'heroine'+n);
      await loadedImages();await page.waitForTimeout(800);assert.ok(await page.locator('#app img[src="images/heroine'+n+'.png"]').count());
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.screenshot({path:path.join(out,'heroine'+n+'-meet.png'),fullPage:true,animations:'disabled'});
    }
    // 관계 카드와 결혼 결과가 첫 만남 그림으로 되돌아가지 않는지 확인합니다.
    for(let n=7;n<=15;n++){
      for(const [rel,suffix] of [['연인','lover'],['배우자','wife']]){
        await page.evaluate(({id,rel})=>{
          E.newGame('강민준','유격수','수비',{외모:5});
          const s=E.state();s.시기=E.heroDef(id).만나는시기[0];s.나이=s.진입나이=30;
          E._internal.attachHeroine(id);s.히로인.관계=rel;
          s.현재카드=E._internal.CARDS().find(c=>c.히로인===id&&[].concat(c.조건?.관계).includes(rel));
          s.단계='카드';s.결과=null;E.refreshOptions();U.showGame();
        },{id:'heroine'+n,rel});
        await loadedImages();assert.ok(await page.locator('#app img[src="images/heroine'+n+'_'+suffix+'.png"]').count());
      }
      await page.evaluate(id=>{const h=E.heroDef(id);document.querySelector('#table').innerHTML=U.resultHTML({효과:{},결과:'함께할 내일을 약속했다.',결혼그림:{키:[h.그림.결혼,h.그림.만남],이름:h.이름}});},'heroine'+n);
      await loadedImages();assert.ok(await page.locator('#table img[src="images/heroine'+n+'_wedding.png"]').count());
      if(n===14)await page.screenshot({path:path.join(out,'emily-wedding-result.png'),fullPage:true,animations:'disabled'});
    }
    await page.setViewportSize({width:1120,height:900});
    await page.goto(pathToFileURL(path.join(root,'assets/fine-pixel/index.html')).href+'?group='+encodeURIComponent('신규'));
    await page.locator('#gallery img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
    await page.waitForFunction(()=>[...document.querySelectorAll('#gallery img')].every(i=>i.complete&&i.naturalWidth===1024));
    assert.equal(await page.locator('#gallery figure').count(),36);
    await page.screenshot({path:path.join(out,'new-heroines-gallery.png'),fullPage:true});
    await page.setViewportSize({width:320,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(errors,[]);console.log('PASS: 9명 첫 만남 그림 로딩·선택·재시작 저장 / 3시기 후보 / 320·390·1280px / 갤러리 36장');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
