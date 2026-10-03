// Run with: node tests/negative-numbers.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function source(name){
  const match=html.match(new RegExp('function '+name+'\\([^]*?\\n}'));
  assert.ok(match,`${name} exists`);
  return match[0];
}
let seed=71341;
const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const elements=new Map();
const element=id=>{
  if(!elements.has(id))elements.set(id,{textContent:'',style:{},classList:{toggle(){}},addEventListener(){}});
  return elements.get(id);
};
const storage=new Map();
const context=vm.createContext({
  SnakeStyles:require('../snake-styles.js'),
  Math:math, window:{}, currentLang:'sv',
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  document:{getElementById:element,querySelectorAll:()=>[]},
  activeOps:new Set(['+','-']), numRange:20, tables:new Set([2,5,10]), wrongPool:[],
  speedMode:'none', wallWrap:true, multiTableSelect:false, musicGenre:'original',
  mysteryEventsEnabled:true, portalEventsEnabled:true, bonusLivesEnabled:true,graphicsMode:'classic',
  SETTINGS_KEY:'settings',MAX_WRONG_POOL:20,MYSTERY_RANGE_BOOST:{common:.8,uncommon:.92,rare:1.04,epic:1.14,legendary:1.24},
  loadPlayer:()=> 'Test',loadHistory:()=>[],getTotalGamesPlayed:()=>0,saveHistory(){},loadStats:()=>({}),saveStats(){},checkGameCountMedals(){},
  getPlayer:()=> 'Test',loadHS:()=>[],saveHS(){},score:0,snake:[],practiceMode:false,sessionTotal:0,sessionCorrect:0,sessionOpStats:{},sessionWrongMap:{},
  getTablesShortLabel:()=> 'Tabeller',getSpeed:()=>255,setTextIfChanged:(el,text)=>{el.textContent=text;},isCalmRound:()=>false
});
vm.runInContext(fs.readFileSync(path.join(root,'translations.js'),'utf8'),context);
vm.runInContext("const STRINGS=window.SIFFERSNOKEN_TRANSLATIONS;const $=id=>document.getElementById(id);const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;function getLang(){return currentLang;}\n"+
  ['getLangFallback','t','pickLangText','getRangeLabel','getOperationLabel','getPracticeRangeLabel','formatSignedOperand','genSignedProblem','genFreshProblem','genProblem','genWrongs','addToWrongPool','removeFromWrongPool','genMysteryProblemForOp','shuffle','createMysteryPrompt','saveSettings','loadSettings','getHSDesc','updateRangeHint','syncOperationButtons','updateMenuSettingsSummary','recordSession','esc','renderStatsTeacherPage','updateHUD'].map(source).join('\n'),context);

const seen=new Set();
function verify(p,max){
  assert.equal(p.category,'signed');
  assert.ok(['+','-'].includes(p.op));
  const match=p.expr.replaceAll('−','-').match(/^(-?\d+) ([+-]) (\d+)$/);
  assert.ok(match,`Clear signed expression: ${p.expr}`);
  const a=Number(match[1]),b=Number(match[3]);
  assert.equal(match[2],p.op);
  assert.equal(p.answer,p.op==='+'?a+b:a-b);
  assert.ok(Math.abs(a)<=max&&Math.abs(b)<=max&&Math.abs(p.answer)<=max);
  assert.ok(a<0||p.answer<0,'Negative starting number or answer required');
  assert.ok(b>0,'Beginner category only adds or subtracts a positive second operand');
  assert.ok(!/[()]/.test(p.expr),'No parenthesized negative operands');
  seen.add(`${p.op}:${Math.sign(a)}:${Math.sign(b)}`);
  seen.add(`answer:${Math.sign(p.answer)}`);
  return {a,b};
}
for(const max of [10,20,100,1000]){
  context.numRange=max;context.activeOps=new Set(['signed']);
  for(let i=0;i<5000;i++){
    const p=context.genFreshProblem();verify(p,max);
    const wrongs=Array.from(context.genWrongs(p.answer,true));
    assert.equal(wrongs.length,3);assert.equal(new Set(wrongs).size,3);
    assert.ok(wrongs.every(w=>Number.isInteger(w)&&w!==p.answer));
  }
  for(const rarity of ['common','uncommon','rare','epic','legendary']){
    for(let i=0;i<30;i++){
      const prompt=context.createMysteryPrompt({rarity});verify(prompt.problem,max);
      assert.equal(prompt.op,prompt.problem.op,'Museum reward uses real +/- operator');
      assert.equal(new Set(prompt.choices).size,4);
      assert.equal(prompt.choices.filter(v=>v===prompt.problem.answer).length,1);
    }
  }
}
for(const op of ['+','-']){
  assert.ok(seen.has(`${op}:-1:1`),'Both warmer and colder changes from a negative starting number');
}
assert.ok(seen.has('-:1:1'),'Subtraction crossing zero is included');
assert.ok(seen.has('-:0:1'),'Subtraction from zero is included');
for(const sign of [-1,0,1])assert.ok(seen.has(`answer:${sign}`));
context.numRange=20;context.activeOps=new Set(['+','-','*','/','signed']);
const categories=new Set();
for(let i=0;i<3000;i++){
  const p=context.genFreshProblem();categories.add(p.category||p.op);
  if(p.category==='signed')verify(p,20);
  else assert.ok(p.answer>=0,'Existing ordinary categories remain nonnegative');
}
assert.deepEqual([...categories].sort(),['*','+','-','/','signed'].sort());
context.activeOps=new Set(['+','-']);
for(let i=0;i<500;i++)assert.equal(context.genFreshProblem().category,undefined,'Defaults do not add signed questions');
assert.ok(Array.from(context.genWrongs(0,false)).every(w=>w>=0));
assert.ok(Array.from(context.genWrongs(-10)).every(w=>w<0),'Signed distractors do not give away a negative answer');
const savedRandom=math.random;math.random=()=>.99;
verify(context.genSignedProblem(10),10);math.random=()=>0;
verify(context.genSignedProblem(10),10);
assert.equal(context.genWrongs(-10,true).length,3,'Bounded fallback returns three distinct choices');
math.random=savedRandom;
// The user's temperature/tallinje examples, through the actual generator.
for(const [a,op,b,answer,expr] of [[-8,'+',8,0,'−8 + 8'],[-8,'-',8,-16,'−8 − 8'],[3,'-',8,-5,'3 − 8']]){
  const draws=[op==='+'?.25:.75,(a+20+.5)/41,(b-.5)/20];
  math.random=()=>draws.length?draws.shift():savedRandom();
  const p=context.genSignedProblem(20);verify(p,20);
  assert.equal(p.expr,expr);assert.equal(p.answer,answer);
}
math.random=savedRandom;
context.wrongPool=[];const repeat=context.genSignedProblem(20);
context.addToWrongPool(repeat);context.addToWrongPool(repeat);assert.equal(context.wrongPool.length,1);
math.random=()=>0;assert.equal(context.genProblem().category,'signed','Repeat questions keep signed metadata');math.random=savedRandom;
context.removeFromWrongPool(repeat.expr);assert.equal(context.wrongPool.length,0);

