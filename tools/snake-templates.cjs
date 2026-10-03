// Fixed head, tail and eye layers; builds both styles without changing the game.
const fs=require('node:fs'),path=require('node:path');
const body=require('./body-templates.cjs');
const spec=require('../skin-templates/snake-spec.json');
const root=path.resolve(__dirname,'../skin-templates');
const parts=['head-base','tail'];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headSeeds=[[.25,.64],[.54,.70],[.74,.57]];
const tailSeeds=[[.44,.31],[.55,.45],[.49,.62]];
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
function toyPart(theme,part){
  const size=body.spec.styles.toy.frame,p=theme.palette,id=`toy-${theme.id}-${part}`;
  // Continue the body's material field at the attachment chord instead of
  // starting a second bright highlight on the tail's flat base.
  const lightY=part==='tail'?(.24-.5-joinGeometry('toy').bodyChord/size+spec.tail.attachment[1])*100:24;
  const seeds=part==='tail'?tailSeeds:headSeeds;
  const pattern=theme.pattern==='strawberrySeeds'?seeds.map(([x,y])=>`<ellipse cx="${x*size}" cy="${y*size}" rx="${size*.012}" ry="${size*.023}" fill="${p.detail}"/>`).join('')
    :theme.pattern==='basketballSeams'?`<path d="M ${size*.5} 0 V ${size} M 0 ${size*.58} H ${size}" fill="none" stroke="${p.ink}" stroke-width="${size*.018}"/>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><radialGradient id="${id}-light" cx="29%" cy="${lightY}%" r="85%"><stop offset="0" stop-color="${p.light}"/><stop offset=".48" stop-color="${p.base}"/><stop offset="1" stop-color="${p.shade}"/></radialGradient><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><g fill="white">${contour(part,size)}</g></mask></defs><g mask="url(#${id}-mask)"><rect width="${size}" height="${size}" fill="url(#${id}-light)"/>${pattern}</g></svg>`;
}
function partGrid(theme,part){
  const size=body.spec.styles.pixel.frame,p=theme.palette;
  return Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
    const nx=(x+.5)/size,ny=(y+.5)/size;
    if(!inside(part,nx,ny))return null;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!inside(part,nx+dx/size,ny+dy/size)))return p.ink;
    let color=part==='tail'||nx+ny>1.16?p.shade:p.base;
    if(part!=='tail'&&nx>.23&&nx<.44&&ny>.20&&ny<.36&&nx+ny<.76)color=p.light;
    if(theme.pattern==='strawberrySeeds'&&(part==='tail'?tailSeeds:headSeeds).some(([sx,sy])=>Math.abs(nx-sx)<.022&&Math.abs(ny-sy)<.032))color=p.detail;
    if(theme.pattern==='basketballSeams'&&(x===16||y===18))color=p.ink;
    return color;
  }));
}
function gridSvg(grid){
  const size=grid.length,rects=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;){const start=x,color=grid[y][x];while(x<size&&grid[y][x]===color)x++;if(color)rects.push(`<rect x="${start}" y="${y}" width="${x-start}" height="1" fill="${color}"/>`);}
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
function partSvg(style,theme,part){
  body.validateTheme(theme);if(!parts.includes(part))throw new Error('Unknown part: '+part);
  if(style==='toy')return toyPart(theme,part);
  if(style==='pixel')return gridSvg(partGrid(theme,part));
  throw new Error('Unknown style: '+style);
}
function eyesSvg(style,blink=false){
  const size=body.spec.styles[style]?.frame;if(!size)throw new Error('Unknown style');
  const p=spec.eyesPalette;
  if(style==='toy')return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${spec.head.eyes.map(([x,y])=>blink?
    `<path d="M ${(x-.075)*size} ${y*size} Q ${x*size} ${(y+.035)*size} ${(x+.075)*size} ${y*size}" fill="none" stroke="${p.ink}" stroke-width="${size*.016}" stroke-linecap="round"/>`:
    `<ellipse cx="${x*size}" cy="${y*size}" rx="${size*.094}" ry="${size*.112}" fill="${p.white}" stroke="${p.ink}" stroke-width="${size*.009}"/><ellipse cx="${x*size}" cy="${(y-.018)*size}" rx="${size*.046}" ry="${size*.063}" fill="${p.ink}"/><circle cx="${(x-.018)*size}" cy="${(y-.044)*size}" r="${size*.017}" fill="${p.white}"/>`).join('')}</svg>`;
  const grid=Array.from({length:size},()=>Array(size).fill(null));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)for(const [ex,ey] of spec.head.eyes){
    const dx=x+.5-Math.round(ex*size),dy=y+.5-Math.round(ey*size);
    if(blink){if(Math.abs(dx)<=2.5&&Math.abs(dy)<=.5)grid[y][x]=p.ink;}
    else if((dx/3.5)**2+(dy/4)**2<=1){
      grid[y][x]=(dx/2.7)**2+(dy/3.2)**2>1?p.ink:p.white;
      if(Math.abs(dx)<=1.5&&dy>=-2.5&&dy<=.5)grid[y][x]=p.ink;
      if(dx===-.5&&dy===-2.5)grid[y][x]=p.white;
    }
  }
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
  return {draw,points,head,tailPivot:pivot,tailAngle:Math.atan2(dy,dx)*180/Math.PI-90,headAngle:90,join};
}
function snakePreview(style,theme,variant='corner',fade=false){
  const layout=pose(style,variant),[w,h]=spec.preview.frame;
  const image=(part,center,angle=0,alpha=1)=>`<img src="generated/${style}/${theme.id}-${part}.webp" alt="" style="left:${center[0]/w*100}%;top:${center[1]/h*100}%;width:${layout.draw/w*100}%;transform:translate(-50%,-50%) rotate(${angle}deg);opacity:${alpha}">`;
  const segments=layout.points.map((p,i)=>image('body',p,0,fade?Math.max(.35,1-(i+1)*.13):1)).reverse().join('');
  const tail=`<img src="generated/${style}/${theme.id}-tail.webp" alt="" style="left:${layout.tailPivot[0]/w*100}%;top:${layout.tailPivot[1]/h*100}%;width:${layout.draw/w*100}%;transform-origin:50% ${layout.join.baseY/body.spec.styles[style].frame*100}%;transform:translate(-50%,-${layout.join.baseY/body.spec.styles[style].frame*100}%) rotate(${layout.tailAngle}deg);opacity:${fade?Math.max(.35,1-layout.points.length*.13):1}">`;
  const eyes=`<img src="generated/${style}/eyes-open.webp" alt="" style="left:${layout.head[0]/w*100}%;top:${layout.head[1]/h*100}%;width:${layout.draw/w*100}%;transform:translate(-50%,-50%) rotate(${layout.headAngle}deg)">`;
  return `<div class="snake" role="img" aria-label="${esc(theme.label)}: ${variant==='straight'?'rak snok':'snok med sväng'}${fade?', nedtonad kropp och svans':''}">${tail}${segments}${image('head-base',layout.head,layout.headAngle)}${eyes}</div>`;
}
function previewHtml(){
  return `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SifferSnoken – huvud och svansmallar</title><style>
  *{box-sizing:border-box}body{margin:0;padding:24px;background:#f6f2e6;color:#183b35;font:16px system-ui,sans-serif}main{max-width:1080px;margin:auto}h1{font-size:27px;margin:0 0 12px}p{line-height:1.5}.styles{display:grid;grid-template-columns:1fr 1fr;gap:20px}.style{background:#fffaf0;border:1px solid #dedaca;border-radius:16px;padding:18px}h2{font-size:20px}h3{margin:12px 0}.card{border-top:1px solid #dedaca;padding-top:8px}.parts{display:flex;align-items:center;background:#173f36;border-radius:10px;padding:8px;gap:8px}.part{position:relative;width:25%;aspect-ratio:1}.part img{position:absolute;inset:0;width:100%}.snake{position:relative;aspect-ratio:324 / 252;background:#173f36;overflow:hidden;border-radius:12px;margin:8px 0 16px}.snake img{position:absolute;height:auto}.pixel img{image-rendering:pixelated}.caption{font-size:13px;margin:5px 0;color:#456057}.checks{display:grid;grid-template-columns:1fr 1fr;gap:12px}.checks .snake{margin:0}footer{font-size:14px;line-height:1.5;margin-top:20px}@media(max-width:640px){body{padding:12px}.styles{grid-template-columns:1fr}.style{padding:14px}h1{font-size:23px}}
  </style><main><h1>SifferSnoken · huvud, ögon och svansmallar</h1><p>Fasta proportioner i båda stilarna. Separata ögonlager, rundat huvud och smalt svansfäste på kroppens kant. Byggprover – ännu inte nya grafiklägen i spelet.</p><div class="styles">${Object.entries(body.spec.styles).map(([style,def])=>`<section class="style ${style}"><h2>${def.label}</h2><p>${def.frame} × ${def.frame} · transparent WebP</p>${body.themes.map(theme=>`<article class="card"><h3>${esc(theme.label.replace('kroppsmall','mall'))}</h3><div class="parts"><div class="part"><img src="generated/${style}/${theme.id}-head-base.webp" alt="Huvud"><img src="generated/${style}/eyes-open.webp" alt="Öppna ögon"></div><div class="part"><img src="generated/${style}/${theme.id}-body.webp" alt="Kropp"></div><div class="part"><img src="generated/${style}/${theme.id}-tail.webp" alt="Svans"></div><div class="part"><img src="generated/${style}/${theme.id}-head-base.webp" alt="Huvud"><img src="generated/${style}/eyes-blink.webp" alt="Blinkande ögon"></div></div><p class="caption">Huvud · kropp · svans · blinkning</p>${snakePreview(style,theme)}</article>`).join('')}<h3>Fäste och nedtoning</h3><div class="checks">${snakePreview(style,body.themes[1],'straight')}${snakePreview(style,body.themes[1],'corner',true)}</div><p class="caption">Rak snok samt samma nedtoning på sista kroppsdelen och svansen. Fästpunkten är rotationscentrum även för framtida vickning.</p></section>`).join('')}</div><footer>Öron/horn ska placeras i huvudets bakre zon, bakom ögonen. Mallarna kontrolleras här som tillgångar och statiska sammanfogningar; rörelse, mobilspelets pixelrutnät och långa snokar behöver fortfarande testas vid spelintegration. Befintliga skins är orörda.</footer></main></html>`;
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
    for(const theme of body.themes)for(const part of parts)await emit(style,theme.id+'-'+part,partSvg(style,theme,part),{id:theme.id,part,assetFacing:spec.assetFacing,...(part==='tail'?{attachment:joinGeometry(style).pivot}:{eyes:spec.head.eyes})});
    for(const blink of [false,true])await emit(style,'eyes-'+(blink?'blink':'open'),eyesSvg(style,blink),{part:'eyes-'+(blink?'blink':'open'),assetFacing:spec.assetFacing});
  }
  const manifest=JSON.stringify({version:spec.version,status:spec.status,outputs},null,2)+'\n';
  for(const [name,text] of [['parts-preview.html',previewHtml()],['generated/snake-manifest.json',manifest]]){
    const file=path.join(root,name);if(check){if(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')!==text)throw new Error('Stale template: '+name);}else fs.writeFileSync(file,text);
  }
  return outputs;
}
module.exports={spec,parts,inside,partGrid,partSvg,eyesSvg,joinGeometry,pose,previewHtml,build};
if(require.main===module){const args=process.argv.slice(2),index=args.indexOf('--sharp');if(index!==-1&&!args[index+1])throw new Error('Supply an installed sharp module path');build({sharpModule:index===-1?undefined:args[index+1],check:args.includes('--check')}).then(outputs=>console.log(`${args.includes('--check')?'CHECKED':'BUILT'}: ${outputs.length} body, head, tail and eye assets. Existing game unchanged.`)).catch(error=>{console.error(error);process.exitCode=1;});}
