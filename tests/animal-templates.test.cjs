const assert=require('node:assert/strict'),body=require('../tools/body-templates.cjs'),snake=require('../tools/snake-templates.cjs'),animals=require('../tools/animal-templates.cjs');
const themes=['hund','bi','drake'].map(id=>body.themes.find(t=>t.id===id));
const bodyMask=body.pixelGrid(body.themes[0]).map(row=>row.map(Boolean));
const headMask=snake.partGrid(body.themes[0],'head-base').map(row=>row.map(Boolean));
const ordinaryTail=snake.partGrid(body.themes[0],'tail').map(row=>row.map(Boolean));
const join=snake.joinGeometry('pixel');
for(const theme of themes){
  assert.ok(animals.isSpecial(theme));
  assert.deepEqual(body.pixelGrid(theme).map(row=>row.map(Boolean)),bodyMask,'Animals keep the rounded body mask');
  assert.deepEqual(snake.partGrid(theme,'head-base').map(row=>row.map(Boolean)),headMask,'No larger head for special skins');
  for(const shape of [animals.ear(theme),animals.horn(theme)])for(const [x,y] of shape){
    assert.ok(x>=0&&x<=1&&y>=snake.spec.head.decorationMinimumY&&y<=1,'Ears and horns sit behind the eyes, inside the source frame');
  }
  for(const style of ['toy','pixel'])for(const part of ['head-ears','head-face']){
    assert.equal(snake.animalLayer(style,theme,part),snake.animalLayer(style,theme,part),'Deterministic independent ornament layers');
  }
  for(const bend of snake.spec.feline.tailBends){
    for(let i=0;i<=160;i++){
      const y=snake.spec.tail.attachment[1]+(animals.profile(theme).tailTipY-snake.spec.tail.attachment[1])*i/160;
      const s=animals.tailSection(theme,y,bend);
      assert.ok(s.center-s.half>=0&&s.center+s.half<=1,'Every tail pose stays within the source frame');
    }
    const mask=snake.partGrid(theme,'tail','up',bend).map(row=>row.map(Boolean));
    assert.deepEqual(mask[join.baseY],ordinaryTail[join.baseY],'All five poses keep the original attachment width');
    assert.deepEqual(animals.tailSection(theme,.145,bend),animals.tailSection(theme,.145,0),'Fixed collar, not a rotating tail base');
    const points=[];
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      if(bodyMask[y][x])points.push([x,y]);
      if(mask[y][x])points.push([x,y+16+join.bodyChord-join.baseY]);
    }
    let turned=points;
    for(let direction=0;direction<4;direction++){
      const occupied=new Set(turned.map(p=>p.join(','))),visited=new Set(),queue=[turned[0]];
      for(let i=0;i<queue.length;i++){
        const [x,y]=queue[i],key=[x,y].join(',');if(visited.has(key))continue;visited.add(key);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(occupied.has([x+dx,y+dy].join(','))&&!visited.has([x+dx,y+dy].join(',')))queue.push([x+dx,y+dy]);
      }
      assert.equal(visited.size,occupied.size,theme.id+' tail joins the body without gaps in every pose/direction');
      turned=turned.map(([x,y])=>[31-y,x]);
    }
  }
  assert.notDeepEqual(snake.partGrid(theme,'tail','up',-.24).map(row=>row.map(Boolean)),snake.partGrid(theme,'tail','up',.24).map(row=>row.map(Boolean)),'Tail has a visible excursion');
  assert.ok(body.pixelGrid(theme).flat().some((c,i)=>c!==body.pixelGrid({...theme,pattern:'none'}).flat()[i]),'Distinct body material, not a plain color swap');
}
assert.notDeepEqual(animals.ear(themes[0]),animals.ear(themes[1]),'Dog and Cow share the head base, not the ears');
assert.notDeepEqual(snake.partGrid(themes[0],'tail').map(row=>row.map(Boolean)),snake.partGrid(themes[1],'tail').map(row=>row.map(Boolean)),'Cow tuft and curved dog tail have distinct silhouettes');
console.log('PASS: three independent animal profiles, rear ears/horns, unchanged round heads/bodies, fixed collars, connected five-pose tails in all directions and distinct materials.');
