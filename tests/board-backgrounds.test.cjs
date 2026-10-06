const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const backgrounds=require('../board-backgrounds.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=name=>{const m=html.match(new RegExp('function '+name+'\\([^]*?\\n}'));assert.ok(m,name);return m[0];};
function fakeCanvas(){
  const canvas={width:0,height:0,commands:[]},stack=[];
  const keys=['globalAlpha','globalCompositeOperation','imageSmoothingEnabled','shadowBlur','fillStyle'];
  const c={globalAlpha:.47,globalCompositeOperation:'screen',imageSmoothingEnabled:false,shadowBlur:5,
    save(){stack.push(Object.fromEntries(keys.map(k=>[k,this[k]])));},restore(){Object.assign(this,stack.pop());},
    fillRect(...a){canvas.commands.push(['fill',this.fillStyle,this.globalCompositeOperation,...a]);},
    drawImage(...a){canvas.commands.push(['draw',this.globalAlpha,...a]);},
    createLinearGradient(...a){const stops=[];canvas.commands.push(['gradient',a,stops]);return {addColorStop:(...s)=>stops.push(s)};}
  };
  canvas.getContext=()=>c;return canvas;
}
const made=[],renderer=backgrounds.createRenderer({createCanvas:()=>{const c=fakeCanvas();made.push(c);return c;}});
const target=fakeCanvas(),ctx=target.getContext(),original={alpha:ctx.globalAlpha,operation:ctx.globalCompositeOperation,smoothing:ctx.imageSmoothingEnabled};
const art={ready:true};
renderer.draw(ctx,{source:art,id:'forest',width:714,height:544});
assert.equal(made.length,1,'One native-sized composition, no small blurry intermediary');
assert.equal(made[0].width,714);
assert.equal(made[0].commands.filter(c=>c[0]==='gradient').length,0,'No matte wash hides the artwork');
assert.equal(made[0].commands.find(c=>c[0]==='draw')[1],1,'Full art opacity');
for(let i=0;i<100;i++)renderer.draw(ctx,{source:art,id:'forest',width:714,height:544});
assert.equal(made.length,1,'No resampling, gradients or canvas allocation every frame');
renderer.draw(ctx,{source:{ready:true},id:'forest',width:714,height:544});assert.equal(made.length,2,'Source replacement invalidates the styled cache');
renderer.draw(ctx,{source:art,id:'forest',width:714,height:544,pixel:true});
assert.equal(made.at(-1).getContext().imageSmoothingEnabled,false,'Pixel background uses native crisp scaling, foreground unchanged');
for(const mode of ['toy','pixel'])for(const layout of ['wide','portrait']){
  const asset=backgrounds.forestAsset(mode,layout==='wide'?714:476,layout==='wide'?544:680);
  assert.equal(asset.key,`${mode}|${layout}`);
  assert.ok(fs.existsSync(path.join(__dirname,'..',asset.src.split('?')[0])));
  assert.equal(backgrounds.forestAsset(mode,476,782).key,`${mode}|portrait`,'Joystick reuses portrait art');
}
assert.equal(backgrounds.forestAsset('classic',714,544).key,'toy|wide');
assert.equal(Object.keys(backgrounds.themes).length,12);
assert.ok(html.includes('styledBoardLoader.get(id,graphicsMode,canvas.width,canvas.height)'));
const downloads=[],loader=backgrounds.createLoader({createImage:()=>({set src(value){this.url=value;downloads.push(this);}})});
for(const id of Object.keys(backgrounds.themes))for(const mode of ['toy','pixel'])for(const layout of ['wide','portrait']){
  const w=layout==='wide'?714:476,h=layout==='wide'?544:680;
  const selected=backgrounds.asset(id,mode,w,h),entry=loader.get(id,mode,w,h);
  assert.ok(fs.existsSync(path.join(__dirname,'..',selected.src.split('?')[0])),'Every selected WebP exists');
  assert.equal(entry.image.url,selected.src);assert.equal(entry.status,'loading');
  const before=downloads.length;assert.equal(loader.get(id,mode,w,h),entry);assert.equal(downloads.length,before,'Revisit does not re-download retained art');
  entry.image.onload();assert.equal(entry.status,'ready');
  assert.ok(loader.cacheSize()<=4,'At most four decoded images retained');
  assert.equal(backgrounds.asset(id,mode,476,782).src,backgrounds.asset(id,mode,476,680).src,'Android formats share portrait composition');
}
assert.equal(backgrounds.asset('portal','toy',714,544),null,'Portal remains separate');
for(const id of ['unknown','constructor','__proto__'])assert.equal(backgrounds.asset(id,'toy',714,544),null,'Only own theme IDs are assets');
loader.clear();assert.equal(loader.cacheSize(),0);
const failure=loader.get('crystal','toy',714,544);failure.image.onerror();assert.equal(failure.status,'failed');
for(const id of Object.keys(backgrounds.palettes))renderer.draw(ctx,{source:art,id,width:714,height:544});
assert.equal(renderer.cacheSize(),2,'Visiting every scene leaves at most two cached boards');
const count=made.length;renderer.draw(ctx,{source:art,id:'forest',width:390,height:300,enabled:false});
assert.equal(made.length,count,'Off never composes or samples a scene');
assert.ok(target.commands.at(-1)[0]==='fill');
assert.deepEqual({alpha:ctx.globalAlpha,operation:ctx.globalCompositeOperation,smoothing:ctx.imageSmoothingEnabled},original,'Background state cannot leak into tiles or Pixelretro');
renderer.clear();assert.equal(renderer.cacheSize(),0);

// Corner artwork always keeps its source proportions; only an empty middle
// strip expands. No crop, missing rows, overlapping destination bands or seam.
for(const [sw,sh,w,h] of [[1536,1024,714,544],[1049,1499,476,680],[1049,1500,476,782],[1049,1500,336,552]]){
  const slices=backgrounds.forestSlices(sw,sh,w,h);
  assert.equal(slices.length,3);
  let sy=0,dy=0;
  for(const rect of slices){
    assert.equal(rect[1],sy);assert.equal(rect[5],dy);
    assert.equal(rect[0],0);assert.equal(rect[2],sw);
    assert.equal(rect[4],0);assert.equal(rect[6],w);
    assert.ok(rect[3]>0&&rect[7]>0);
    sy+=rect[3];dy+=rect[7];
  }
  assert.equal(sy,sh);assert.equal(dy,h);
  for(const rect of [slices[0],slices[2]])assert.ok(Math.abs(rect[7]-rect[3]*w/sw)<=.5,'Corner shapes scale uniformly, within integer rounding');
  const c=fakeCanvas(),composed=[];
  const r=backgrounds.createRenderer({createCanvas:()=>{const f=fakeCanvas();composed.push(f);return f;}});
  const sourceImage={naturalWidth:sw,naturalHeight:sh};
  r.draw(c.getContext(),{source:sourceImage,id:'forest',width:w,height:h});
  assert.deepEqual(composed[0].commands.map(cmd=>cmd.slice(3)),slices,'Real renderer uses the three approved bands');
  for(let i=0;i<100;i++)r.draw(c.getContext(),{source:sourceImage,id:'forest',width:w,height:h});
  assert.equal(composed.length,1,'Adaptive composition happens once, not every frame');
}
assert.equal(backgrounds.forestSlices(0,0,476,680),null);
assert.equal(backgrounds.forestSlices(1536,1024,714,1),null,'Unsupported tiny targets fail safely');
for(const id of Object.keys(backgrounds.themes))for(const [sw,sh,w,h] of [[1536,1024,714,544],[1049,1499,476,680],[1049,1500,476,782]]){
  const slices=backgrounds.compositionSlices(id,sw,sh,w,h);
  assert.equal(slices.length,3);
  assert.equal(slices.reduce((sum,r)=>sum+r[3],0),sh,'All source rows are preserved');
  assert.equal(slices.reduce((sum,r)=>sum+r[7],0),h,'All destination rows covered without gaps');
  assert.equal(slices[1][5],slices[0][7]);
  assert.equal(slices[2][5],slices[0][7]+slices[1][7]);
  for(const r of [slices[0],slices[2]])assert.ok(Math.abs(r[7]-r[3]*w/sw)<=.5,'Corner and end-zone shapes never stretch');
}
const boardSetup=html.match(/const _perfParams=[^]*?const ROWS=[^]*?;/)[0];
for(const [search,cols,rows] of [['',21,16],['?boardPreview=portrait',21,16],['?perf=1',21,16],['?perf=1&boardPreview=unknown',21,16],['?perf=1&boardPreview=portrait',14,20],['?perf=1&boardPreview=joystick',14,23]]){
  const setup=vm.runInNewContext(boardSetup+'\n({COLS,ROWS})',{location:{search},URLSearchParams});
  assert.equal(setup.COLS,cols);assert.equal(setup.ROWS,rows,'Only explicit developer previews alter board dimensions');
}
const downloaded=[],loading=vm.createContext({canvas:{width:714,height:544},graphicsMode:'toy',BoardBackgrounds:backgrounds,
  styledBoardLoader:backgrounds.createLoader({createImage:()=>({set src(value){this.url=value;downloaded.push(this);}})}),
  _fairyForestImage:null,_fairyForestImageStatus:''});
vm.runInContext(source('getFairyForestBackdrop')+'\n'+source('getStyledBoardBackdrop'),loading);
for(const [mode,w,h] of [['toy',714,544],['pixel',714,544],['toy',476,680],['pixel',476,782]]){
  loading.graphicsMode=mode;loading.canvas.width=w;loading.canvas.height=h;
  loading.getFairyForestBackdrop();const image=downloaded.at(-1);
  assert.equal(image.url,backgrounds.forestAsset(mode,w,h).src);
  image.onload();assert.equal(loading.getFairyForestBackdrop(),image);
}
assert.equal(downloaded.length,4,'Exactly one download for each selected style/composition');
loading.canvas.height=680;loading.getFairyForestBackdrop();assert.equal(downloaded.length,4,'Touch and joystick share the loaded portrait');

const storage=new Map(),buttons=['true','false'].map(background=>({dataset:{background},classList:{toggle(k,v){this.selected=v;}},setAttribute(k,v){this[k]=v;}}));
const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{textContent:''});return elements.get(id);};
const context=vm.createContext({SnakeStyles:require('../snake-styles.js'),SETTINGS_KEY:'settings',
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{querySelectorAll:()=>buttons},$:element,tOr:(key,sv)=>sv,updateMenuSettingsSummary(){},
  activeOps:new Set(['+']),tables:new Set([2]),numRange:20,speedMode:'none',wallWrap:true,multiTableSelect:false,musicGenre:'original',
  mysteryEventsEnabled:true,portalEventsEnabled:true,bonusLivesEnabled:true,graphicsMode:'toy'});
