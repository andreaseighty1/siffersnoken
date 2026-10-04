// node tests/body-templates.test.cjs [--sharp path/to/sharp]
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spec,themes,bodySvg,pixelGrid,validateTheme,build}=require('../tools/body-templates.cjs');
const root=path.resolve(__dirname,'../skin-templates');
assert.equal(new Set(themes.map(t=>t.id)).size,themes.length);
assert.equal(spec.geometry.outerRadius*2,spec.geometry.visibleDiameter);
assert.equal(spec.styles.pixel.imageSmoothing,false);
assert.equal(spec.styles.toy.imageSmoothing,true);
const overlap=spec.geometry.visibleDiameter*spec.preview.assetScale*spec.preview.overlap;
assert.ok(overlap>1.08&&overlap<1.15,'Body overlaps cell edge gently, without major penetration');
const neutral=themes.find(t=>t.id==='neutral');
const mask=pixelGrid(neutral).map(row=>row.map(color=>Boolean(color)));
for(const theme of themes){
  validateTheme(theme);
  const grid=pixelGrid(theme);
  assert.deepEqual(grid.map(row=>row.map(Boolean)),mask,'All pixel skins share EXACTLY one mask');
  const colors=new Set(grid.flat().filter(Boolean));assert.ok(colors.size<=6,'Pixel palette stays compact');
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    assert.equal(mask[y][x],mask[y][31-x],'Mask has a centered symmetric horizontal silhouette');
    assert.equal(mask[y][x],mask[31-y][x],'Mask has a centered symmetric vertical silhouette');
  }
  assert.ok(grid[3].some(Boolean));assert.ok(grid[28].some(Boolean));
  assert.ok(grid.slice(0,3).flat().every(color=>color===null));
  assert.ok(grid.slice(29).flat().every(color=>color===null));
  for(const style of ['toy','pixel'])assert.equal(bodySvg(style,theme),bodySvg(style,theme),'Build is deterministic');
  assert.ok(bodySvg('toy',theme).includes(`mask="url(#toy-${theme.id}-body)"`));
  assert.ok(bodySvg('pixel',theme).includes('shape-rendering="crispEdges"'));
  assert.equal(theme.bodyOrientation,'fixed','Example motifs should not turn with movement');
}
assert.throws(()=>validateTheme({...neutral,id:'../escape'}));
assert.throws(()=>validateTheme({...neutral,pattern:'unknown'}));
assert.throws(()=>validateTheme({...neutral,palette:{...neutral.palette,base:'url(other.svg)'}}));
assert.throws(()=>validateTheme({...neutral,pixelPalette:{...neutral.palette,base:'url(other.svg)'}}));
assert.throws(()=>validateTheme({...neutral,patternPalette:{...neutral.palette,base:'url(other.svg)'}}));
assert.throws(()=>validateTheme({...neutral,material:'unknown'}));
for(const assetRevision of [0,-1,1.5,'2'])assert.throws(()=>validateTheme({...neutral,assetRevision}));
for(const colorCycle of [{hues:[0],intervalMs:1400},{hues:[0,30,55,115,175,220,220],intervalMs:1400},
  {hues:[0,30,55,115,175,220,360],intervalMs:1400},{hues:[0,30,55,115,175,220,275],intervalMs:100}]){
  assert.throws(()=>validateTheme({...neutral,colorCycle}));
}
const gold=themes.find(t=>t.id==='guld');
assert.equal(gold.material,'gold');assert.ok(bodySvg('toy',gold).includes('-satin'));
assert.ok(!bodySvg('toy',{...gold,material:undefined}).includes('-satin'));
assert.deepEqual(pixelGrid(gold),pixelGrid({...gold,material:undefined}),'Gold finish does not blur the pixel palette');
assert.throws(()=>bodySvg('unknown',neutral));
const emerald=themes.find(t=>t.id==='smaragd');
assert.equal(emerald.pattern,'emeraldInlay');
const plainEmerald=pixelGrid({...emerald,pattern:'none'}),engravedEmerald=pixelGrid(emerald);
assert.ok(engravedEmerald.flat().filter((color,i)=>color!==plainEmerald.flat()[i]).length>15,'Emerald has a visible gem motif, not just a green recolor');
assert.ok(bodySvg('toy',emerald).includes('stroke-opacity=".32"'),'Subtle engraving preserves the sculpted toy volume');
for(const id of ['polkagris','galax','vattenmelon','fotboll','miamisunset','inferno','aurora','hav','lava','obsidian','blackpink','skog','radioaktiv','plasma','clockwork','runorm','prismagodis','skuggmysterium']){
  const theme=themes.find(t=>t.id===id),plain=pixelGrid({...theme,pattern:'none'}).flat(),patterned=pixelGrid(theme).flat();
  assert.ok(patterned.filter((color,i)=>color!==plain[i]).length>20,id+' has a visible surface design, not just a recolor');
  assert.ok(bodySvg('toy',theme).includes(id+'-body-surface'));
}
const candy=themes.find(t=>t.id==='polkagris'),candyColors=pixelGrid(candy).flat();
const prism=themes.find(t=>t.id==='prismagodis'),prismColors=pixelGrid(prism).flat();
for(const key of ['base','light','edge'])assert.ok(prismColors.filter(c=>c===prism.pixelPalette[key]).length>35,'Candy has broad pink, cyan and honey facets, not tiny confetti');
assert.ok(prismColors.filter(c=>c===prism.pixelPalette.shade).length>80,'Candy preserves rounded violet shading');
const mystery=themes.find(t=>t.id==='skuggmysterium'),mysteryColors=pixelGrid(mystery).flat();
assert.ok(mysteryColors.filter(c=>c===mystery.pixelPalette.detail).length>25,'Silver veil edges remain legible');
assert.ok(mysteryColors.filter(c=>[mystery.pixelPalette.base,mystery.pixelPalette.shade].includes(c)).length>170,'Mystery keeps a broad dark sculpted base between the veils');
assert.ok(candyColors.includes(candy.pixelPalette.detail)&&candyColors.includes(candy.pixelPalette.light),'Candy contains both red and white');
const melon=themes.find(t=>t.id==='vattenmelon'),melonGrid=pixelGrid(melon);
assert.equal(melonGrid[16][27],melon.pixelPalette.edge,'Visible green peel near body edge');
assert.equal(melonGrid[16][26],melon.pixelPalette.detail,'Pale rind between peel and fruit');
assert.equal(melonGrid[16][16],melon.pixelPalette.light,'Red center keeps its light tone');
assert.equal(melonGrid[25][16],melon.pixelPalette.shade,'Red underside keeps its rounded shading inside the rind');
assert.ok(melonGrid.flat().filter(color=>color===melon.pixelPalette.edge).length>40,'Peel is not a hairline');
const miami=themes.find(t=>t.id==='miamisunset'),miamiGrid=pixelGrid(miami);
assert.ok(miamiGrid.flat().filter(c=>c===miami.pixelPalette.detail).length>65,'Miami sun remains readable at native size');
assert.ok(miamiGrid.flat().filter(c=>c===miami.pixelPalette.edge).length>65,'Miami ocean is a broad turquoise region');
const lightning=themes.find(t=>t.id==='inferno'),lightningGrid=pixelGrid(lightning);
assert.equal(lightning.pattern,'electricCurrent');
assert.ok(lightningGrid.flat().filter(c=>c===lightning.pixelPalette.detail||c===lightning.pixelPalette.light).length>340,'Most of the body is white-hot/yellow energy, not a badge on blue');
for(const x of [4,27])assert.equal(lightningGrid[15][x],lightning.pixelPalette.detail,'Electric flow reaches both sides of the body');
assert.ok(!bodySvg('toy',lightning).includes('<polygon'),'No enclosed lightning emblem remains');
for(const id of ['aurora','hav']){
  const theme=themes.find(t=>t.id===id),grid=pixelGrid(theme);
  assert.ok(grid.flat().filter(c=>c===theme.pixelPalette.detail).length>60,id+' has readable full-width ribbons/foam');
}
const lava=themes.find(t=>t.id==='lava'),lavaGrid=pixelGrid(lava).flat();
assert.ok(lavaGrid.filter(c=>c===lava.pixelPalette.edge).length>50,'Molten orange cracks remain readable at native resolution');
assert.ok(lavaGrid.filter(c=>c===lava.pixelPalette.detail).length>35,'Cracks have hot cores, not only a red recolor');
assert.ok(lavaGrid.filter(c=>[lava.pixelPalette.base,lava.pixelPalette.light,lava.pixelPalette.shade].includes(c)).length>220,'Dark rounded crust remains visible around the lava');
const obsidian=themes.find(t=>t.id==='obsidian'),obsidianGrid=pixelGrid(obsidian).flat();
assert.ok(obsidianGrid.filter(c=>c===obsidian.pixelPalette.detail).length>15,'Obsidian has clear angular polished edges');
assert.ok(obsidianGrid.filter(c=>[obsidian.pixelPalette.base,obsidian.pixelPalette.shade,obsidian.pixelPalette.edge].includes(c)).length>110,'Obsidian preserves its dark material volume');
const rose=themes.find(t=>t.id==='blackpink'),roseGrid=pixelGrid(rose).flat();
assert.ok(roseGrid.filter(c=>c===rose.pixelPalette.edge).length>60,'Night Rose has broad pink petals, not just a plum recolor');
assert.ok(roseGrid.filter(c=>c===rose.pixelPalette.detail).length>30,'Petal edges remain readable on the native pixel grid');
assert.ok(roseGrid.filter(c=>[rose.pixelPalette.base,rose.pixelPalette.light,rose.pixelPalette.shade].includes(c)).length>180,'Dark sculpted material remains visible between petals');
const forest=themes.find(t=>t.id==='skog'),forestGrid=pixelGrid(forest).flat();
assert.ok(forestGrid.filter(c=>c===forest.pixelPalette.detail).length>40,'Forest leaf veins are visible at native resolution');
const radioactive=themes.find(t=>t.id==='radioaktiv'),radioactiveGrid=pixelGrid(radioactive).flat();
assert.equal(radioactive.pattern,'nuclearFlux');
assert.equal(radioactive.assetRevision,2);
assert.ok(radioactiveGrid.filter(c=>c===radioactive.pixelPalette.light||c===radioactive.pixelPalette.edge).length>200,'Radioactive has broad toxic green channels, not muted warning stripes');
assert.ok(radioactiveGrid.filter(c=>c===radioactive.pixelPalette.detail).length>70,'Nuclear channels have bright cores at native size');
assert.ok(radioactiveGrid.filter(c=>c===radioactive.pixelPalette.base||c===radioactive.pixelPalette.shade).length>120,'Dark rounded material remains between luminous channels');
const plasma=themes.find(t=>t.id==='plasma'),plasmaGrid=pixelGrid(plasma).flat();
assert.equal(plasma.assetRevision,2);
assert.ok(plasmaGrid.filter(c=>c===plasma.pixelPalette.edge).length>110,'Plasma has broad magenta flows');
assert.ok(plasmaGrid.filter(c=>c===plasma.pixelPalette.light).length>110,'Plasma has equally readable cyan flows');
assert.ok(plasmaGrid.filter(c=>c===plasma.pixelPalette.detail).length>80,'Plasma has bright energy cores at native resolution');
const {radiationMark,surfaceSvg}=require('../tools/body-templates.cjs');
assert.ok(radiationMark.flat().every(([,y])=>y>=.60),'Radiation symbol stays in the agreed rear decoration zone');
assert.ok(surfaceSvg(radioactive,512,'head-base').paint.includes('stroke-linejoin="round"'));
assert.ok(!surfaceSvg(radioactive,512,'body').paint.includes('stroke-linejoin="round"'),'No repeated trefoil badges on the body');
const {clockGears,clockTrace,runeStrokes,relicFrame}=require('../tools/body-templates.cjs');
const clockwork=themes.find(t=>t.id==='clockwork'),clockGrid=pixelGrid(clockwork).flat();
assert.ok(clockGears.every(g=>Math.hypot(g.x-.5,g.y-.5)>.3),'Gears are staggered toward the rim, not a central round badge row');
assert.ok(clockGrid.filter(c=>c===clockwork.pixelPalette.light||c===clockwork.pixelPalette.detail).length>130,'Brass teeth and spokes remain legible on the native grid');
assert.ok(clockGrid.filter(c=>c===clockwork.pixelPalette.edge).length>35,'Clockwork has an exposed turquoise power track');
const runorm=themes.find(t=>t.id==='runorm'),runeGrid=pixelGrid(runorm).flat();
assert.ok(runeGrid.filter(c=>c===runorm.pixelPalette.edge||c===runorm.pixelPalette.detail).length>160,'Rune is large and luminous, not microtexture');
assert.ok(runeGrid.filter(c=>c===runorm.pixelPalette.light||c===runorm.pixelPalette.base).length>160,'Runestone preserves sculpted stone material around the carving');
assert.equal(runeStrokes.length,3);
assert.ok(clockTrace.flat().every(Number.isFinite));
assert.equal(relicFrame('head-base').y,.60,'Relic engravings stay in the rear decoration zone');
async function main(){
  const outputs=await build({check:true});assert.equal(outputs.length,themes.length*2);
  const index=process.argv.indexOf('--sharp');
  if(index!==-1){
    const sharp=require(path.resolve(process.argv[index+1]));
    const masks={};
    for(const output of outputs){
      const file=path.join(root,output.file),meta=await sharp(file).metadata();
      assert.equal(meta.format,'webp');assert.equal(meta.width,output.frame);assert.equal(meta.height,output.frame);assert.equal(meta.hasAlpha,true);
      const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      const alpha=Array.from({length:info.width*info.height},(_,i)=>data[i*info.channels+info.channels-1]);
      assert.equal(alpha[0],0);assert.equal(alpha[output.frame/2*output.frame+output.frame/2],255);
      assert.ok(alpha.some(a=>a===0)&&alpha.some(a=>a===255),'Actual transparent background and opaque center');
      if(masks[output.style])assert.deepEqual(alpha,masks[output.style],'All WebP skins share the exact alpha mask');
      else masks[output.style]=alpha;
      if(output.style==='pixel'){
        assert.ok(alpha.every(a=>a===0||a===255),'Pixel alpha has no blurred edges');
        const colors=new Set();
        for(let i=0;i<alpha.length;i++)if(alpha[i])colors.add(data.subarray(i*info.channels,i*info.channels+3).toString('hex'));
        assert.ok(colors.size<=6,'Lossless WebP preserves the pixel palette');
        assert.ok(fs.statSync(file).size<2000,'Pixel body remains tiny');
      }
    }
  }
  const html=fs.readFileSync(path.join(root,'preview.html'),'utf8');
  assert.equal((html.match(/<article class="card">/g)||[]).length,themes.length*2);
  assert.ok(html.includes('image-rendering:pixelated'));
  assert.equal((html.match(/<img src="generated\//g)||[]).length,themes.length*16,'All single and corner samples show the actual WebP assets');
  assert.ok(!html.includes('<svg'),'Pixel corner preview must not introduce fractional SVG row seams');
  const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'Inline preview paint/mask ids must not collide');
  console.log('PASS: shared round geometry, exact masks, deterministic dual-style build, clamped motifs, fixed pattern angles, preview overlap'+(index!==-1?', transparent lossless WebP sizes and pixel palette':'')+'.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
