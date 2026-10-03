const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const styles=require('../snake-styles.js'),exporter=require('../tools/export-snake-styles.cjs');
assert.equal(styles.normalizeMode('modern'),'toy');
for(const mode of ['classic','toy','pixel'])assert.equal(styles.normalizeMode(mode),mode);
assert.equal(styles.normalizeMode('unknown'),'classic');
for(const mode of ['toy','pixel'])for(const id of styles.config.skins){
  assert.ok(styles.supports(mode,id));
  for(const file of styles.paths(mode,id)){
    assert.ok(file.endsWith('.webp')&&!file.includes('references')&&!file.includes('neutral'));
    assert.ok(fs.existsSync(path.join(__dirname,'..',file)));
  }
}
assert.ok(!styles.supports('pixel','tiger'));assert.ok(!styles.supports('classic','klassisk'));
assert.deepEqual(styles.config,exporter.config());exporter.exportAssets({check:true});
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
new vm.Script(html.match(/<script>([^]*?)<\/script>/)[1]);
const modes=[...html.matchAll(/class="toggle-btn graphics-mode-btn[^]*?data-graphics="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(modes,['classic','toy','pixel']);
assert.ok(html.includes('image-rendering:auto;'));
assert.ok(!html.includes('image-rendering:pixelated'),'Do not pixelate the whole board, number tiles or text');
for(const id of ['isbla','rosa','lila','smaragd'])assert.ok(styles.supports('toy',id)&&styles.supports('pixel',id));
assert.equal(styles.alpha(0),1);assert.equal(styles.alpha(20),.75);assert.equal(styles.alpha(200),.75);
for(let i=1;i<=336;i++){assert.ok(styles.alpha(i)<=styles.alpha(i-1));assert.ok(styles.alpha(i)>=.75);}
assert.ok(html.includes('drawCtx.globalAlpha=SnakeStyles.alpha(index)'),'Legacy Modern uses the same readable opacity');
// Existing Modern settings migrate without altering unlocks or unrelated settings.
const saved={ops:['signed'],graphicsMode:'modern',customSetting:'keep',wallWrap:false};
let stored=JSON.stringify(saved);
const context=vm.createContext({SnakeStyles:styles,localStorage:{getItem:()=>stored,setItem:(key,value)=>stored=value},
  SETTINGS_KEY:'settings',activeOps:new Set(['+']),tables:new Set(),graphicsMode:'classic',numRange:20});
vm.runInContext(html.match(/function loadSettings\([^]*?\n}/)[0],context);context.loadSettings();
assert.equal(context.graphicsMode,'toy');assert.deepEqual(JSON.parse(stored),{...saved,graphicsMode:'toy'});
assert.deepEqual([...context.activeOps],['signed']);assert.equal(context.wallWrap,false);
// Recording canvas: check cache, fixed integer pixel grid, wrapping, fade and joins.
function fakeCanvas(){
  const c={width:0,height:0,commands:[]};
  const stack=[],stateKeys=['globalAlpha','imageSmoothingEnabled','imageSmoothingQuality','globalCompositeOperation','shadowBlur','shadowColor','shadowOffsetY'];
  const ctx={globalAlpha:1,imageSmoothingEnabled:true,globalCompositeOperation:'source-over',shadowBlur:0,
    save(){stack.push(Object.fromEntries(stateKeys.map(k=>[k,this[k]])));},restore(){Object.assign(this,stack.pop());},
    scale(...a){c.commands.push(['scale',...a]);},rotate(...a){c.commands.push(['rotate',...a]);},
    translate(...a){c.commands.push(['translate',...a]);},setTransform(){},fillRect(){},clearRect(){},drawImage(...a){c.commands.push(['draw',this.globalAlpha,this.imageSmoothingEnabled,...a]);}};
  c.getContext=()=>ctx;return c;
}
async function run(){
  const canvases=[];let requests=0;
  const renderer=styles.createRenderer({createCanvas(){const c=fakeCanvas();canvases.push(c);return c;},
    createImage(){return {naturalWidth:32,set src(value){this.source=value;requests++;queueMicrotask(()=>this.onload());}};}});
  assert.equal(renderer.draw(fakeCanvas().getContext(),{mode:'pixel',id:'tiger'}),false);
  for(const mode of ['toy','pixel'])for(const id of styles.config.skins){
    await renderer.preload(mode,id);
    const main=fakeCanvas(),opts={mode,id,cell:34,cols:21,rows:16,points:Array.from({length:50},(_,i)=>({x:12-i%10,y:4+Math.floor(i/10)})),heading:{x:1,y:0},tailDirection:{x:-1,y:0},wrap:true};
    main.getContext().imageSmoothingEnabled=false;main.getContext().imageSmoothingQuality='high';
    assert.equal(renderer.draw(main.getContext(),opts),true);
    assert.equal(main.getContext().imageSmoothingEnabled,false,'Restore the canvas state for number tiles and other game objects');
    assert.equal(main.getContext().imageSmoothingQuality,'high');assert.equal(main.getContext().globalAlpha,1);
    const count=canvases.length,loaded=requests;
    renderer.draw(main.getContext(),opts);assert.equal(canvases.length,count,'Sprites/layer are reused per frame');assert.equal(requests,loaded);
    for(const heading of [{x:0,y:-1},{x:0,y:1},{x:-1,y:0}])renderer.draw(main.getContext(),{...opts,heading,tailDirection:heading,blink:true});
    if(mode==='pixel'){
      const layer=canvases.find(c=>c.width===21*24&&c.height===16*24);
      const draws=layer.commands.filter(c=>c[0]==='draw');
      assert.ok(draws.every(c=>c[2]===false));
      assert.ok(draws.every(c=>c.slice(4).every(Number.isInteger)),'All layer positions and sizes are integer logical pixels');
      assert.equal(draws[0][1],styles.alpha(49),'Tail uses final body opacity');
      assert.equal(main.commands[0][2],true,'Only the final layer blit enables gentle smoothing');
    }
  }
  // End sprite has both tail and body painted at full opacity, before frame fade.
  const joined=canvases.find(c=>c.commands.some(cmd=>cmd[0]==='draw'&&cmd[3]?.source?.endsWith('klassisk-tail.webp')));
  assert.ok(joined.commands.some(cmd=>cmd[0]==='draw'&&cmd[3]?.source?.endsWith('klassisk-body.webp')));
  console.log('PASS: three modes, legacy migration, only runtime WebPs, all themes/facings/blink, fixed pixel grid, joined tail alpha, wrapping, reused caches and app syntax.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