vm.runInContext(html.match(/let boardBackgroundsEnabled=true;/)[0]+'\n'+['saveSettings','loadSettings','updateBoardBackgroundControls','applyBoardBackgrounds'].map(source).join('\n'),context);
assert.equal(vm.runInContext('boardBackgroundsEnabled',context),true);
context.applyBoardBackgrounds(false);assert.equal(JSON.parse(storage.get('settings')).boardBackgroundsEnabled,false);
assert.equal(buttons[1]['aria-pressed'],'true');assert.equal(buttons[0]['aria-pressed'],'false');
context.applyBoardBackgrounds(true,{persist:false});context.loadSettings();assert.equal(vm.runInContext('boardBackgroundsEnabled',context),false,'Saved Off survives reload');
storage.set('settings',JSON.stringify({boardBackgroundsEnabled:'false'}));context.applyBoardBackgrounds(true,{persist:false});context.loadSettings();
assert.equal(vm.runInContext('boardBackgroundsEnabled',context),true,'Invalid strings do not silently disable backgrounds');
storage.set('settings',JSON.stringify({graphicsMode:'modern',boardBackgroundsEnabled:false,custom:'keep'}));context.loadSettings();
assert.deepEqual(JSON.parse(storage.get('settings')),{graphicsMode:'toy',boardBackgroundsEnabled:false,custom:'keep'},'Migration preserves preference and unrelated settings');

