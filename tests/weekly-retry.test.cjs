const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto').webcrypto;
const rewards=require('../weekly-rewards.js');
async function main(){
  const elements=new Map(),storage=new Map(),calls=[],unlocked=new Set();let language='sv',failStart=false,holdStart=false,holdSubmit=false,held=null,sequence=0,gameStarts=0;
  class Element{
    constructor(){this.events={};this.hidden=false;this.disabled=false;this.value='';this.textContent='';}
    set id(id){this._id=id;elements.set(id,this);}get id(){return this._id;}
    set innerHTML(html){for(const match of html.matchAll(/id="([^"]+)"/g)){const el=new Element();el.id=match[1];}}
    append(){}before(){}after(){}setAttribute(){}replaceChildren(){}
    addEventListener(event,handler){this.events[event]=handler;}
  }
  for(const id of ['weeklyStatus','weeklyHSContent','weeklyBtnStatus','weeklyTitle','weeklyIntro','goStats','weeklyPublishBox','btnGoMenu','btnGoWeekly','btnHSWeekly']){const el=new Element();el.id=id;}
  const challenge=()=>({id:'2026-W42',week:42,year:2026,rules:{ops:['+'],range:20,tables:[],speed:'none',wallWrap:true}});
  const response=(data,ok=true)=>({ok,json:async()=>data});
  const context=vm.createContext({crypto,WeeklyRewards:rewards,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    window:{SIFFER_WEEKLY_API:'https://mock.invalid'},document:{createElement:()=>new Element()},$:id=>elements.get(id),console,
    pickLangText:(sv,en,de=en)=>({sv,en,de}[language]),loadPlayer:()=> 'TestPlayer',getOperationLabel:o=>o,
    COLS:21,ROWS:16,PERF_STRESS_LENGTH:0,state:'menu',activeOps:new Set(['-']),numRange:100,tables:new Set([2,3]),speedMode:'length',wallWrap:false,practiceMode:true,mysteryEventsEnabled:true,portalEventsEnabled:true,bonusLivesEnabled:true,
    snake:[{},{},{},{}],score:0,sessionCorrect:0,sessionTotal:0,
    requestAnimationFrame:fn=>{queueMicrotask(()=>fn(0));return 1;},AbortSignal:{timeout:()=>({})},
    unlockSkin:id=>unlocked.add(id),PrivacyInfo:{open(){}},goToWeekly(){},
    fetch:async(url,options)=>{
      const action=new URL(url).searchParams.get('action'),body=options.body?JSON.parse(options.body):null;calls.push({action,body});
      if(action==='challenge')return response(challenge());if(action==='leaderboard')return response({scores:[],lengths:[]});
      if(action==='start'){
        if(failStart){failStart=false;return response({error:'Mock offline'},false);}
        const data={token:(++sequence).toString(16).padStart(64,'0'),challenge:challenge()};
        if(holdStart){holdStart=false;return new Promise(resolve=>{held=()=>resolve(response(data));});}return response(data);
      }
      if(action==='submit'){if(holdSubmit){holdSubmit=false;return new Promise(resolve=>{held=()=>resolve(response({ok:true}));});}return response({ok:true});}
      throw Error('Unexpected request');
    }
  });
  context.startGame=()=>{gameStarts++;context.state='playing';context.score=0;context.snake=[{},{},{},{}];context.sessionCorrect=context.sessionTotal=0;};
  context.goToMenu=()=>{vm.runInContext('WeeklyChallenge.restore()',context);context.state='menu';};
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../weekly-challenge.js'),'utf8'),context);
  const run=code=>vm.runInContext(code,context),click=id=>elements.get(id).events.click();await run('WeeklyChallenge.load()');
  for(const [lang,hint,label] of [['sv','hela veckan','Försök igen'],['en','all week','Try again'],['de','ganze Woche','Erneut versuchen']]){language=lang;run('WeeklyChallenge.labels()');assert.ok(elements.get('weeklyAttemptsHint').textContent.includes(hint));assert.equal(elements.get('btnWeeklyRetry').textContent,label);}
  language='sv';context.state='gameover';run('WeeklyChallenge.finish()');assert.equal(elements.get('btnWeeklyRetry').hidden,true,'No retry button in ordinary rounds');
  await click('btnWeeklyStart');assert.equal(gameStarts,1);assert.equal(context.state,'playing');
  function finish(score,length){context.score=score;context.snake=Array.from({length},()=>({}));context.sessionCorrect=20;context.sessionTotal=22;context.state='gameover';run('WeeklyChallenge.finish()');}
  finish(1700,20);assert.equal(elements.get('btnWeeklyRetry').hidden,false);
  const before=calls.filter(c=>c.action==='start').length,p1=click('btnWeeklyRetry'),p2=click('btnWeeklyRetry');await Promise.all([p1,p2]);
  assert.equal(calls.filter(c=>c.action==='start').length,before+1,'Double click sends one start');assert.equal(gameStarts,2);assert.equal(context.score,0);assert.equal(context.snake.length,4);
  assert.equal(elements.get('weeklyPublishBox').hidden,true);assert.equal(elements.get('btnWeeklyRetry').hidden,true);
  assert.equal(calls.filter(c=>c.action==='submit').length,0,'Retry never automatically publishes a name/result');
  finish(200,6);failStart=true;await click('btnWeeklyRetry');assert.equal(context.state,'gameover');assert.ok(elements.get('weeklyRetryStatus').textContent.includes('Mock offline'));assert.equal(elements.get('btnWeeklyRetry').disabled,false);
  elements.get('weeklyName').value='TestSnake';await click('btnPublishWeekly');const published=calls.find(c=>c.action==='submit').body;
  assert.equal(published.token,'2'.padStart(64,'0'));assert.equal(published.score,200);assert.equal(published.length,6,'New round does not carry old maximum length');
  assert.equal(context.state,'menu');assert.deepEqual([...context.activeOps],['-']);assert.equal(context.numRange,100);assert.equal(context.speedMode,'length');assert.equal(context.wallWrap,false);assert.equal(context.practiceMode,true);assert.equal(context.mysteryEventsEnabled,true);
  await click('btnWeeklyStart');finish(1500,12);holdStart=true;const late=click('btnWeeklyRetry');await Promise.resolve();context.goToMenu();held();await late;
  assert.equal(context.state,'menu');assert.equal(gameStarts,3,'Leaving while waiting cancels late retry');
  await click('btnWeeklyStart');finish(1100,10);holdSubmit=true;elements.get('weeklyName').value='TestSnake';const submit=click('btnPublishWeekly');await Promise.resolve();const count=calls.filter(c=>c.action==='start').length;
  assert.equal(elements.get('btnWeeklyRetry').disabled,true);await click('btnWeeklyRetry');assert.equal(calls.filter(c=>c.action==='start').length,count,'Retry cannot race a publication');
  context.goToMenu();held();await submit;assert.equal(context.state,'menu');assert.equal(elements.get('btnWeeklyStart').disabled,false);
  assert.equal(rewards.createTracker(context.localStorage).weeks().length,1,'Retries never earn several weeks');
  console.log('PASS: three-language hints/retry, fresh tokens, score/length reset, duplicate-click guard, optional publication, retry failure retains old result, preference restoration, canceled late starts and publication/retry isolation.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
