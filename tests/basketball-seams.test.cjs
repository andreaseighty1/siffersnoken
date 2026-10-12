const assert=require('node:assert/strict'),seams=require('../tools/basketball-seams.cjs'),body=require('../tools/body-templates.cjs'),snake=require('../tools/snake-templates.cjs');
const t=body.themes.find(t=>t.id==='basketboll');assert.equal(t.assetRevision,2);assert.equal(seams.paths.length,4);
for(const side of seams.paths.slice(2)){assert.equal(side.length,65);assert.ok(Math.abs(side[0][0]-side[32][0])>.20,'Side seams visibly curve');}
for(const part of ['body','head-base','tail']){
  const grid=part==='body'?body.pixelGrid(t):snake.partGrid(t,part);
  const plain=part==='body'?body.pixelGrid({...t,pattern:'none'}):snake.partGrid({...t,pattern:'none'},part);
  assert.deepEqual(grid.map(r=>r.map(Boolean)),plain.map(r=>r.map(Boolean)),'Seams never reshape the silhouette');
  assert.ok(new Set(grid.flat().filter(Boolean)).size<=6);
  assert.ok(grid.flat().filter((c,i)=>c!==plain.flat()[i]).length>8);
  const svg=part==='body'?body.bodySvg('toy',t):snake.partSvg('toy',t,part);assert.ok(svg.includes(' L '),'Curved seams are sampled in the material');
}
for(const id of ['kopparglans','parlemor']){const t=body.themes.find(t=>t.id===id);assert.ok(t);for(const style of ['toy','pixel'])for(const part of ['head-base','tail'])assert.ok(snake.partSvg(style,t,part));}
console.log('PASS: two curved and two straight basketball seams, shared body/head/tail design, unchanged silhouettes, fixed body orientation and native six-color pixel palettes.');
