const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),H=require('./helpers/browser');
const out=process.argv[2]||path.join(require('node:os').tmpdir(),'new-mini-art');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge'});try{
 for(const width of [320,390,1280]){
  const p=await browser.newPage({viewport:{width,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(await H.url());await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()));
  async function start(name){await p.evaluate(name=>{Math.random=()=>.5;window.results=[];window.cancelGame=U[name](r=>results.push(r));window.saved=JSON.stringify(localStorage);},name);await p.clock.runFor(720);await p.evaluate(async()=>{const images=['hit','throw'].map(key=>{const i=new Image();i.src='images/minigames/result-'+key+'.png';return i.decode();});await Promise.all(images);});}
  async function play(name,level){
   if(name==='miniFly'){const final=.76+.05*Math.sin(3.2*2.3+Math.PI),offset=level===3?0:level===2?.06:.25,hold=Math.round((final+offset-.5)/.5*1000);await p.keyboard.down('ArrowRight');await p.clock.runFor(hold);await p.keyboard.up('ArrowRight');await p.clock.runFor(3220-hold);}
   else if(name==='miniBunt'){await p.keyboard.down('Space');await p.clock.runFor(Math.round((.525+(level===3?0:level===2?.06:.24))*1500));await p.keyboard.up('Space');}
   else{
    if(name==='miniDiscipline')await p.clock.runFor(670);
    for(let i=0;i<3;i++){
     const correct=await p.evaluate(name=>name==='miniDiscipline'?(parseFloat(document.querySelector('.eye-ball').style.left)>30&&parseFloat(document.querySelector('.eye-ball').style.left)<70?0:1):({0:0,1:1,3:2}[document.querySelectorAll('.defense-base.occupied').length]),name);
     await p.keyboard.press(String((i<level?correct:(correct+1)%(name==='miniDiscipline'?2:3))+1));
     if(i<2){assert.equal(await p.locator('.baseball-result-art').count(),0,'no cut-in during unanswered rounds');await p.clock.runFor(name==='miniDiscipline'?1190:540);}
    }
   }
  }
  for(const [name,key] of [['miniFly','throw'],['miniBunt','hit'],['miniDiscipline','hit'],['miniDefense','throw']]){
   for(const grade of [3,2,0]){
    await start(name);await play(name,grade);
    if(!grade){assert.equal(await p.locator('.baseball-result-art').count(),0);await p.clock.runFor(2300);continue;}
    const art=p.locator('.baseball-result-art');assert.equal(await art.count(),1,name+' immediate');assert.equal(await art.getAttribute('data-scene'),key);assert.equal(await p.evaluate(()=>results.length),0);
    const a=await art.boundingBox(),f=await p.locator('.mgf').boundingBox();assert.ok(a.x>=f.x&&a.y>=f.y&&a.x+a.width<=f.x+f.width&&a.y+a.height<=f.y+f.height);
    if(width===390&&grade===3)await p.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
    await p.clock.runFor(280);assert.equal(await art.count(),1);await p.clock.runFor(50);assert.equal(await art.count(),0);
    await p.clock.runFor(270);assert.equal(await art.count(),0,'final result must not replay art');assert.equal(await p.evaluate(()=>results.length),0);
    await p.clock.runFor(1800);assert.deepEqual(await p.evaluate(()=>results.map(r=>r.확률)),[grade===3?.95:.7]);assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)===saved),true);
   }
   await start(name);await play(name,3);await p.evaluate(()=>cancelGame());await p.clock.runFor(3000);assert.equal(await p.locator('.baseball-result-art').count(),0);assert.equal(await p.evaluate(()=>results.length),0);
   await start(name);await p.evaluate(()=>document.documentElement.dataset.reducedMotion='true');await play(name,3);assert.equal(await p.locator('.baseball-result-art').count(),0);await p.clock.runFor(2300);assert.equal(await p.evaluate(()=>results.length),1);await p.evaluate(()=>document.documentElement.dataset.reducedMotion='false');
  }
  assert.deepEqual(errors,[]);await p.close();
 }
 console.log('PASS: four new games, good/perfect cut-ins immediately after action; no mid-round/failed/duplicate cut-ins; 320ms, unchanged results/save, cancel/reduced-motion; 320/390/1280px; '+out);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
