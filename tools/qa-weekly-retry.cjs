// Browser QA with isolated storage. All service calls are mocked, never live.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/andre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),outputArg=process.argv.indexOf('--output');
const out=outputArg<0?path.join(os.tmpdir(),'siffersnoken-weekly-retry'):path.resolve(process.argv[outputArg+1]);fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  const relative=decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]),file=path.resolve(root,'.'+relative);
  if(!file.startsWith(root+path.sep)||relative.includes('/.')||relative.startsWith('/loopia-server/')){res.writeHead(403);return res.end();}
  fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.mp3':'audio/mpeg','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(b);});
});
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--mute-audio']});
  const report={method:'Local headless Edge, isolated browser storage and mocked weekly API; no live submission',scenarios:[],errors:[]};
  try{
    for(const [lang,label] of [['sv','Försök igen'],['en','Try again'],['de','Erneut versuchen']])for(const [width,height] of [[1100,800],[390,605]]){
      const calls=[];let sequence=0,failStart=false;
      const context=await browser.newContext({viewport:{width,height}});
      await context.addInitScript(()=>{localStorage.setItem('mattormen_settings',JSON.stringify({musicOn:false}));localStorage.setItem('mattormen_player','TestPlayer');});
      await context.route('**/*',async route=>{
        const request=route.request(),u=new URL(request.url());
        if(u.pathname.endsWith('/api.php')){
          const action=u.searchParams.get('action'),body=request.postData()?JSON.parse(request.postData()):null;calls.push({action,body});
          const challenge={id:'2026-W42',week:42,year:2026,rules:{ops:['+'],range:20,tables:[],speed:'none',wallWrap:true}};
          if(action==='start'&&failStart){failStart=false;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Mock service unavailable'})});}
          const data=action==='challenge'?challenge:action==='leaderboard'?{scores:[],lengths:[]}:action==='start'?{token:(++sequence).toString(16).padStart(64,'0'),challenge}:{ok:true};
          return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
        }
        return request.url().startsWith(url)?route.continue():route.abort();
      });
      const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
      await page.goto(url+'/',{waitUntil:'networkidle'});
      await page.evaluate(lang=>{
        musicOn=false;setLang(lang);activeOps=new Set(['-']);numRange=100;tables=new Set([2,3]);speedMode='length';wallWrap=false;practiceMode=true;mysteryEventsEnabled=portalEventsEnabled=bonusLivesEnabled=true;
        window.__retryFrameCounts=new Map();const real=gameLoop;gameLoop=function(ts){window.__retryFrameCounts.set(ts,(window.__retryFrameCounts.get(ts)||0)+1);return real(ts);};goToWeekly();
      },lang);
      await page.waitForFunction(()=>!document.getElementById('btnWeeklyStart').disabled);
      const hint=await page.locator('#weeklyAttemptsHint').innerText();assert.ok(hint.length>50);
      assert.equal(await page.evaluate(()=>document.getElementById('btnWeeklyStart').previousElementSibling.id),'weeklyAttemptsHint');
      await page.locator('#btnWeeklyStart').click();await page.waitForFunction(()=>state==='playing');
      async function finish(scoreValue,length){await page.evaluate(({scoreValue,length})=>{score=scoreValue;sessionCorrect=20;sessionTotal=22;const head=snake[0];snake=Array.from({length},(_,i)=>({x:head.x-i,y:head.y,px:head.x-i,py:head.y}));triggerGameOver();},{scoreValue,length});}
      await finish(1000,9);await page.locator('#btnWeeklyRetry').waitFor({state:'visible'});assert.equal(await page.locator('#btnWeeklyRetry').innerText(),label);
      await page.locator('#btnWeeklyRetry').scrollIntoViewIfNeeded();const box=await page.locator('#gameoverOverlay .ov-card').boundingBox(),button=await page.locator('#btnWeeklyRetry').boundingBox();
      assert.ok(box.y>=0&&box.y+box.height<=height+1,'Game-over card stays within the viewport');assert.ok(button.y>=0&&button.y+button.height<=height+1);assert.ok(button.height>=44);
      await page.locator('#gameoverOverlay').screenshot({path:path.join(out,'retry-'+lang+'-'+width+'.png')});
      const before=calls.filter(c=>c.action==='start').length;
      await page.evaluate(()=>{const b=document.getElementById('btnWeeklyRetry');b.click();b.click();});await page.waitForFunction(()=>state==='playing');
      assert.equal(calls.filter(c=>c.action==='start').length,before+1);assert.equal(await page.locator('#weeklyPublishBox').isHidden(),true);
      assert.deepEqual(await page.evaluate(()=>({score,lives,length:snake.length})),{score:0,lives:3,length:4});
      await page.waitForTimeout(180);assert.ok(await page.evaluate(()=>Math.max(...window.__retryFrameCounts.values()))<=1,'One game-loop callback per frame after retry');
      await finish(200,5);failStart=true;await page.locator('#btnWeeklyRetry').click();await page.waitForFunction(()=>document.getElementById('weeklyRetryStatus').textContent.includes('Mock service unavailable'));
      assert.equal(await page.evaluate(()=>state),'gameover');assert.equal(await page.locator('#btnPublishWeekly').isEnabled(),true);
      assert.equal(calls.filter(c=>c.action==='submit').length,0,'Retry did not publish anything');
      await page.locator('#weeklyName').fill('TestSnake');await page.locator('#btnPublishWeekly').click();await page.waitForFunction(()=>state==='menu');
      const submission=calls.find(c=>c.action==='submit').body;assert.equal(submission.token,'2'.padStart(64,'0'));assert.equal(submission.score,200);assert.equal(submission.length,5);
      const restored=await page.evaluate(()=>({ops:[...activeOps],range:numRange,speed:speedMode,wrap:wallWrap,practice:practiceMode,mystery:mysteryEventsEnabled,portal:portalEventsEnabled,bonus:bonusLivesEnabled,weeks:WeeklyRewards.createTracker(localStorage).weeks().length}));
      assert.deepEqual(restored,{ops:['-'],range:100,speed:'length',wrap:false,practice:true,mystery:true,portal:true,bonus:true,weeks:1});
      await page.evaluate(()=>startGame());await page.waitForFunction(()=>state==='playing');await finish(100,4);assert.equal(await page.locator('#btnWeeklyRetry').isHidden(),true);
      report.scenarios.push({lang,width,height,freshToken:true,duplicateClickBlocked:true,oneFrameChain:true,oldResultPreservedAfterFailure:true,publicationOptional:true,ordinaryRetryHidden:true,preferencesRestored:true,qualifyingWeeks:1});
      await context.close();
    }
    assert.equal(report.errors.length,0,report.errors.join('\n'));fs.writeFileSync(path.join(out,'qa-result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