context.activeOps=new Set(['signed']);context.saveSettings();
context.activeOps=new Set(['+','-']);context.loadSettings();assert.deepEqual([...context.activeOps],['signed']);
storage.set('settings',JSON.stringify({ops:['+','-'],numRange:10}));context.loadSettings();assert.deepEqual([...context.activeOps],['+','-']);
storage.set('settings',JSON.stringify({ops:['unknown','signed']}));context.loadSettings();assert.deepEqual([...context.activeOps],['signed']);
storage.set('settings',JSON.stringify({ops:['unknown']}));context.loadSettings();assert.deepEqual([...context.activeOps],['signed'],'Invalid selection does not empty settings');
storage.set('settings','broken');assert.doesNotThrow(()=>context.loadSettings());
context.numRange=20;
for(const lang of ['sv','en','de']){
  context.currentLang=lang;
  assert.notEqual(context.getOperationLabel('signed'),'signedOpLabel');
  assert.equal(context.getOperationLabel('signed',true),'±');
  assert.ok(context.getHSDesc({ops:['signed'],range:20}).includes('−20 … 20'));
  assert.ok(!context.getHSDesc({ops:['+','-'],range:20}).includes('−20'));
  context.updateRangeHint();assert.ok(element('rangeHint').textContent.includes('−20'));
  assert.ok(!element('rangeHint').textContent.includes('(−'),'Translated beginner examples have no double signs');
  assert.ok(!/[{}]/.test(element('rangeHint').textContent));
  context.updateMenuSettingsSummary();assert.ok(!element('menuSettingsSummary').textContent.includes('undefined'));
}
context.state='playing';context.problem=context.genSignedProblem(20);context.lives=3;context.combo=0;context.goldPhase=false;
context._hudCache={score:'',level:'',eq:'',combo:'',livesKey:'lives:3'};
context.updateHUD();assert.equal(element('levelDisp').textContent,'±');assert.ok(element('eqText').textContent.endsWith(' = ?'));

// Saved signed statistics appear as their own category; old sessions still work.
context.currentLang='sv';context.loadHistory=()=>[
  {date:'2026-10-01',time:'12:00',player:'Test',score:100,correct:8,total:10,selectedOps:['signed'],numRange:20,ops:{signed:{correct:8,total:10}},wrongMap:{'3 − 8':2}},
  {date:'2026-09-30',time:'12:00',score:50,correct:5,total:8,ops:{'+':{correct:5,total:8}},wrongExprs:[]}
];
context.renderStatsTeacherPage();
assert.ok(element('statsPageContent').innerHTML.includes('Negativa tal (+/−)'));
assert.ok(element('statsPageContent').innerHTML.includes('8/10'));
assert.ok(element('statsPageContent').innerHTML.includes('−20 … 20'));
assert.ok(!element('statsPageContent').innerHTML.includes('undefined'));
let history=[];context.loadHistory=()=>history;
context.sessionTotal=3;context.sessionCorrect=2;context.sessionOpStats={signed:{correct:2,total:3}};
context.sessionWrongMap={'3 − 8':1};context.activeOps=new Set(['signed','+']);
context.saveHistory=entries=>{history=entries;};context.recordSession();
assert.deepEqual(Array.from(history[0].selectedOps),['signed','+']);
assert.equal(history[0].ops.signed.total,3);
assert.equal(history[0].ops.signed.correct,2);
assert.equal(history[0].wrongMap['3 − 8'],1);
assert.equal(history[0].numRange,20);
assert.ok(html.includes("['+','-','*','/'].every(op=>activeOps.has(op))"),'Genius medal requires all four ordinary operations, not any four categories');
new vm.Script(html.match(/<script>([^]*?)<\/script>/)[1]);
console.log('PASS: 20,000 bounded beginner signed questions; positive second operands only; temperature examples and zero-crossing; mixed/ordinary selection; unique distractors and fallback; bonus/museum questions; wrong-pool metadata; saved/legacy settings; three languages; HUD/history/stats; medal guard; app syntax.');
