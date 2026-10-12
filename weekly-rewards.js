// Local play rewards; never require a public leaderboard name or submission.
(function(root){
  'use strict';
  const key='mattormen_weekly_rewards_v1',minimumScore=1000;
  function validWeek(id){
    if(typeof id!=='string'||!/^20\d{2}-W\d{2}$/.test(id))return false;
    const year=Number(id.slice(0,4)),week=Number(id.slice(6));
    const day=new Date(Date.UTC(year,11,28));day.setUTCDate(day.getUTCDate()+4-(day.getUTCDay()||7));
    const maximum=Math.ceil((((day-new Date(Date.UTC(year,0,1)))/86400000)+1)/7);
    return week>=1&&week<=maximum;
  }
  function createTracker(storage){
    function weeks(){
      try{const data=JSON.parse(storage.getItem(key)||'{}');return Array.isArray(data?.weeks)?[...new Set(data.weeks.filter(validWeek))].slice(0,3):[];}catch(e){return [];}
    }
    function eligible(){const count=weeks().length;return [...(count>=1?['kopparglans']:[]),...(count>=3?['parlemor']:[])];}
    function importWeeks(imported){
      if(!Array.isArray(imported))return weeks();
      const merged=[...new Set([...weeks(),...imported.filter(validWeek)])].slice(0,3);
      storage.setItem(key,JSON.stringify({version:1,weeks:merged}));return merged;
    }
    function record({weekId,score,correct,total}){
      if(!validWeek(weekId)||!Number.isSafeInteger(score)||score<minimumScore||!Number.isSafeInteger(correct)||!Number.isSafeInteger(total)||correct<1||total<correct)return {accepted:false,weeks:weeks().length,rewards:eligible()};
      const progress=weeks(),fresh=!progress.includes(weekId)&&progress.length<3;
      if(fresh){progress.push(weekId);storage.setItem(key,JSON.stringify({version:1,weeks:progress}));}
      return {accepted:true,fresh,weeks:progress.length,rewards:eligible()};
    }
    return {weeks,eligible,record,importWeeks};
  }
  const api={key,minimumScore,validWeek,createTracker};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WeeklyRewards=api;
})(typeof globalThis!=='undefined'?globalThis:this);
