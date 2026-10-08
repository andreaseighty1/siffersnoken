/* Web only. A failed service never prevents ordinary play. */
const WeeklyChallenge = (() => {
  let challenge=null, saved=null, run=null, finished=null, loading=null;
  const text=(sv,en,de=en)=>pickLangText(sv,en,de);
  const PROFILE_KEY='mattormen_weekly_profiles_v1';
  function profileIdentity(){
    const profile=(loadPlayer()||'Spelare').normalize('NFC').trim().toLocaleLowerCase('sv');
    let profiles;try{profiles=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');}catch(e){profiles={};}
    if(!profiles||typeof profiles!=='object'||Array.isArray(profiles))profiles={};
    if(!Object.hasOwn(profiles,profile)||!/^[a-f0-9]{64}$/.test(profiles[profile]?.id||'')){
      const bytes=crypto.getRandomValues(new Uint8Array(32));
      Object.defineProperty(profiles,profile,{value:{id:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(''),name:''},enumerable:true,writable:true,configurable:true});
      localStorage.setItem(PROFILE_KEY,JSON.stringify(profiles));
    }
    return{profile,...profiles[profile]};
  }
  function rememberName(profile,name){try{const profiles=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');if(Object.hasOwn(profiles,profile)){profiles[profile].name=name;localStorage.setItem(PROFILE_KEY,JSON.stringify(profiles));}}catch(e){}}
  const api=()=>String(window.SIFFER_WEEKLY_API||'').replace(/\/$/,'');
  async function request(action,data){
    if(!api())throw Error(text('Topplistan är inte ansluten ännu.','The leaderboard is not connected yet.'));
    const response=await fetch(api()+'/api.php?action='+action,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(12000),cache:'no-store'});
    const result=await response.json();if(!response.ok)throw Error(result.error||text('Tjänsten kunde inte nås.','Service unavailable.'));return result;
  }
  function status(message){$('weeklyStatus').textContent=message;}
  function render(){
    if(!challenge)return;
    $('weeklyBtnStatus').textContent=text('Vecka ','Week ','Woche ')+challenge.week;
    $('weeklyTitle').textContent=text('Veckans utmaning','Weekly challenge','Wochenchallenge')+' · '+challenge.year+' / '+challenge.week;
    const r=challenge.rules;
    const speeds={none:text('Fast fart','Fixed speed','Festes Tempo'),score:text('Farten ökar med poängen','Speed increases with score','Tempo steigt mit den Punkten'),length:text('Farten ökar med ormlängden','Speed increases with snake length','Tempo steigt mit der Schlangenlänge')};
    const speed=speeds[r.speed||'none'];
    const walls=(r.wallWrap??true)?text('Väggpassage','Wraparound walls','Durch Wände gleiten'):text('Väggkrock avslutar rundan','Hitting a wall ends the round','Wandkontakt beendet die Runde');
    $('weeklyIntro').textContent=r.ops.map(getOperationLabel).join(' / ')+' · '+(r.tables.length?text('Tabeller ','Tables ','Einmaleins ')+r.tables.join(', '):'0–'+r.range)+' · '+speed+' · '+walls+' · '+text('3 liv · inga bonushändelser','3 lives · no bonus events','3 Leben · keine Bonusereignisse');
    $('btnWeeklyStart').disabled=false;
  }
  async function load(force=false){
    if(loading)return loading;
    if(challenge&&!force){render();return;}
    loading=(async()=>{try{challenge=await request('challenge');render();status(text('Redo för veckans utmaning!','Ready for the weekly challenge!'));await leaders();}catch(e){status(e.message);$('btnWeeklyStart').disabled=true;}finally{loading=null;}})();return loading;
  }
  function table(id,rows,field){
    const el=$(id);el.replaceChildren();
    if(!rows.length){el.textContent=text('Ingen har publicerat ett resultat ännu.','No results published yet.');return;}
    rows.forEach((row,i)=>{const line=document.createElement('div');line.className='hs-row';const rank=document.createElement('span');rank.className='hs-rank';rank.textContent=['🥇','🥈','🥉'][i]||String(i+1)+'.';const name=document.createElement('span');name.className='hs-name';name.textContent=row.name;const value=document.createElement('span');value.className='hs-score';value.textContent=row[field];line.append(rank,name,value);el.append(line);});
  }
  async function leaders(){if(!challenge)return;const result=await request('leaderboard&week='+encodeURIComponent(challenge.id));table('weeklyScores',result.scores,'score');table('weeklyLengths',result.lengths,'length');}
  async function start(){
    $('btnWeeklyStart').disabled=true;
    try{
      if(COLS!==21||ROWS!==16||PERF_STRESS_LENGTH)throw Error(text('Öppna spelet utan testinställningar för att delta.','Open the game without preview settings to participate.'));
      const data=await request('start',{});challenge=data.challenge;
      if(!saved)saved={ops:[...activeOps],range:numRange,tables:[...tables],speed:speedMode,wrap:wallWrap,practice:practiceMode,mystery:mysteryEventsEnabled,portal:portalEventsEnabled,bonus:bonusLivesEnabled};
      activeOps=new Set(challenge.rules.ops);numRange=challenge.rules.range;tables=new Set(challenge.rules.tables);speedMode=challenge.rules.speed||'none';wallWrap=challenge.rules.wallWrap??true;practiceMode=false;mysteryEventsEnabled=false;portalEventsEnabled=false;bonusLivesEnabled=false;
      run={token:data.token,maxLength:4,identity:profileIdentity()};finished=null;startGame();
    }catch(e){if(saved&&!run)restore();status(e.message);}finally{$('btnWeeklyStart').disabled=false;}
  }
  function sample(){if(run)run.maxLength=Math.max(run.maxLength,snake.length);}
  function finish(){
    $('weeklyPublishBox').hidden=!run;
    if(!run)return;sample();finished={token:run.token,score,length:run.maxLength,correct:sessionCorrect,total:sessionTotal,playerId:run.identity.id};
    $('weeklyPublishStatus').textContent=text('Ditt resultat: ','Your result: ')+score+text(' poäng · längsta orm: ',' points · longest snake: ')+run.maxLength;
    $('weeklyName').value=run.identity.name||'';$('btnPublishWeekly').disabled=false;
  }
  function restore(){
    if(saved){activeOps=new Set(saved.ops);numRange=saved.range;tables=new Set(saved.tables);speedMode=saved.speed;wallWrap=saved.wrap;practiceMode=saved.practice;mysteryEventsEnabled=saved.mystery;portalEventsEnabled=saved.portal;bonusLivesEnabled=saved.bonus;saved=null;}
    run=null;finished=null;$('weeklyPublishBox').hidden=true;
  }
  async function publish(){
    if(!finished)return;
    const name=$('weeklyName').value.normalize('NFC');
    if(!/^[A-Za-zÅÄÖåäö0-9]{3,12}$/.test(name)){$('weeklyPublishStatus').textContent=text('Använd 3–12 bokstäver eller siffror.','Use 3–12 letters or digits.');return;}
    $('btnPublishWeekly').disabled=true;
    try{await request('submit',{...finished,name});rememberName(run.identity.profile,name);finished=null;goToMenu();goToWeekly();status(text('Resultatet är publicerat!','Your result is published!'));try{await leaders();}catch(e){status(text('Resultatet är publicerat. Listan kunde inte uppdateras just nu.','Your result is published. The leaderboard could not refresh right now.'));}}catch(e){$('weeklyPublishStatus').textContent=e.message;$('btnPublishWeekly').disabled=false;}
  }
  function init(){
    const panel=document.createElement('div');panel.innerHTML='<button class="export-btn" id="btnWeeklyStart" disabled></button><div class="weekly-leader-columns"><section><h3 id="weeklyScoresTitle"></h3><div id="weeklyScores"></div></section><section><h3 id="weeklyLengthsTitle"></h3><div id="weeklyLengths"></div></section></div>';$('weeklyHSContent').append(panel);
    const box=document.createElement('div');box.id='weeklyPublishBox';box.hidden=true;box.innerHTML='<p id="weeklyNameHint"></p><button class="export-btn" type="button" id="btnWeeklyPrivacy"></button><label for="weeklyName" id="weeklyNameLabel"></label><input id="weeklyName" maxlength="12" autocomplete="off" spellcheck="false" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px"><button class="ov-btn primary" id="btnPublishWeekly"></button><p id="weeklyPublishStatus" role="status"></p>';$('goStats').after(box);
    $('btnWeeklyPrivacy').addEventListener('click',()=>PrivacyInfo.open());$('btnWeeklyStart').addEventListener('click',start);$('btnPublishWeekly').addEventListener('click',publish);$('btnGoWeekly').addEventListener('click',()=>load(true));$('btnHSWeekly').addEventListener('click',()=>load(true));
    labels();load();
  }
  function labels(){if(!$('btnWeeklyStart'))return;$('btnWeeklyPrivacy').textContent=text('Om topplistan och dina uppgifter','About the leaderboard and your data','Bestenliste und deine Daten');$('btnWeeklyStart').textContent=text('Delta i veckans utmaning','Join the weekly challenge');$('weeklyScoresTitle').textContent=text('Högsta poäng · topp 50','Highest score · top 50','Höchste Punktzahl · Top 50');$('weeklyLengthsTitle').textContent=text('Längsta orm · topp 50','Longest snake · top 50','Längste Schlange · Top 50');$('weeklyNameHint').textContent=text('Frivilligt: visa resultatet för alla. Ett slumpat tävlings-ID håller ihop dina rekord. Välj ett förnamn eller smeknamn, utan efternamn eller personliga uppgifter.','Optional: show your result to everyone. A random competition ID connects your records. Choose a first name or nickname without surnames or personal information.');$('weeklyNameLabel').textContent=text('Tävlingsnamn (3–12 tecken)','Competition name (3–12 characters)');$('btnPublishWeekly').textContent=text('Publicera resultat','Publish result');render();}
  return{init,load,finish,restore,sample,labels,active:()=>!!run};
})();
WeeklyChallenge.init();
