// Game accuracy is not a diagnosis of mathematical knowledge.
(function(root){
  const OPS=['+','-','*','/','signed'];
  const RULES=Object.freeze({minWrong:3,minWrongSessions:2,minGroupAttempts:20,minGroupSessions:2,minWrongRate:.25,resolvedCorrectStreak:3,recentSessions:10,maxQuestions:256});
  const count=n=>Number.isSafeInteger(n)&&n>=0?n:0;
  const percent=(c,t)=>t?Math.round(c/t*100):null;
  function createTracker(){
    const seen=new WeakSet(),entries=new Map();let omitted=0;
    function record(problem,value){
      if(!problem||typeof problem!=='object'||seen.has(problem))return false;
      if(!Number.isFinite(value)||!Number.isFinite(problem.answer))return false;
      const category=problem.category||problem.op;
      if(!OPS.includes(category)||typeof problem.expr!=='string')return false;
      seen.add(problem);
      const expr=problem.expr.trim().replace(/\s+/g,' '),key=category+'|'+expr;
      let q=entries.get(key);
      if(!q){
        if(entries.size>=RULES.maxQuestions){omitted++;return false;}
        q={expr,op:problem.op,category,answer:problem.answer,correct:0,wrong:0,wrongAnswers:{},lastResults:[]};entries.set(key,q);
      }
      const correct=value===problem.answer;
      q[correct?'correct':'wrong']++;
      if(!correct){const answer=String(value);if(Object.keys(q.wrongAnswers).length<8||Object.hasOwn(q.wrongAnswers,answer))q.wrongAnswers[answer]=(q.wrongAnswers[answer]||0)+1;}
      q.lastResults.push(correct);q.lastResults=q.lastResults.slice(-6);
      return true;
    }
    return {record,snapshot:()=>({version:2,questions:[...entries.values()].map(q=>({...q,wrongAnswers:{...q.wrongAnswers},lastResults:[...q.lastResults]})),omitted})};
  }
  function cohortKey(h,op){
    const tables=Array.isArray(h.tables)?[...new Set(h.tables.filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b):[];
    return JSON.stringify([op,op==='*'||op==='/'?null:h.numRange||null,op==='*'||op==='/'?tables:[],h.practiceMode===true]);
  }
  function analyze(history,{player=null}={}){
    const hist=(Array.isArray(history)?history:[]).filter(h=>h&&typeof h==='object'&&(player===null||h.player===player));
    const recent=hist.slice(-RULES.recentSessions),raw={correct:0,total:0,ops:{}};
    for(const h of hist){
      const total=count(h.total);raw.total+=total;raw.correct+=Math.min(total,count(h.correct));
      for(const op of OPS){const d=h.ops?.[op];if(!d)continue;const t=count(d.total);const row=raw.ops[op]||(raw.ops[op]={correct:0,total:0});row.total+=t;row.correct+=Math.min(t,count(d.correct));}
    }
    const recentTotal=recent.reduce((n,h)=>n+count(h.total),0),recentCorrect=recent.reduce((n,h)=>n+Math.min(count(h.total),count(h.correct)),0);
    const groups=new Map(),latest=new Map();let detailedSessions=0;
    for(let index=0;index<recent.length;index++){
      const h=recent[index],detail=h.questionStats;
      // Old wrongMap cannot reconstruct correct exposures or independent attempts.
      if(detail?.version!==2||!Array.isArray(detail.questions))continue;
      let valid=false;
      for(const item of detail.questions.slice(0,RULES.maxQuestions)){
        if(!item||typeof item.expr!=='string'||!OPS.includes(item.category))continue;
        const c=count(item.correct),w=count(item.wrong);if(c+w===0)continue;
        const key=cohortKey(h,item.category);
        let g=groups.get(key);
        if(!g){g={key,op:item.category,numRange:h.numRange,tables:Array.isArray(h.tables)?h.tables:[],practiceMode:h.practiceMode===true,correct:0,total:0,sessions:new Set(),questions:new Map()};groups.set(key,g);}
        valid=true;latest.set(item.category,key);g.correct+=c;g.total+=c+w;g.sessions.add(index);
        const expr=item.expr.trim().replace(/\s+/g,' '),qkey=item.op+'|'+expr;
        let q=g.questions.get(qkey);
        if(!q){q={expr,op:item.op,category:item.category,answer:item.answer,correct:0,wrong:0,wrongSessions:new Set(),lastResults:[]};g.questions.set(qkey,q);}
        q.correct+=c;q.wrong+=w;if(w)q.wrongSessions.add(index);
        if(Array.isArray(item.lastResults))q.lastResults.push(...item.lastResults.filter(v=>typeof v==='boolean').slice(-6));
        else q.lastResults=[]; // Missing order never implies a recovery streak.
        q.lastResults=q.lastResults.slice(-6);
      }
      if(valid)detailedSessions++;
    }
    const learning=[...groups.values()].filter(g=>latest.get(g.op)===g.key).map(g=>{
      const enough=g.total>=RULES.minGroupAttempts&&g.sessions.size>=RULES.minGroupSessions;
      const patterns=[...g.questions.values()].filter(q=>q.wrong>=RULES.minWrong&&q.wrongSessions.size>=RULES.minWrongSessions&&q.wrong/(q.correct+q.wrong)>=RULES.minWrongRate&&!(q.lastResults.length>=RULES.resolvedCorrectStreak&&q.lastResults.slice(-RULES.resolvedCorrectStreak).every(Boolean)))
        .map(q=>({...q,wrongSessions:q.wrongSessions.size,total:q.correct+q.wrong})).sort((a,b)=>b.wrong-a.wrong||a.expr.localeCompare(b.expr));
      return {...g,questions:undefined,sessions:g.sessions.size,pct:percent(g.correct,g.total),enough,patterns:enough?patterns:[]};
    });
    // All-player totals remain available, but mixed pupils must never get advice.
    const mixedPlayers=player===null&&new Set(hist.map(h=>h.player||'')).size>1;
    const patterns=mixedPlayers?[]:learning.flatMap(g=>g.patterns.map(q=>({...q,group:g}))).slice(0,12);
    return {hist,recent,raw,recentPct:percent(recentCorrect,recentTotal),recentTotal,detailedSessions,mixedPlayers,learning,patterns};
  }
  const api={RULES,createTracker,cohortKey,analyze};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PracticeStatistics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
