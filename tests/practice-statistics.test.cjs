const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const stats=require('../practice-statistics.js');
const q=(correct,wrong,lastResults=[])=>({expr:'7 × 8',op:'*',category:'*',answer:56,correct,wrong,lastResults});
const session=(questions,extra={})=>({player:'Ada',total:questions.reduce((n,q)=>n+q.correct+q.wrong,0),correct:questions.reduce((n,q)=>n+q.correct,0),numRange:100,tables:[7],practiceMode:true,questionStats:{version:2,questions},...extra});
const filler=n=>({expr:'7 × 2',op:'*',category:'*',answer:14,correct:n,wrong:0,lastResults:[true]});
const recurring=[session([q(0,2,[false,false]),filler(8)]),session([q(0,1,[false]),filler(9)])];
assert.equal(stats.analyze(recurring,{player:'Ada'}).patterns.length,1);
assert.equal(stats.analyze([session([q(0,1,[false]),filler(30)])],{player:'Ada'}).patterns.length,0,'Single miss is not a pattern');
assert.equal(stats.analyze([session([q(0,3,[false,false,false]),filler(30)])]).patterns.length,0,'One round cannot trigger advice');
assert.equal(stats.analyze([session([q(0,2)]),session([q(0,1)])]).patterns.length,0,'Too few group attempts');
assert.equal(stats.analyze([session([q(30,2),filler(1)]),session([q(30,1),filler(1)])]).patterns.length,0,'Many correct answers outweigh rare misses');
assert.equal(stats.analyze([...recurring,session([q(3,0,[true,true,true])])]).patterns.length,0,'Three latest correct answers clear a pattern');
assert.equal(stats.analyze([recurring[0],session([q(0,1),filler(9)],{tables:[8]})]).patterns.length,0,'Different table choices do not merge');
assert.equal(stats.analyze([recurring[0],session([q(0,1),filler(9)],{practiceMode:false})]).patterns.length,0,'Game modes do not merge');
assert.equal(stats.analyze([recurring[0],session([q(0,1),filler(9)],{player:'Bo'})]).patterns.length,0,'Different pupils do not merge');
const old={player:'Ada',correct:3,total:4,ops:{'*':{correct:3,total:4}},wrongMap:{'7 × 8':10}};
const legacy=stats.analyze([old,old]);assert.equal(legacy.raw.total,8);assert.equal(legacy.raw.correct,6);assert.equal(legacy.patterns.length,0,'Old counts do not invent exposures');
const huge=stats.analyze([...recurring,...Array.from({length:10},()=>session([filler(10)]))]);assert.equal(huge.patterns.length,0,'Old patterns age out of the 10-round window');
assert.equal(stats.analyze([session([filler(30)])]).patterns.length,0,'Perfect play never needs practice');
assert.equal(stats.analyze([]).recentPct,null,'No evidence is not zero accuracy');
for(const category of ['+','signed']){
 const questions=[{expr:'8 − 3',op:'-',category,answer:5,correct:0,wrong:2,lastResults:[false,false]},{expr:'4 + 1',op:'+',category,answer:5,correct:8,wrong:0,lastResults:[true]}];
 const a=session(questions,{numRange:20}),b=session(questions,{numRange:100});
 assert.equal(stats.analyze([a,b]).patterns.length,0,'Different addition/signed ranges do not merge');
}
const weighted=stats.analyze([{player:'Ada',total:1,correct:0},{player:'Ada',total:99,correct:99}]);
assert.equal(weighted.recentPct,99,'Accuracy weights attempts, not round percentages');
const tracker=stats.createTracker(),problem={expr:'7 × 8',op:'*',answer:56};
assert.equal(tracker.record(problem,55),true);assert.equal(tracker.record(problem,54),false,'Multiple collisions on one displayed question count once for analysis');
tracker.record({...problem},56);const saved=tracker.snapshot();assert.equal(saved.questions[0].wrong,1);assert.equal(saved.questions[0].correct,1);assert.equal(saved.questions[0].wrongAnswers['55'],1);
saved.questions[0].lastResults.push(false);assert.deepEqual(tracker.snapshot().questions[0].lastResults,[false,true],'Snapshots cannot mutate a tracker');
for(let i=0;i<300;i++)tracker.record({expr:String(i)+' + 1',op:'+',answer:i+1},i+1);
assert.equal(tracker.snapshot().questions.length,stats.RULES.maxQuestions);assert.ok(tracker.snapshot().omitted>0,'Bound local-storage growth');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
assert.ok(html.indexOf('practice-statistics.js')<html.indexOf('let sessionQuestionTracker='));
assert.ok(html.includes('sessionQuestionTracker.record(problem,tile.value)'));
assert.ok(html.includes('questionStats:sessionQuestionTracker.snapshot()'));
const source=html.slice(html.indexOf('function renderStatsTeacherPage('),html.indexOf('function exportSessionStats()'));
for(const lang of ['sv','en','de']){
 const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',addEventListener(){}});return elements.get(id);};
 const context={$:element,PracticeStatistics:stats,loadPlayer:()=> 'Ada',loadHistory:()=>[session([filler(30)]),{...old,numRange:undefined}],getLang:()=>lang,esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),getOperationLabel:o=>o,getPracticeRangeLabel:r=>String(r)};
 vm.runInNewContext(source+'\nrenderStatsTeacherPage();',context);
 assert.ok(!element('statsPageContent').innerHTML.includes('undefined'));
 assert.ok(!/Behöver träna|Needs practice|Braucht Übung/.test(element('statsPageContent').innerHTML));
}
const before=JSON.stringify(recurring);stats.analyze(recurring);assert.equal(JSON.stringify(recurring),before,'Analysis never edits saved history');
console.log('PASS: repeated independent misses, two-round/minimum-evidence gates, correct weighting/recovery, matched levels, pupil isolation, legacy preservation, bounded tracker and three-language rendering.');
