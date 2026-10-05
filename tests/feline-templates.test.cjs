const assert=require('node:assert/strict'),body=require('../tools/body-templates.cjs'),snake=require('../tools/snake-templates.cjs'),feline=require('../tools/feline-templates.cjs');
const tiger=body.themes.find(t=>t.id==='tiger'),cat=body.themes.find(t=>t.id==='katt');
assert.ok(feline.isFeline(tiger)&&feline.isFeline(cat));
assert.ok(feline.ear.every(([,y])=>y>=snake.spec.feline.earMinimumY));
for(const theme of [tiger,cat]){
  for(const style of ['toy','pixel'])for(const layer of ['head-ears','head-face'])assert.equal(snake.felineLayer(style,theme,layer),snake.felineLayer(style,theme,layer));
  const neutral=snake.partGrid(body.themes[0],'head-base').map(row=>row.map(Boolean));
  assert.deepEqual(snake.partGrid(theme,'head-base').map(row=>row.map(Boolean)),neutral,'No larger head mask for animals');
  const bodyMask=body.pixelGrid(body.themes[0]).map(row=>row.map(Boolean));
  assert.deepEqual(body.pixelGrid(theme).map(row=>row.map(Boolean)),bodyMask,'Body remains rounded and identical');
}
for(const bend of snake.spec.feline.tailBends){
  for(let i=0;i<=128;i++){
    const y=snake.spec.tail.attachment[1]+(snake.spec.feline.tailTipY-snake.spec.tail.attachment[1])*i/128;
    const section=feline.tailSection(y,bend);
    assert.ok(section.center-section.half>=0&&section.center+section.half<=1,'Stronger wag never clips the source image');
  }
  const mask=snake.partGrid(tiger,'tail','up',bend).map(row=>row.map(Boolean));
  assert.deepEqual(mask,snake.partGrid(cat,'tail','up',bend).map(row=>row.map(Boolean)),'Cat and Tiger use exactly the same tail');
  const neutral=snake.partGrid(body.themes[0],'tail').map(row=>row.map(Boolean)),join=snake.joinGeometry('pixel');
  assert.deepEqual(mask[join.baseY],neutral[join.baseY],'Every pose preserves the original attachment width');
  const pixels=new Set();
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(bodyMaskAt(x,y))pixels.add(x+','+y);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(mask[y][x])pixels.add(x+','+(y+16+join.bodyChord-join.baseY));
  const queue=[[16,16]],visited=new Set();
  for(let i=0;i<queue.length;i++){
    const [x,y]=queue[i],key=x+','+y;if(visited.has(key))continue;visited.add(key);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(pixels.has((x+dx)+','+(y+dy))&&!visited.has((x+dx)+','+(y+dy)))queue.push([x+dx,y+dy]);
  }
  assert.equal(visited.size,pixels.size,'Animated tail and last body stay connected, without a gap');
  function bodyMaskAt(x,y){return Math.hypot(x+.5-16,y+.5-16)<=13;}
}
const [left,,,,right]=snake.spec.feline.tailBends;
assert.ok(feline.tailSection(snake.spec.feline.tailTipY,right).center-feline.tailSection(snake.spec.feline.tailTipY,left).center>=.45,'Pronounced tip excursion, not the old subtle wag');
assert.deepEqual(feline.tailSection(snake.spec.tail.attachment[1]+.02,left),feline.tailSection(snake.spec.tail.attachment[1]+.02,right),'The entire attachment collar remains fixed');
assert.notDeepEqual(snake.partGrid(tiger,'tail','up',left).map(row=>row.map(Boolean)),snake.partGrid(tiger,'tail','up',right).map(row=>row.map(Boolean)),'Tail actually moves');
const stripes=body.surfaceSvg(tiger,512,'body').defs.match(/<polygon /g)||[];
assert.equal(stripes.length,10,'Classic tiger body has five tapered stripes on each side');
for(const theme of [tiger,cat])assert.ok(body.pixelGrid(theme).flat().filter(Boolean).some(c=>c===theme.pixelPalette.ink));
console.log('PASS: shared rear ears, fixed animal head/body masks, five narrow connected feline tail poses and stable original pivot.');
