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
assert.throws(()=>bodySvg('unknown',neutral));
async function main(){
  const outputs=await build({check:true});assert.equal(outputs.length,8);
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
  assert.equal((html.match(/<article class="card">/g)||[]).length,8);
  assert.ok(html.includes('image-rendering:pixelated'));
  assert.equal((html.match(/<img src="generated\//g)||[]).length,64,'All single and corner samples show the actual WebP assets');
  assert.ok(!html.includes('<svg'),'Pixel corner preview must not introduce fractional SVG row seams');
  const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'Inline preview paint/mask ids must not collide');
  console.log('PASS: shared round geometry, exact masks, deterministic dual-style build, clamped motifs, fixed pattern angles, preview overlap'+(index!==-1?', transparent lossless WebP sizes and pixel palette':'')+'.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
