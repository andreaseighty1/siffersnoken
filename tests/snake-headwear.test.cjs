const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const hats=require('../snake-headwear.js'),styles=require('../snake-styles.js'),spec=require('../skin-templates/snake-spec.json');
assert.deepEqual(styles.config.headAttachment,spec.head);
assert.equal(hats.ids.length,30);assert.equal(new Set(hats.ids).size,30);
for(const mode of ['toy','pixel']){
  assert.deepEqual(hats.fit(mode).eyes,mode==='pixel'?spec.head.pixelEyes:spec.head.eyes);
  assert.equal(hats.fit(mode).rearMinimumY,.60);
  for(const id of hats.ids)assert.ok(hats.supports(mode,id));
}
for(const id of hats.ids)assert.ok(!hats.supports('classic',id),'Original keeps its current art');
assert.ok(!hats.supports('toy','unknown'),'Unknown hats are not silently replaced');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const selectable=[...html.match(/const HEAD_ACC_OPTIONS=\[([^]*?)\n\];/)[1].matchAll(/id:'([^']+)'/g)].map(m=>m[1]).filter(id=>!['auto','off'].includes(id));
assert.deepEqual([...hats.ids].sort(),[...selectable,'santa','pumpkin','bunny'].sort(),'All standard, museum and seasonal designs are covered');
assert.ok(html.indexOf('snake-headwear.js?')<html.indexOf('snake-styles.js?'));
const resolveContext=vm.createContext({loadHeadAccessory:()=> 'auto',loadActiveSkin:()=> 'kunglig',getActiveTheme:()=>({}),SKIN_THEMES:{kunglig:{headAcc:'crown'}}});
vm.runInContext(html.match(/function resolveHeadAccessory\([^]*?\n}/)[0],resolveContext);
assert.equal(resolveContext.resolveHeadAccessory(),'crown');
assert.equal(resolveContext.resolveHeadAccessory('off'),null);
assert.equal(resolveContext.resolveHeadAccessory('glasses'),'glasses');
resolveContext.getActiveTheme=()=>({isSeasonal:true,headAcc:'santa'});
assert.equal(resolveContext.resolveHeadAccessory('off'),'santa','Preserve existing seasonal priority');
const canvases=[];
function canvas(){
  const out={width:0,height:0,commands:[]},stack=[];
  const keys=['globalAlpha','globalCompositeOperation','imageSmoothingEnabled','shadowBlur','shadowColor','shadowOffsetY'];
  const c={globalAlpha:1,globalCompositeOperation:'source-over',imageSmoothingEnabled:true,
    save(){stack.push(Object.fromEntries(keys.map(k=>[k,this[k]])));},restore(){Object.assign(this,stack.pop());},
    clearRect(){out.commands.length=0;},drawImage(...args){out.commands.push(['image',this.globalAlpha,...args]);},
    fillRect(...args){out.commands.push(['rect',this.fillStyle,this.globalCompositeOperation,...args]);},
    createLinearGradient(){return {addColorStop(){}};},setTransform(){},scale(){},rotate(){},translate(){},
    beginPath(){},closePath(){},moveTo(...a){out.commands.push(['move',...a]);},lineTo(...a){out.commands.push(['line',...a]);},quadraticCurveTo(...a){out.commands.push(['curve',...a]);},ellipse(){},roundRect(){},fill(){out.commands.push(['fill',this.globalCompositeOperation]);},stroke(){}};
  out.getContext=()=>c;canvases.push(out);return out;
}
(async()=>{
  const renderer=styles.createRenderer({createCanvas:canvas,createImage:()=>({naturalWidth:32,set src(v){queueMicrotask(()=>this.onload());}})});
  for(const mode of ['toy','pixel'])for(const id of ['klassisk','jordgubbe','ghost']){
    await renderer.preload(mode,id);
    for(const accessory of hats.ids)for(const heading of [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}])for(const blink of [false,true]){
      const main=canvas(),opts={mode,id,accessory,blink,heading,tailDirection:heading,cell:34,cols:20,rows:15,points:[{x:7,y:5},{x:6,y:5},{x:5,y:5}],wrap:true};
      const before=canvases.length;assert.ok(renderer.draw(main.getContext(),opts));
      assert.ok(canvases.length>before);
      const newHead=canvases.slice(before).find(c=>c.commands.some(cmd=>cmd[0]==='image')&&c.commands.some(cmd=>cmd[0]==='fill'&&cmd[1]==='destination-out'));
      assert.equal(!!newHead,mode==='toy'&&!!hats.occlusion(accessory),'Hide rear head/contour only for Modern covering hats, in every direction and blink state');
      const warm=canvases.length;main.commands.length=0;renderer.draw(main.getContext(),opts);assert.equal(canvases.length,warm,'Head/hat cached, no per-frame allocations');
      assert.equal(main.getContext().globalAlpha,1);assert.equal(main.getContext().imageSmoothingEnabled,true);
      assert.ok(renderer.cacheSize()<=256,'Cycling all hats/skins/directions cannot retain an unbounded sprite cache');
      if(id==='ghost')assert.equal(main.commands.filter(c=>c[0]==='image').length,1,'Hat inside whole-Ghost translucent layer');
    }
  }
  for(const id of hats.ids)for(const direction of ['up','right','down','left']){
    const c=canvas();hats.paint(c.getContext(),{mode:'pixel',id,size:33,direction});
    const rects=c.commands.filter(c=>c[0]==='rect');
    assert.ok(rects.length);assert.ok(rects.every(r=>r.slice(3).every(Number.isInteger)));
    assert.ok(new Set(rects.filter(r=>r[2]==='source-over').map(r=>r[1])).size<=6);
    assert.ok(rects.every(r=>r[3]>=0&&r[4]>=0&&r[3]+r[5]<=33&&r[4]+r[6]<=33));
    if(id==='glasses')assert.ok(rects.some(r=>r[2]==='destination-out'),'Transparent lens openings are on their own canvas');
    else if(!hats.faceIds.includes(id))assert.ok(rects.every(r=>r[4]>=Math.floor(.60*33)),'Hat stays behind eye zone');
  }
  for(const id of ['glasses','weld_glasses','shadow_monocle'])for(const eyes of [hats.fit('pixel').eyes,[[.376,.448],[.624,.448]]]){
    const out=canvas();hats.paint(out.getContext(),{mode:'pixel',id,size:33,direction:'up',eyes});
    const pixels=Array(33*33).fill(null);
    for(const cmd of out.commands.filter(cmd=>cmd[0]==='rect'))for(let y=cmd[4];y<cmd[4]+cmd[6];y++)for(let x=cmd[3];x<cmd[3]+cmd[5];x++)pixels[y*33+x]=cmd[2]==='destination-out'?null:cmd[1];
    for(const [x,y] of id==='shadow_monocle'?[eyes[1]]:eyes)assert.equal(pixels[Math.floor(y*33)*33+Math.floor(x*33)],null,'Native face frames keep the eye/blink center open, including small animal eyes');
  }
  for(const mode of ['toy','pixel','classic'])for(const id of [...hats.ids,null]){
    const c=canvas(),ctx=c.getContext();
    const masked=hats.occludeHead(ctx,{mode,id,size:64});
    assert.equal(masked,mode==='toy'&&!!hats.occlusion(id));
    assert.equal(ctx.globalCompositeOperation,'source-over','Mask does not leak into crown, eyes or answer tiles');
    if(masked){
      assert.ok(c.commands.some(cmd=>cmd[0]==='fill'&&cmd[1]==='destination-out'));
      for(const cmd of c.commands.filter(cmd=>['move','line','curve'].includes(cmd[0])))for(let i=2;i<cmd.length;i+=2)assert.ok(cmd[i]>=.60,'Occlusion stays strictly behind the eyes');
    }else assert.equal(c.commands.length,0,'Other styles and hats are untouched');
  }
  const preview=fs.readFileSync(require.resolve('../skin-templates/headwear-preview.html'),'utf8');new vm.Script(preview.match(/<script>([^]*?)<\/script>/)[1]);
  const gameCheck=fs.readFileSync(require.resolve('../skin-templates/headwear-game-check.html'),'utf8');new vm.Script(gameCheck.match(/<script>([^]*?)<\/script>/)[1]);
  const gallery=fs.readFileSync(require.resolve('../skin-templates/headwear-gallery.html'),'utf8');new vm.Script(gallery.match(/<script>([^]*?)<\/script>/)[1]);
  const legacyContext=vm.createContext({SnakeHeadwear:hats,graphicsMode:'toy',document:{createElement:canvas},_styledLegacyHeadLayer:null,_styledLegacyHatCache:new Map()});
  vm.runInContext(html.match(/function styledLegacyHeadLayer\([^]*?\n}/)[0],legacyContext);
  const main=canvas(),oldSkin={eyesAssetScale:.74,eyesAssetOffsetY:-.035};
  for(const mode of ['toy','pixel'])for(const accessory of hats.ids){
    legacyContext.graphicsMode=mode;
    const composed=legacyContext.styledLegacyHeadLayer(main.getContext(),oldSkin,70,80,52,Math.PI/2,accessory);
    composed.ctx.drawImage({},40,40,52,52);composed.finish();
    assert.equal(main.getContext().globalCompositeOperation,'source-over','Old-head mask never erases the board');
    const warm=canvases.length;legacyContext.styledLegacyHeadLayer(main.getContext(),oldSkin,70,80,52,Math.PI/2,accessory).finish();
    assert.equal(canvases.length,warm,'Old-head hat cache reuses its sprites and isolated layer');
  }
  assert.ok(html.includes('if(templateDrawn&&!SnakeHeadwear.supports(graphicsMode,resolveHeadAccessory()))'),'Never overlay a second copy of the integrated pilot hat');
  assert.ok(html.includes('accessory:resolveHeadAccessory()'),'Game passes resolved headwear to the shared renderer');
  assert.ok(html.includes('accessory:previewAcc'),'Picker uses the same attachment renderer');
  const catalog=require('../snake-headwear-designs.js').designs;
  for(const id of ['weld_glasses','shadow_monocle'])assert.ok(catalog[id].layers.some(l=>l.cut),'Face lenses stay transparent');
  assert.ok(html.includes('styledLegacyHeadLayer'),'Unmigrated skins also use the new hats on an isolated head layer');
  assert.ok(html.includes('_styledLegacyHatCache.size>=256'),'Transitional hat cache is bounded');
  assert.ok(styles.supports('toy','kunglig')&&styles.supports('pixel','hv71'));
  assert.equal(styles.config.headAccessories.kunglig,'crown');
  console.log('PASS: 30 hats/2 styles/4 directions/blinking, rear head occlusion, native pixel palettes, cache reuse, Ghost layer, transitional skins and preserved selection rules.');
})().catch(e=>{console.error(e);process.exitCode=1;});
