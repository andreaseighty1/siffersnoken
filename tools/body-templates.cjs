// Geometry-first body templates. No existing game assets or settings are edited.
// node tools/body-templates.cjs [--sharp path/to/sharp] [--check]
const fs=require('node:fs');
const path=require('node:path');
const spec=require('../skin-templates/body-spec.json');
const themes=require('../skin-templates/themes.json');
const templateRoot=path.resolve(__dirname,'../skin-templates');
const generatedRoot=path.join(templateRoot,'generated');
const patterns=new Set(['none','strawberrySeeds','basketballSeams']);
// Git may check text assets out with CRLF on Windows. Compare logical source,
// while keeping deterministic LF output from the generator itself.
const readGenerated=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
// Asymmetric seed placement, never a row of large central dots.
const seeds=[[-.37,-.31],[.30,-.39],[-.27,.30],[.36,.26],[.02,-.01]];
function validateTheme(theme){
  if(!/^[a-z][a-z0-9-]*$/.test(theme.id))throw new Error('Invalid theme id');
  if(!patterns.has(theme.pattern))throw new Error('Unsupported pattern: '+theme.pattern);
  if(!['fixed','directional'].includes(theme.bodyOrientation))throw new Error('Invalid body orientation');
  for(const key of ['base','light','shade','edge','ink','detail']){
    if(!/^#[0-9a-f]{6}$/i.test(theme.palette?.[key]||''))throw new Error('Invalid palette color: '+key);
  }
}
function toyBody(theme){
  const size=spec.styles.toy.frame,c=size/2,r=size*spec.geometry.outerRadius,p=theme.palette;
  const lightId='toy-'+theme.id+'-matte',maskId='toy-'+theme.id+'-body';
  const pattern=theme.pattern==='strawberrySeeds'
    ?seeds.map(([x,y])=>`<ellipse cx="${c+x*r}" cy="${c+y*r}" rx="${r*.025}" ry="${r*.04}" fill="${p.detail}"/>`).join('')
    :theme.pattern==='basketballSeams'
      ?`<path d="M ${c} ${c-r} V ${c+r} M ${c-r} ${c} H ${c+r}" fill="none" stroke="${p.ink}" stroke-width="${r*.035}"/>`
      :'';
  // One diffuse matte light field; no shiny circular spot or grain texture.
  // Composite one complete opaque material, then apply the outer alpha mask ONCE.
  // Clipping each stroke separately would change alpha at antialiased seam ends.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><radialGradient id="${lightId}" cx="29%" cy="24%" r="85%"><stop offset="0" stop-color="${p.light}"/><stop offset=".48" stop-color="${p.base}"/><stop offset="1" stop-color="${p.shade}"/></radialGradient><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="white"/></mask></defs><g mask="url(#${maskId})"><rect width="${size}" height="${size}" fill="url(#${lightId})"/>${pattern}<circle cx="${c}" cy="${c}" r="${r-2}" fill="none" stroke="${p.edge}" stroke-opacity=".42" stroke-width="4"/></g></svg>`;
}
function pixelGrid(theme){
  const size=spec.styles.pixel.frame,c=size/2,r=size*spec.geometry.outerRadius,p=theme.palette;
  return Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
    const dx=x+.5-c,dy=y+.5-c,distance=Math.hypot(dx,dy);
    if(distance>r)return null;
    if(distance>r-1.1)return p.ink;
    let color=(dx+dy)/r>.4?p.shade:p.base;
    // A stepped, off-center upper-left highlight, not a dot on the middle row.
    if(dx>-r*.65&&dx<-r*.1&&dy>-r*.65&&dy<-r*.2&&dx+dy<-r*.55)color=p.light;
    if(theme.pattern==='strawberrySeeds'&&seeds.some(([sx,sy])=>
      Math.abs(dx-sx*r)<.55&&Math.abs(dy-sy*r)<.95))color=p.detail;
    if(theme.pattern==='basketballSeams'&&(x===16||y===16))color=p.ink;
    return color;
  }));
}
function pixelBody(theme){
  const grid=pixelGrid(theme),size=grid.length,rects=[];
  // Horizontal runs preserve the exact pixel grid and reduce SVG source size.
  for(let y=0;y<size;y++)for(let x=0;x<size;){
    const color=grid[y][x],start=x;while(x<size&&grid[y][x]===color)x++;
    if(color)rects.push(`<rect x="${start}" y="${y}" width="${x-start}" height="1" fill="${color}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
function bodySvg(style,theme){
  validateTheme(theme);
  if(style==='toy')return toyBody(theme);
  if(style==='pixel')return pixelBody(theme);
  throw new Error('Unknown style: '+style);
}
const escapeText=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function cornerPreview(style,theme){
  const size=spec.preview.cell*spec.preview.assetScale*spec.preview.overlap;
  const images=spec.preview.coordinates.map(([x,y])=>{
    const left=24+x*spec.preview.cell-size/2,top=24+y*spec.preview.cell-size/2;
    // Preview the actual exported bitmap. Fractionally scaled SVG row runs can
    // produce hairline gaps even though the native pixel WebP is correct.
    return `<img src="generated/${style}/${theme.id}-body.webp" alt="" style="position:absolute;left:${(left+24)/300*100}%;top:${(top+24)/185*100}%;width:${size/300*100}%;height:auto">`;
  });
  return `<div class="corner ${style}" role="img" aria-label="${escapeText(theme.label)}: rak kropp och sväng, utan huvud eller svans">${images.join('')}</div>`;
}
function previewHtml(){
  return `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SifferSnoken – fasta kroppsmallar</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f6f2e6;color:#183b35;font:16px system-ui,sans-serif;padding:24px}main{max-width:1040px;margin:auto}h1{font-size:28px;margin:0 0 8px}p{line-height:1.55}.intro{max-width:850px}.styles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.style{background:#fffaf0;border:1px solid #dedaca;border-radius:18px;padding:20px}.style h2{font-size:20px;margin:0 0 8px}.card{border-top:1px solid #dedaca;margin-top:18px;padding-top:12px}.card h3{font-size:16px;margin:0 0 8px}.samples{display:flex;gap:14px;align-items:center;background:#173f36;border-radius:12px;padding:10px}.samples img{width:82px;height:82px;object-fit:contain}.samples span{color:#eaf3db;font-size:13px}.pixel img{image-rendering:pixelated}.corner{display:block;width:100%;background:#173f36;border-radius:12px;margin-top:9px}.corner.pixel{image-rendering:pixelated}footer{margin-top:22px;font-size:14px}@media(max-width:640px){body{padding:14px}.styles{grid-template-columns:1fr}h1{font-size:24px}.style{padding:16px}}
    .corner{position:relative;aspect-ratio:300 / 185;overflow:hidden}
    </style><main><h1>SifferSnoken · fasta kroppsmallar</h1><p class="intro">Samma runda grundform och samma skin-tema i två stilar. Kropparna nedan är reproducerbara byggprover, inte kompletta skins och inte inkopplade i spelet. Svängarna visar hur kroppsdelarna möts utan att bollmönstret roteras.</p><div class="styles">${Object.entries(spec.styles).map(([style,def])=>`<section class="style ${style}"><h2>${def.label}</h2><p>${def.frame} × ${def.frame} · transparent WebP · ${style==='pixel'?'fast pixelrutnät, ingen utjämning':'matt ljus, mjuk kant'}</p>${themes.map(theme=>`<article class="card"><h3>${escapeText(theme.label)}</h3><div class="samples"><img src="generated/${style}/${theme.id}-body.webp" alt="${escapeText(theme.label)}, ${def.label}"><span>Fast kontur<br>Samma bild används längs hela kroppen</span></div>${cornerPreview(style,theme)}</article>`).join('')}</section>`).join('')}</div><footer>Huvudmall, ögon, svansmall och pixelanpassad spelrendering byggs i nästa steg. Befintliga modernbilder är orörda.</footer></main></html>`;
}
async function build({sharpModule,check=false}={}){
  const outputs=[];
  let sharp;
  if(sharpModule)sharp=require(path.resolve(sharpModule));
  for(const [style,def] of Object.entries(spec.styles)){
    for(const theme of themes){
      const svg=bodySvg(style,theme),folder=path.join(generatedRoot,style),file=path.join(folder,theme.id+'-body.svg');
      if(check){
        if(readGenerated(file)!==svg)throw new Error('Stale template: '+file);
      }else{
        fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(file,svg);
      }
      if(sharp&&!check)await sharp(Buffer.from(svg)).webp({lossless:true,alphaQuality:100,effort:6}).toFile(path.join(folder,theme.id+'-body.webp'));
      outputs.push({style,id:theme.id,frame:def.frame,bodyOrientation:theme.bodyOrientation,file:'generated/'+style+'/'+theme.id+'-body.webp'});
    }
  }
  const preview=previewHtml(),manifest=JSON.stringify({version:spec.version,status:spec.status,outputs},null,2)+'\n';
  for(const [name,contents] of [['preview.html',preview],['generated/manifest.json',manifest]]){
    const file=path.join(templateRoot,name);
    if(check){if(readGenerated(file)!==contents)throw new Error('Stale template: '+name);}
    else fs.writeFileSync(file,contents);
  }
  return outputs;
}
module.exports={spec,themes,seeds,bodySvg,pixelGrid,previewHtml,validateTheme,build};
if(require.main===module){
  const args=process.argv.slice(2),sharpIndex=args.indexOf('--sharp');
  if(sharpIndex!==-1&&!args[sharpIndex+1])throw new Error('Supply the path to the installed sharp module after --sharp');
  build({sharpModule:sharpIndex===-1?undefined:args[sharpIndex+1],check:args.includes('--check')})
    .then(outputs=>console.log(`${args.includes('--check')?'CHECKED':'BUILT'}: ${outputs.length} body templates (${sharpIndex===-1?'SVG sources; pass --sharp to export WebP':'SVG + lossless WebP'}). Existing game assets unchanged.`))
    .catch(error=>{console.error(error.message);process.exitCode=1;});
}
