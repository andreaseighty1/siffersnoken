const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const body=require('../tools/body-templates.cjs'),snake=require('../tools/snake-templates.cjs');
const root=path.resolve(__dirname,'../skin-templates'),neutral=body.themes[0];
assert.equal(snake.spec.assetFacing,'up');
assert.equal(snake.spec.head.radiusX*2/body.spec.geometry.visibleDiameter,body.spec.geometry.headWidthRelativeToBody);
assert.equal(snake.spec.tail.widthRelativeToBody,body.spec.geometry.tailAttachmentWidthRelativeToBody);
assert.ok(snake.spec.tail.widthRelativeToBody<.5,'Tail is clearly narrower than the body');
assert.ok((snake.spec.tail.tipY-snake.spec.tail.attachment[1])/body.spec.geometry.visibleDiameter<.55,'Short rounded concept tail, not a long spike');
assert.ok(snake.spec.head.eyes[0][1]<.32,'Eyes toward the face, not small central eyes');
for(const [x,y] of snake.spec.head.eyes)assert.ok(snake.inside('head-base',x,y));
for(const [x,y] of snake.spec.head.rearDecorationAnchors){assert.ok(snake.inside('head-base',x,y));assert.ok(y>=snake.spec.head.decorationMinimumY&&y>snake.spec.head.eyes[0][1]);}
for(const part of snake.parts){
  const mask=snake.partGrid(neutral,part).map(row=>row.map(Boolean));
  for(const theme of body.themes){
    assert.deepEqual(snake.partGrid(theme,part).map(row=>row.map(Boolean)),mask,'Every theme uses the same part silhouette');
    for(const style of ['toy','pixel'])assert.equal(snake.partSvg(style,theme,part),snake.partSvg(style,theme,part));
  }
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)assert.equal(mask[y][x],mask[y][31-x],'Centered symmetric silhouette');
  if(part==='tail'){
    const widths=mask.map(row=>row.filter(Boolean).length).filter(Boolean);
    for(let i=1;i<widths.length;i++)assert.ok(widths[i]<=widths[i-1],'Tail tapers without a broad tip or bulge');
    const join=snake.joinGeometry('pixel'),disk=body.pixelGrid(neutral).map(row=>row.map(Boolean));
    const attachmentColumns=mask[join.baseY].flatMap((v,x)=>v?[x]:[]);
    for(const x of attachmentColumns)assert.ok(disk[16+join.bodyChord][x],'Entire flat attachment meets the last body');
    assert.ok(13-join.bodyChord<=2,'Join only uses a tiny circular cap, not the body center');
    // Quarter-turns preserve the union and its connection without changing alpha.
    const occupied=new Set();
    for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(disk[y][x])occupied.add(`${x},${y}`);
    for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(mask[y][x])occupied.add(`${x},${y+16+join.bodyChord-join.baseY}`);
    const quarter=([x,y])=>[31-y,x];
    let points=[...occupied].map(k=>k.split(',').map(Number));
    for(let turn=0;turn<4;turn++){
      const set=new Set(points.map(p=>p.join(','))),visited=new Set(),queue=[points[0]];
      for(let i=0;i<queue.length;i++){const [x,y]=queue[i],key=`${x},${y}`;if(visited.has(key))continue;visited.add(key);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(set.has(`${x+dx},${y+dy}`)&&!visited.has(`${x+dx},${y+dy}`))queue.push([x+dx,y+dy]);}
      assert.equal(visited.size,set.size,'Attachment is connected in every cardinal direction');points=points.map(quarter);
    }
  }
}
assert.throws(()=>snake.partSvg('toy',neutral,'wrong'));
assert.throws(()=>snake.partSvg('wrong',neutral,'tail'));
assert.throws(()=>snake.partSvg('toy',neutral,'head-base',{facing:'diagonal'}));
assert.throws(()=>snake.partSvg('toy',neutral,'head-base',{facing:'__proto__'}));
for(const id of ['polkagris','galax'])for(const part of snake.parts){
  const theme=body.themes.find(t=>t.id===id),patterned=snake.partGrid(theme,part).flat(),plain=snake.partGrid({...theme,pattern:'none'},part).flat();
  assert.ok(patterned.some((color,i)=>color!==plain[i]),id+' keeps its surface design on '+part);
  assert.ok(snake.partSvg('toy',theme,part).includes(id+'-'+part+'-surface'));
}
assert.ok(body.galaxyMarks('head-base').every(([,y])=>y>=snake.spec.head.decorationMinimumY),'Head stars are behind the eyes');
for(const facing of ['up','right','down','left']){
  const [x,y]=snake.lightCenter(facing),angle=snake.facingAngles[facing]*Math.PI/180;
  assert.ok(Math.abs((x-.5)*Math.cos(angle)-(y-.5)*Math.sin(angle)+.5-.38)<1e-12);
  assert.ok(Math.abs((x-.5)*Math.sin(angle)+(y-.5)*Math.cos(angle)+.5-.30)<1e-12,'Key light stays in the same world-space position');
  for(const theme of body.themes)assert.deepEqual(snake.partGrid(theme,'head-base',facing).map(row=>row.map(Boolean)),snake.partGrid(theme,'head-base').map(row=>row.map(Boolean)),'Lighting variants do not deform the head');
}
assert.notEqual(snake.eyesSvg('toy',false),snake.eyesSvg('toy',true));
assert.notEqual(snake.eyesSvg('pixel',false),snake.eyesSvg('pixel',true));
const toyJoin=snake.joinGeometry('toy'),r=512*body.spec.geometry.outerRadius;
assert.ok(Math.abs(toyJoin.halfWidth**2+toyJoin.bodyChord**2-r*r)<1e-8,'Tail corners meet the body circle analytically');
assert.ok((r-toyJoin.bodyChord)/512<.04,'No large tail penetration');
for(const style of ['toy','pixel'])for(const variant of ['straight','corner']){
  const pose=snake.pose(style,variant);assert.equal(pose.headAngle,90);
  assert.equal(pose.tailAngle,variant==='straight'?90:0);
  assert.ok(pose.tailPivot.every(Number.isFinite));
  if(variant==='straight'){
    const extension=pose.draw*(snake.spec.tail.tipY-pose.join.baseY/body.spec.styles[style].frame);
    assert.ok(pose.tailPivot[0]-extension>=0,'Straight preview shows the whole tip, not a cropped tail');
    assert.ok(pose.head[0]+pose.draw*snake.spec.head.radiusY<snake.spec.preview.frame[0]);
  }
}
async function main(){
  const outputs=await snake.build({check:true});assert.equal(outputs.length,body.themes.length*12+7);
  const index=process.argv.indexOf('--sharp');
  if(index!==-1){
    const sharp=require(path.resolve(process.argv[index+1])),masks={};
    for(const output of outputs){
      const file=path.join(root,output.file),meta=await sharp(file).metadata();
      assert.equal(meta.format,'webp');assert.equal(meta.width,output.frame);assert.equal(meta.height,output.frame);assert.equal(meta.hasAlpha,true);
      const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      const alpha=Array.from({length:info.width*info.height},(_,i)=>data[i*info.channels+info.channels-1]);
      assert.ok(alpha.some(a=>a===255)&&alpha.some(a=>a===0));assert.equal(alpha[0],0);
      const key=output.style+':'+(output.part||'body');
      if(masks[key])assert.deepEqual(alpha,masks[key],'Actual WebP alpha is identical across themes');else masks[key]=alpha;
      if(output.style==='pixel'){
        assert.ok(alpha.every(a=>a===0||a===255),'Hard pixel alpha');
        const colors=new Set();for(let i=0;i<alpha.length;i++)if(alpha[i])colors.add(data.subarray(i*info.channels,i*info.channels+3).toString('hex'));
        assert.ok(colors.size<=6);assert.ok(fs.statSync(file).size<2000);
      }
      if(output.part==='head-decoration'){
        for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(alpha[y*info.width+x])assert.ok(y/info.height>=snake.spec.head.decorationMinimumY,'Actual leaves stay behind the eye zone');
      }
    }
    for(const style of ['toy','pixel'])for(const state of ['open','blink']){
      const head=masks[style+':head-base'],eyes=masks[style+':eyes-'+state];
      for(let i=0;i<eyes.length;i++)if(eyes[i])assert.equal(head[i],255,'Eye layer stays fully inside the head');
    }
  }
  const html=fs.readFileSync(path.join(root,'parts-preview.html'),'utf8');
  assert.equal((html.match(/<article class="card">/g)||[]).length,body.themes.length*2);
  assert.ok(html.includes('eyes-open.webp')&&html.includes('eyes-blink.webp'));
  assert.ok(html.includes('image-rendering:pixelated'));
  assert.ok(html.includes('opacity:0.35'),'Same last-body and tail fade');
  assert.ok(!html.includes('<svg'),'Preview shows actual bitmap assets');
  const targetHtml=fs.readFileSync(path.join(root,'style-targets.html'),'utf8');
  assert.ok(targetHtml.includes('references/toy-concept.webp')&&targetHtml.includes('references/pixel-concept.webp'));
  assert.ok(targetHtml.includes('head-decoration.webp')&&targetHtml.includes('tongue.webp'));
  assert.ok(targetHtml.includes('drop-shadow'),'Sculpted toys have rendering-stage soft shadows, not baked alpha');
  for(const style of ['toy','pixel'])assert.ok(fs.existsSync(path.join(root,'references',style+'-concept.webp')));
  console.log('PASS: deterministic dual-style heads/tails/eyes, fixed world-space key light in four directions, rear decoration anchors, exact masks, short taper, connected cardinal joins, shared fade, original concept comparison'+(index!==-1?`, ${outputs.length} transparent lossless WebP assets and pixel palettes`:'')+'.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
