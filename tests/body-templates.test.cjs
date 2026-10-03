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
for(const id of ['polkagris','galax','vattenmelon','fotboll','miamisunset','inferno']){
  const theme=themes.find(t=>t.id===id),plain=pixelGrid({...theme,pattern:'none'}).flat(),patterned=pixelGrid(theme).flat();
  assert.ok(patterned.filter((color,i)=>color!==plain[i]).length>20,id+' has a visible surface design, not just a recolor');
  assert.ok(bodySvg('toy',theme).includes(id+'-body-surface'));
}
const candy=themes.find(t=>t.id==='polkagris'),candyColors=pixelGrid(candy).flat();
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
assert.ok(lightningGrid.flat().filter(c=>c===lightning.pixelPalette.detail||c===lightning.pixelPalette.edge).length>90,'Lightning is a large bolt, not tiny sparks');
assert.equal(lightningGrid[16][16],lightning.pixelPalette.detail,'Main bolt occupies body center');
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