let images=0,particles=0,blits=0;
const rendering=vm.createContext({canvas:{width:714,height:544},ctx:{fillRect(){},drawImage(){blits++;}},
  boardBackgroundsEnabled:false,graphicsMode:'toy',modernBoardThemeId:'forest',_renderNow:0,_portalBackgroundSprite:null,
  isModernGraphics:()=>true,MODERN_BOARD_BACKDROPS:{forest:()=>{images++;return art;}},getFairyForestBackdrop:()=>{images++;return art;},
  boardBackgroundRenderer:{draw(){blits++;}},createSpriteCanvas:()=>{throw Error('Disabled portal should not allocate art');},drawParticles:()=>{particles++;}});
vm.runInContext(source('drawBackground')+'\n'+source('drawPortalBackground'),rendering);
rendering.drawBackground({particles:'stars'});rendering.drawPortalBackground();
assert.equal(images,0);assert.equal(particles,0);assert.equal(blits,2,'Off applies to the normal and portal boards');
rendering.boardBackgroundsEnabled=true;rendering.drawBackground({});assert.equal(images,1);
rendering.isModernGraphics=()=>false;rendering.drawBackground({bgA:'#123456',particles:'stars'});assert.equal(particles,1,'Original On preserves its old particle theme');
assert.ok(html.indexOf('board-backgrounds.js?')<html.indexOf('<script>'),'Renderer is loaded before game setup');
const translations={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../translations.js'),'utf8'),translations);
for(const lang of ['sv','en','de'])for(const key of ['panelBoardBackgrounds','boardBackgroundOn','boardBackgroundOff','boardBackgroundDesc'])assert.ok(translations.window.SIFFERSNOKEN_TRANSLATIONS[lang][key]);
new vm.Script(html.match(/<script>([^]*?)<\/script>/)[1]);
for(const file of ['background-preview.html','headwear-game-check.html'])new vm.Script(fs.readFileSync(path.join(__dirname,'../skin-templates',file),'utf8').match(/<script>([^]*?)<\/script>/)[1]);
console.log('PASS: sharp native art, no blur/matte, separate forest styles, cached composition, foreground state, saved On/Off, lazy loading and Original preservation.');
