// Fixed head, tail and eye layers; builds both styles without changing the game.
const fs=require('node:fs'),path=require('node:path');
const body=require('./body-templates.cjs');
const spec=require('../skin-templates/snake-spec.json');
const root=path.resolve(__dirname,'../skin-templates');
const parts=['head-base','tail'];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headSeeds=[[.25,.64],[.54,.70],[.74,.57]];
const tailSeeds=[[.44,.31],[.55,.45],[.49,.62]];
const facingAngles={up:0,right:90,down:180,left:-90};
function lightCenter(facing){
  const angle=-facingAngles[facing]*Math.PI/180,dx=.38-.5,dy=.30-.5;
  return [.5+dx*Math.cos(angle)-dy*Math.sin(angle),.5+dx*Math.sin(angle)+dy*Math.cos(angle)];
}
function inside(part,x,y){
  if(part==='head-base')return ((x-.5)/spec.head.radiusX)**2+((y-.5)/spec.head.radiusY)**2<=1;
  if(part==='tail'){
    const t=(y-spec.tail.attachment[1])/(spec.tail.tipY-spec.tail.attachment[1]);
    const half=body.spec.geometry.visibleDiameter*spec.tail.widthRelativeToBody/2;
    return t>=0&&t<=1&&Math.abs(x-.5)<=half*Math.pow(1-t,spec.tail.taperExponent);
  }
  throw new Error('Unknown part: '+part);
}
function tailHalfAt(y){
  const t=(y-spec.tail.attachment[1])/(spec.tail.tipY-spec.tail.attachment[1]);
  return body.spec.geometry.visibleDiameter*spec.tail.widthRelativeToBody/2*Math.pow(Math.max(0,1-t),spec.tail.taperExponent);
}
function contour(part,size){
  if(part==='head-base')return `<ellipse cx="${size*.5}" cy="${size*.5}" rx="${size*spec.head.radiusX}" ry="${size*spec.head.radiusY}"/>`;
  // Sample the same analytic taper used by the pixel mask. Flat top is the pivot.
  const left=[],right=[];
  for(let i=0;i<=64;i++){
    const y=spec.tail.attachment[1]+(spec.tail.tipY-spec.tail.attachment[1])*i/64,w=tailHalfAt(y);
    left.push(`${(size*(.5-w)).toFixed(4)},${(size*y).toFixed(4)}`);
    right.unshift(`${(size*(.5+w)).toFixed(4)},${(size*y).toFixed(4)}`);
  }
  return `<polygon points="${left.concat(right).join(' ')}"/>`;
}
function toyPart(theme,part,facing='up'){
  const size=body.spec.styles.toy.frame,p=theme.palette,id=`toy-${theme.id}-${part}`;
  const material=body.toyMaterial(p,id,size,{rx:spec.head.radiusX,ry:spec.head.radiusY,tail:part==='tail',lightCenter:lightCenter(facing)});
  const seeds=part==='tail'?tailSeeds:headSeeds;
  const pattern=theme.pattern==='strawberrySeeds'?seeds.filter(([,y])=>y<spec.tail.tipY||part!=='tail').map(([x,y])=>`<ellipse cx="${x*size}" cy="${y*size}" rx="${size*.024}" ry="${size*.030}" fill="${p.detail}"/>`).join('')
    :theme.pattern==='basketballSeams'?`<path d="M ${size*.5} 0 V ${size} M 0 ${size*.58} H ${size}" fill="none" stroke="${p.ink}" stroke-width="${size*.018}"/>`
    :theme.pattern==='emeraldInlay'?body.emeraldSvg(p,size,part):'';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${material.defs}<mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><g fill="white">${contour(part,size)}</g></mask></defs><g mask="url(#${id}-mask)">${material.paint}${pattern}</g></svg>`;
}
function partGrid(theme,part,facing='up'){
  const size=body.spec.styles.pixel.frame,p=theme.pixelPalette||theme.palette;
  return Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
    const nx=(x+.5)/size,ny=(y+.5)/size;
    if(!inside(part,nx,ny))return null;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!inside(part,nx+dx/size,ny+dy/size)))return p.ink;
    const dx=(nx-.5)*size,dy=(ny-.5)*size,angle=facingAngles[facing]*Math.PI/180;
    const worldX=dx*Math.cos(angle)-dy*Math.sin(angle),worldY=dx*Math.sin(angle)+dy*Math.cos(angle);
    const sideways=facing==='right'||facing==='left';
    let color=part==='tail'?(nx<.48?p.light:p.base):body.pixelMaterial(p,worldX,worldY,(sideways?spec.head.radiusY:spec.head.radiusX)*size,(sideways?spec.head.radiusX:spec.head.radiusY)*size);
    if(theme.pattern==='strawberrySeeds'&&(part==='tail'?tailSeeds:headSeeds).some(([sx,sy])=>Math.abs(nx-sx)<.038&&Math.abs(ny-sy)<.038))color=p.detail;
    if(theme.pattern==='basketballSeams'&&(x===16||y===18))color=p.ink;
    if(theme.pattern==='emeraldInlay'&&body.emeraldPixel(x,y,size,part))color=p.detail;
    return color;
  }));
}
function gridSvg(grid){
  const size=grid.length,rects=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;){const start=x,color=grid[y][x];while(x<size&&grid[y][x]===color)x++;if(color)rects.push(`<rect x="${start}" y="${y}" width="${x-start}" height="1" fill="${color}"/>`);}
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
function partSvg(style,theme,part,{facing='up'}={}){
  body.validateTheme(theme);if(!parts.includes(part))throw new Error('Unknown part: '+part);
  if(!Object.hasOwn(facingAngles,facing))throw new Error('Unknown facing: '+facing);
  if(style==='toy')return toyPart(theme,part,facing);
  if(style==='pixel')return gridSvg(partGrid(theme,part,facing));
  throw new Error('Unknown style: '+style);
}
function eyesSvg(style,blink=false){
  const size=body.spec.styles[style]?.frame;if(!size)throw new Error('Unknown style');
  const p=spec.eyesPalette;
  if(style==='toy')return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><radialGradient id="eye-white" cx="37%" cy="28%" r="78%"><stop offset="0" stop-color="${p.white}"/><stop offset=".72" stop-color="${p.white}"/><stop offset="1" stop-color="${p.whiteShade}"/></radialGradient><radialGradient id="eye-pupil" cx="40%" cy="27%" r="75%"><stop offset="0" stop-color="${p.pupilShade}"/><stop offset="1" stop-color="${p.ink}"/></radialGradient></defs>${spec.head.eyes.map(([x,y])=>blink?
    `<path d="M ${(x-.115)*size} ${y*size} Q ${x*size} ${(y+.055)*size} ${(x+.115)*size} ${y*size}" fill="none" stroke="${p.ink}" stroke-width="${size*.019}" stroke-linecap="round"/>`:
    `<ellipse cx="${x*size}" cy="${y*size}" rx="${size*.137}" ry="${size*.143}" fill="url(#eye-white)"/><ellipse cx="${x*size}" cy="${(y-.019)*size}" rx="${size*.101}" ry="${size*.112}" fill="url(#eye-pupil)"/><ellipse cx="${(x-.037)*size}" cy="${(y-.068)*size}" rx="${size*.021}" ry="${size*.014}" fill="${p.white}" fill-opacity=".85"/>`).join('')}</svg>`;
  const grid=Array.from({length:size},()=>Array(size).fill(null));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)for(const [ex,ey] of spec.head.pixelEyes){
    const dx=x+.5-Math.round(ex*size),dy=y+.5-Math.round(ey*size);
    if(blink){if(Math.abs(dx)<=3.5&&Math.abs(dy)<=.5)grid[y][x]=p.ink;}
    else if((dx/4.25)**2+(dy/4.25)**2<=1){
      grid[y][x]=p.white;
      if((dx/2.9)**2+((dy+.5)/3.0)**2<=1)grid[y][x]=p.ink;
      if(dx===-1.5&&dy===-1.5)grid[y][x]=p.white;
    }
  }
  return gridSvg(grid);
}
// Optional theme ornament, in the rear zone only; never part of the head mask.
const leaves=[[.50,.82,.06,.165,0],[.33,.76,.12,.065,-32],[.67,.76,.12,.065,32],[.37,.88,.13,.065,30],[.63,.88,.13,.065,-30]];
function decorationSvg(style){
  const size=body.spec.styles[style].frame;
  if(style==='toy')return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="leaf-light" x2=".3" y2="1"><stop stop-color="#71ad35"/><stop offset=".5" stop-color="#398b29"/><stop offset="1" stop-color="#19572b"/></linearGradient></defs>${leaves.map(([x,y,rx,ry,a])=>`<ellipse cx="${x*size}" cy="${y*size}" rx="${rx*size}" ry="${ry*size}" transform="rotate(${a} ${x*size} ${y*size})" fill="url(#leaf-light)"/>`).join('')}</svg>`;
  const hit=(nx,ny)=>leaves.some(([x,y,rx,ry,a])=>{const rad=a*Math.PI/180,dx=nx-x,dy=ny-y;return ((dx*Math.cos(rad)+dy*Math.sin(rad))/rx)**2+((-dx*Math.sin(rad)+dy*Math.cos(rad))/ry)**2<=1;});
  return gridSvg(Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
    const nx=(x+.5)/size,ny=(y+.5)/size;if(!hit(nx,ny))return null;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!hit(nx+dx/size,ny+dy/size)))return '#174b26';
    return x<16?'#70ae35':'#388427';
  })));
}
function tongueSvg(){
  const size=body.spec.styles.pixel.frame,grid=Array.from({length:size},()=>Array(size).fill(null));
  for(let y=3;y<=6;y++)for(const x of [15,16])grid[y][x]='#eb343b';
  for(const [x,y] of [[14,2],[15,2],[16,2],[17,2],[13,1],[14,1],[17,1],[18,1],[13,0],[18,0]])grid[y][x]='#eb343b';
  return gridSvg(grid);
}
// The attachment plane meets the circular body on a chord, not at its center.
// Its corners touch the disk; only the tiny circular cap sits behind the tail.
function joinGeometry(style){
  const size=body.spec.styles[style].frame,r=size*body.spec.geometry.outerRadius;
  if(style==='pixel'){
    const grid=partGrid(body.themes[0],'tail'),baseY=grid.findIndex(row=>row.some(Boolean));
    const columns=grid[baseY].flatMap((c,x)=>c?[x]:[]),half=Math.max(...columns.map(x=>Math.abs(x+.5-size/2)));
    return {baseY,halfWidth:half,bodyChord:Math.floor(Math.sqrt(r*r-half*half)-.5),pivot:[size/2,baseY]};
  }
  const half=r*spec.tail.widthRelativeToBody;
  return {baseY:size*spec.tail.attachment[1],halfWidth:half,bodyChord:Math.sqrt(r*r-half*half),pivot:[size/2,size*spec.tail.attachment[1]]};
}
function pose(style,variant='corner'){
  const native=body.spec.styles[style].frame,draw=body.spec.preview.cell*body.spec.preview.assetScale*body.spec.preview.overlap;
  const points=variant==='straight'?[[224,112],[176,112],[128,112],[80,112]]:spec.preview.bodyCenters;
  const head=variant==='straight'?[272,112]:spec.preview.headCenter;
  const last=points.at(-1),prev=points.at(-2),dx=last[0]-prev[0],dy=last[1]-prev[1];
  const len=Math.hypot(dx,dy),join=joinGeometry(style);
  const pivot=[last[0]+dx/len*join.bodyChord/native*draw,last[1]+dy/len*join.bodyChord/native*draw];
  return {draw,headDraw:draw*body.spec.styles[style].headRenderScale,points,head,tailPivot:pivot,tailAngle:Math.atan2(dy,dx)*180/Math.PI-90,headAngle:90,join};
}
function snakePreview(style,theme,variant='corner',fade=false){
  const layout=pose(style,variant),[w,h]=spec.preview.frame;
  const image=(part,center,angle=0,alpha=1)=>`<img class="material" src="generated/${style}/${theme.id}-${part==='head-base'?'head-base-right':part}.webp" alt="" style="left:${center[0]/w*100}%;top:${center[1]/h*100}%;width:${(part.startsWith('head-')?layout.headDraw:layout.draw)/w*100}%;transform:translate(-50%,-50%) rotate(${angle}deg);opacity:${alpha}">`;
  const segments=layout.points.map((p,i)=>image('body',p,0,fade?Math.max(.35,1-(i+1)*.13):1)).reverse().join('');
  const tail=`<img class="material" src="generated/${style}/${theme.id}-tail.webp" alt="" style="left:${layout.tailPivot[0]/w*100}%;top:${layout.tailPivot[1]/h*100}%;width:${layout.draw/w*100}%;transform-origin:50% ${layout.join.baseY/body.spec.styles[style].frame*100}%;transform:translate(-50%,-${layout.join.baseY/body.spec.styles[style].frame*100}%) rotate(${layout.tailAngle}deg);opacity:${fade?Math.max(.35,1-layout.points.length*.13):1}">`;
  const eyes=`<img src="generated/${style}/eyes-open.webp" alt="" style="left:${layout.head[0]/w*100}%;top:${layout.head[1]/h*100}%;width:${layout.headDraw/w*100}%;transform:translate(-50%,-50%) rotate(${layout.headAngle}deg)">`;
  const decoration=theme.id==='jordgubbe'?image('head-decoration',layout.head,layout.headAngle):'';
  const tongue=style==='pixel'?`<img src="generated/pixel/tongue.webp" alt="" style="left:${(layout.head[0]+layout.headDraw*.13)/w*100}%;top:${layout.head[1]/h*100}%;width:${layout.headDraw/w*100}%;transform:translate(-50%,-50%) rotate(${layout.headAngle}deg)">`:'';
  return `<div class="snake" role="img" aria-label="${esc(theme.label)}: ${variant==='straight'?'rak snok':'snok med sväng'}${fade?', nedtonad kropp och svans':''}">${tail}${segments}${tongue}${image('head-base',layout.head,layout.headAngle)}${decoration}${eyes}</div>`;
}
function targetsHtml(){
  const crops={toy:{x:1110,y:104,w:548,h:805},pixel:{x:1068,y:89,w:604,h:835}};
  return `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SifferSnoken – konceptmål och mallar</title><style>
  *{box-sizing:border-box}body{margin:0;padding:22px;background:#f6f2e6;color:#103d35;font:15px system-ui,sans-serif}main{max-width:1180px;margin:auto}h1{font-size:27px;margin:0 0 8px}p{line-height:1.5}h2{font-size:20px;margin:0 0 10px}h3{font-size:15px;margin:8px 0}.styles{display:grid;grid-template-columns:1fr 1fr;gap:20px}.style{padding:16px;border:1px solid #ded9c8;background:#fffaf0;border-radius:16px}.compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}.label{font-size:12px;letter-spacing:.05em;font-weight:700;text-transform:uppercase;margin:0 0 10px}.reference{position:relative;overflow:hidden;border-radius:10px;background:#f2eee2}.reference img{position:absolute;max-width:none}.actual{background:#f5f0e3;padding:10px;border-radius:10px}.snake{position:relative;aspect-ratio:324 / 100;overflow:visible;margin:12px 0 25px}.snake img{position:absolute;height:auto}.toy .material{filter:drop-shadow(0 6px 5px #35290d40)}.pixel .snake img{image-rendering:pixelated}.info{font-size:13px;margin:12px 0 0}footer{font-size:13px;margin-top:16px}@media(max-width:820px){.styles{grid-template-columns:1fr}}@media(max-width:420px){body{padding:10px}.style{padding:10px}.compare{gap:8px}.actual{padding:6px}h1{font-size:22px}.snake{margin-bottom:16px}}
  </style><main><h1>SifferSnoken · koncepten är målbilden</h1><p>Vänster i varje stil: den ursprungliga konceptförlagan. Höger: de faktiska transparenta WebP-tillgångarna, sammansatta med fasta mått och fästpunkter.</p><div class="styles">${Object.entries(body.spec.styles).map(([style,def])=>{const c=crops[style];return `<section class="style ${style}"><h2>${def.label}</h2><div class="compare"><div><p class="label">Koncept / målbild</p><div class="reference" style="aspect-ratio:${c.w} / ${c.h}"><img src="references/${style}-concept.webp" alt="${def.label}, ursprunglig målbild" style="width:${1672/c.w*100}%;left:${-c.x/c.w*100}%;top:${-c.y/c.h*100}%"></div></div><div><p class="label">Faktiska mallar</p><div class="actual">${body.themes.filter(t=>t.id!=='neutral').map(theme=>`<h3>${esc(theme.label)}</h3>${snakePreview(style,theme,'straight')}`).join('')}</div></div></div><p class="info">${style==='toy'?'Skulpterad matt volym, mjuk rundning, stora mörka pupiller och kort rundad svans. Mjuka skuggor läggs av renderingen, inte i bildens alfamask.':'Mörk pixelkontur, nederkant i färgsteg, små ljusblänk och tydliga ögon. Fast 32 × 32-rutnät utan mjuk filtrering.'}</p></section>`;}).join('')}</div><footer>Dessa tillgångar används i spelets Modern och Pixelretro. Vyn visar källbilder; spelrenderingen lägger dessutom kontrast och lätt pixelutjämning. Basketbollens riktiga böjda sömmar återstår enligt överenskommelse. Konceptförlagorna används för stil och proportioner, inte för att kopiera felaktiga dubbla svansar eller ändra spelregler. <a href="parts-preview.html">Delar, svängar och nedtoning</a></footer></main></html>`;
}
function previewHtml(){
  return `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SifferSnoken – huvud och svansmallar</title><style>
  *{box-sizing:border-box}body{margin:0;padding:24px;background:#f6f2e6;color:#183b35;font:16px system-ui,sans-serif}main{max-width:1080px;margin:auto}h1{font-size:27px;margin:0 0 12px}p{line-height:1.5}.styles{display:grid;grid-template-columns:1fr 1fr;gap:20px}.style{background:#fffaf0;border:1px solid #dedaca;border-radius:16px;padding:18px}h2{font-size:20px}h3{margin:12px 0}.card{border-top:1px solid #dedaca;padding-top:8px}.parts{display:flex;align-items:center;background:#173f36;border-radius:10px;padding:8px;gap:8px}.part{position:relative;width:25%;aspect-ratio:1}.part img{position:absolute;inset:0;width:100%}.snake{position:relative;aspect-ratio:324 / 252;background:#173f36;overflow:hidden;border-radius:12px;margin:8px 0 16px}.snake img{position:absolute;height:auto}.pixel img{image-rendering:pixelated}.caption{font-size:13px;margin:5px 0;color:#456057}.checks{display:grid;grid-template-columns:1fr 1fr;gap:12px}.checks .snake{margin:0}footer{font-size:14px;line-height:1.5;margin-top:20px}@media(max-width:640px){body{padding:12px}.styles{grid-template-columns:1fr}.style{padding:14px}h1{font-size:23px}}
  .parts,.snake{background:#f4efdf}.toy .snake .material{filter:drop-shadow(0 6px 5px #35290d40)}.checks .snake{background:#173f36}
  </style><main><h1>SifferSnoken · huvud, ögon och svansmallar</h1><p>Fasta proportioner i båda stilarna. Separata ögonlager, rundat huvud och smalt svansfäste på kroppens kant. Produktionsmallar för Modern och Pixelretro. <a href="style-targets.html">Jämför med konceptförlagorna</a>.</p><div class="styles">${Object.entries(body.spec.styles).map(([style,def])=>`<section class="style ${style}"><h2>${def.label}</h2><p>${def.frame} × ${def.frame} · transparent WebP</p>${body.themes.map(theme=>`<article class="card"><h3>${esc(theme.label.replace('kroppsmall','mall'))}</h3><div class="parts"><div class="part"><img src="generated/${style}/${theme.id}-head-base.webp" alt="Huvud">${theme.id==='jordgubbe'?`<img src="generated/${style}/jordgubbe-head-decoration.webp" alt="Blad i bakre zonen">`:''}<img src="generated/${style}/eyes-open.webp" alt="Öppna ögon"></div><div class="part"><img src="generated/${style}/${theme.id}-body.webp" alt="Kropp"></div><div class="part"><img src="generated/${style}/${theme.id}-tail.webp" alt="Svans"></div><div class="part"><img src="generated/${style}/${theme.id}-head-base.webp" alt="Huvud"><img src="generated/${style}/eyes-blink.webp" alt="Blinkande ögon"></div></div><p class="caption">Huvud · kropp · svans · blinkning</p>${snakePreview(style,theme)}</article>`).join('')}<h3>Fäste och nedtoning</h3><div class="checks">${snakePreview(style,body.themes[1],'straight')}${snakePreview(style,body.themes[1],'corner',true)}</div><p class="caption">Rak snok samt samma nedtoning på sista kroppsdelen och svansen. Fästpunkten är rotationscentrum även för framtida vickning.</p></section>`).join('')}</div><footer>Öron/horn ska placeras i huvudets bakre zon, bakom ögonen. Här kontrolleras källbilder och statiska sammanfogningar; runtimekonturen, slutskalningen och långa snokar kontrolleras även i spelet. Gamla modernassets bevaras.</footer></main></html>`;
}
async function build({sharpModule,check=false}={}){
  const outputs=await body.build({sharpModule,check}),sharp=sharpModule?require(path.resolve(sharpModule)):null;
  async function emit(style,name,svg,metadata){
    const folder=path.join(root,'generated',style),file=path.join(folder,name+'.svg');
    if(check){if(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')!==svg)throw new Error('Stale template: '+file);}
    else{fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(file,svg);if(sharp)await sharp(Buffer.from(svg)).webp({lossless:true,alphaQuality:100,effort:6}).toFile(path.join(folder,name+'.webp'));}
    outputs.push({style,frame:body.spec.styles[style].frame,file:`generated/${style}/${name}.webp`,...metadata});
  }
  for(const style of Object.keys(body.spec.styles)){
    for(const theme of body.themes)for(const part of parts)await emit(style,theme.id+'-'+part,partSvg(style,theme,part),{id:theme.id,part,assetFacing:spec.assetFacing,...(part==='tail'?{attachment:joinGeometry(style).pivot}:{eyes:style==='pixel'?spec.head.pixelEyes:spec.head.eyes,renderScale:body.spec.styles[style].headRenderScale})});
    for(const blink of [false,true])await emit(style,'eyes-'+(blink?'blink':'open'),eyesSvg(style,blink),{part:'eyes-'+(blink?'blink':'open'),assetFacing:spec.assetFacing});
    await emit(style,'jordgubbe-head-decoration',decorationSvg(style),{id:'jordgubbe',part:'head-decoration',assetFacing:spec.assetFacing});
    for(const theme of body.themes)for(const facing of ['right','down','left'])await emit(style,theme.id+'-head-base-'+facing,partSvg(style,theme,'head-base',{facing}),{id:theme.id,part:'head-base',assetFacing:spec.assetFacing,renderFacing:facing,renderRotation:facingAngles[facing],renderScale:body.spec.styles[style].headRenderScale,eyes:style==='pixel'?spec.head.pixelEyes:spec.head.eyes});
  }
  await emit('pixel','tongue',tongueSvg(),{part:'tongue',assetFacing:spec.assetFacing,attachment:[.5,.20],headAnchor:[.5,.07],offsetY:-.13});
  const manifest=JSON.stringify({version:spec.version,status:spec.status,outputs},null,2)+'\n';
  for(const [name,text] of [['parts-preview.html',previewHtml()],['style-targets.html',targetsHtml()],['generated/snake-manifest.json',manifest]]){
    const file=path.join(root,name);if(check){if(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')!==text)throw new Error('Stale template: '+name);}else fs.writeFileSync(file,text);
  }
  return outputs;
}
module.exports={spec,parts,facingAngles,lightCenter,inside,partGrid,partSvg,eyesSvg,decorationSvg,tongueSvg,joinGeometry,pose,previewHtml,targetsHtml,build};
if(require.main===module){const args=process.argv.slice(2),index=args.indexOf('--sharp');if(index!==-1&&!args[index+1])throw new Error('Supply an installed sharp module path');build({sharpModule:index===-1?undefined:args[index+1],check:args.includes('--check')}).then(outputs=>console.log(`${args.includes('--check')?'CHECKED':'BUILT'}: ${outputs.length} body, head, tail and eye assets. Existing game unchanged.`)).catch(error=>{console.error(error);process.exitCode=1;});}
