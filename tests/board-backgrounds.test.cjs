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
for(const mode of ['toy','pixel'])assert.ok(fs.existsSync(path.join(__dirname,'../assets/sagoskog-'+mode+'.webp')));
assert.ok(html.includes('assets/sagoskog-${mode}.webp?v=1'));
for(const id of Object.keys(backgrounds.palettes))renderer.draw(ctx,{source:art,id,width:714,height:544});
assert.equal(renderer.cacheSize(),2,'Visiting every scene leaves at most two cached boards');
const count=made.length;renderer.draw(ctx,{source:art,id:'forest',width:390,height:300,enabled:false});
assert.equal(made.length,count,'Off never composes or samples a scene');
assert.ok(target.commands.at(-1)[0]==='fill');
assert.deepEqual({alpha:ctx.globalAlpha,operation:ctx.globalCompositeOperation,smoothing:ctx.imageSmoothingEnabled},original,'Background state cannot leak into tiles or Pixelretro');
renderer.clear();assert.equal(renderer.cacheSize(),0);

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
