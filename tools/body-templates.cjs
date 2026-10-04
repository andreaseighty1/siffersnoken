// Geometry-first body templates. No existing game assets or settings are edited.
// node tools/body-templates.cjs [--sharp path/to/sharp] [--check]
const fs=require('node:fs');
const path=require('node:path');
const spec=require('../skin-templates/body-spec.json');
const themes=require('../skin-templates/themes.json');
const snakeSpec=require('../skin-templates/snake-spec.json'),football=require('./football-panels.cjs');
const templateRoot=path.resolve(__dirname,'../skin-templates');
const generatedRoot=path.join(templateRoot,'generated');
const patterns=new Set(['none','strawberrySeeds','basketballSeams','emeraldInlay','candyBands','galaxyClouds','melonRind','footballPanels','sunsetWaves','electricCurrent','auroraRibbons','oceanFoam','magmaCracks','obsidianSheen','rosePetals','forestLeaves','nuclearFlux','plasmaStreams','brassMechanism','runestone','candyPrism','shadowVeils','tidalGlass','keeperInlay']);
// Git may check text assets out with CRLF on Windows. Compare logical source,
// while keeping deterministic LF output from the generator itself.
const readGenerated=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
// Asymmetric seed placement, never a row of large central dots.
const seeds=[[-.37,-.31],[.30,-.39],[-.27,.30],[.36,.26],[.02,-.01]];
function validateTheme(theme){
  if(!/^[a-z][a-z0-9-]*$/.test(theme.id))throw new Error('Invalid theme id');
  if(!patterns.has(theme.pattern))throw new Error('Unsupported pattern: '+theme.pattern);
  if(!['fixed','directional'].includes(theme.bodyOrientation))throw new Error('Invalid body orientation');
  if(theme.assetRevision!==undefined&&(!Number.isSafeInteger(theme.assetRevision)||theme.assetRevision<1))throw new Error('Invalid asset revision');
  if(theme.material!==undefined&&theme.material!=='gold')throw new Error('Unsupported material');
  if(theme.colorCycle&&(!Array.isArray(theme.colorCycle.hues)||theme.colorCycle.hues.length!==7||
    new Set(theme.colorCycle.hues).size!==7||theme.colorCycle.hues.some(h=>!Number.isInteger(h)||h<0||h>=360)||
    !Number.isFinite(theme.colorCycle.intervalMs)||theme.colorCycle.intervalMs<500))throw new Error('Invalid color cycle');
  for(const palette of [theme.palette,...(theme.pixelPalette?[theme.pixelPalette]:[]),...(theme.patternPalette?[theme.patternPalette]:[])])for(const key of ['base','light','shade','edge','ink','detail']){
    if(!/^#[0-9a-f]{6}$/i.test(palette?.[key]||''))throw new Error('Invalid palette color: '+key);
  }
}
// Soft sculpted material: a diffuse key light plus a separate curved rim.
// Shadows belong to rendering/preview, never to the silhouette's alpha mask.
function toyMaterial(p,id,size,{rx=spec.geometry.outerRadius,ry=rx,tail=false,lightCenter=[.38,.30],finish}={}){
  const defs=`<radialGradient id="${id}-matte" cx="${lightCenter[0]*100}%" cy="${lightCenter[1]*100}%" r="65%"><stop offset="0" stop-color="${p.light}"/><stop offset=".45" stop-color="${p.base}"/><stop offset=".85" stop-color="${p.shade}"/><stop offset="1" stop-color="${p.shade}"/></radialGradient><radialGradient id="${id}-rim" gradientUnits="userSpaceOnUse" cx="${size*.5}" cy="${size*.5}" r="${size*rx}" gradientTransform="translate(0 ${size*.5*(1-ry/rx)}) scale(1 ${ry/rx})"><stop offset=".50" stop-color="${p.shade}" stop-opacity="0"/><stop offset=".82" stop-color="${p.shade}" stop-opacity=".10"/><stop offset="1" stop-color="${p.shade}" stop-opacity=".36"/></radialGradient>`;
  const tailDefs=`<radialGradient id="${id}-tail-light" gradientUnits="userSpaceOnUse" cx="${size*.47}" cy="${size*.16}" r="${size*.43}"><stop offset="0" stop-color="${p.light}"/><stop offset=".42" stop-color="${p.base}"/><stop offset="1" stop-color="${p.shade}"/></radialGradient><linearGradient id="${id}-tail-rim"><stop offset=".29" stop-color="${p.edge}" stop-opacity=".6"/><stop offset=".46" stop-color="${p.edge}" stop-opacity="0"/><stop offset=".53" stop-color="${p.edge}" stop-opacity="0"/><stop offset=".71" stop-color="${p.edge}" stop-opacity=".6"/></linearGradient>`;
  const rect=fill=>`<rect width="${size}" height="${size}" fill="url(#${fill})"/>`;
  // Broad satin reflections, not a bright circular dot or a changed silhouette.
  const dx=(.5-lightCenter[0])*2,dy=(.5-lightCenter[1])*2;
  const satin=finish==='gold'?`<linearGradient id="${id}-satin" x1="${(.5-dx)*100}%" y1="${(.5-dy)*100}%" x2="${(.5+dx)*100}%" y2="${(.5+dy)*100}%"><stop offset=".12" stop-color="${p.detail}" stop-opacity=".10"/><stop offset=".25" stop-color="${p.detail}" stop-opacity=".48"/><stop offset=".43" stop-color="${p.detail}" stop-opacity="0"/><stop offset=".62" stop-color="${p.edge}" stop-opacity=".24"/><stop offset=".80" stop-color="${p.light}" stop-opacity=".22"/><stop offset="1" stop-color="${p.edge}" stop-opacity=".32"/></linearGradient>`:'';
  return {defs:(tail?tailDefs:defs)+satin,paint:(tail?rect(id+'-tail-light')+rect(id+'-tail-rim'):rect(id+'-matte')+rect(id+'-rim'))+(satin?rect(id+'-satin'):'')};
}
function pixelMaterial(p,dx,dy,rx,ry){
  const nx=dx/rx,ny=dy/ry,d=Math.hypot(nx,ny);
  if(d>1-1.1/Math.min(rx,ry))return p.ink;
  // Concentric lower-edge steps give volume, not a diagonal half-disk split.
  const lightDisk=Math.hypot(nx,ny+.22);
  let color=lightDisk<.76?p.light:lightDisk<.94?p.base:ny>.34?p.edge:p.shade;
  if(ny>.68&&lightDisk>=.76&&lightDisk<.97)color=p.shade;
  if((nx-.40)**2+(ny+.49)**2<.023&&d<.8)color=p.detail;
  return color;
}
// Small engraved gem motif, not a faceted/reshaped body silhouette.
function emeraldMark(part='body'){
  return part==='tail'?{cx:.5,cy:.30,rx:.075,ry:.105}:
    part==='head-base'?{cx:.5,cy:.70,rx:.16,ry:.16}:{cx:.5,cy:.5,rx:.21,ry:.25};
}
function emeraldSvg(p,size,part){
  const {cx,cy,rx,ry}=emeraldMark(part);
  return `<path d="M ${cx*size} ${(cy-ry)*size} L ${(cx+rx)*size} ${cy*size} L ${cx*size} ${(cy+ry)*size} L ${(cx-rx)*size} ${cy*size} Z M ${(cx-rx)*size} ${cy*size} H ${(cx+rx)*size} M ${cx*size} ${(cy-ry)*size} V ${(cy+ry)*size}" fill="none" stroke="${p.detail}" stroke-opacity=".32" stroke-width="${size*.011}" stroke-linejoin="round"/>`;
}
function emeraldPixel(x,y,size,part){
  const {cx,cy,rx,ry}=emeraldMark(part),dx=Math.abs((x+.5)/size-cx)/rx,dy=Math.abs((y+.5)/size-cy)/ry;
  return Math.abs(dx+dy-1)<.13||(dx<.10&&dy<.85)||(dy<.08&&dx<.85);
}
// These are surface designs, always composited before the common outer mask.
// Candy uses a shaded red material rather than opaque flat red strokes.
function candyBand(nx,ny){return (((nx-ny+.11)%.48)+.48)%.48<.21;}
function galaxyMarks(part){
  return part==='tail'?[[.50,.30,.018]]:part==='head-base'?[[.26,.64,.032],[.67,.74,.023],[.47,.84,.015]]:
    [[.28,.30,.042],[.69,.49,.027],[.39,.73,.020]];
}
function galaxyCloud(nx,ny,part){
  const cy=part==='tail'?.29:part==='head-base'?.70:.52;
  const rx=part==='tail'?.12:.38,ry=part==='tail'?.22:.20;
  const dx=nx-.5,dy=ny-cy;
  return ((dx*.82-dy*.57)/rx)**2+((dx*.57+dy*.82)/ry)**2;
}
function surfaceSvg(theme,size,part,lightCenter=[.38,.30]){
  if(['tidalGlass','keeperInlay'].includes(theme.pattern))return tideKeeperSvg(theme,size,part,lightCenter);
  if(['candyPrism','shadowVeils'].includes(theme.pattern))return mysteryCandySvg(theme,size,part,lightCenter);
  if(['brassMechanism','runestone'].includes(theme.pattern))return relicSvg(theme,size,part,lightCenter);
  if(['nuclearFlux','plasmaStreams'].includes(theme.pattern))return energySvg(theme,size,part,lightCenter);
  if(['rosePetals','forestLeaves'].includes(theme.pattern))return botanicalSvg(theme,size,part,lightCenter);
  if(['magmaCracks','obsidianSheen'].includes(theme.pattern))return stoneSvg(theme,size,part,lightCenter);
  if(theme.pattern==='sunsetWaves')return sunsetSvg(theme,size,part,lightCenter);
  if(theme.pattern==='electricCurrent')return lightningSvg(theme,size,part);
  if(['auroraRibbons','oceanFoam'].includes(theme.pattern))return ribbonSvg(theme,size,part,lightCenter);
  if(theme.pattern==='melonRind')return melonSvg(theme,size,part,lightCenter);
  if(theme.pattern==='footballPanels')return footballSvg(theme,size,part,lightCenter);
  if(!['candyBands','galaxyClouds'].includes(theme.pattern))return {defs:'',paint:''};
  const id=`${theme.id}-${part}-surface`,p=theme.patternPalette||theme.palette;
  if(theme.pattern==='candyBands'){
    const red=toyMaterial(p,id,size,{tail:part==='tail',lightCenter});
    const bands=Array.from({length:8},(_,i)=>{
      const offset=(i-3)*.48-.005;
      return `<path d="M ${(offset-.2)*size} ${-.2*size} L ${(offset+1.2)*size} ${1.2*size}" stroke="white" stroke-width="${size*.21/Math.SQRT2}"/>`;
    }).join('');
    return {defs:red.defs+`<mask id="${id}-bands" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${bands}</mask>`,paint:`<g mask="url(#${id}-bands)">${red.paint}</g>`};
  }
  const cy=part==='tail'?.29:part==='head-base'?.70:.52,rx=part==='tail'?.12:.38,ry=part==='tail'?.22:.20;
  const defs=`<radialGradient id="${id}-violet"><stop stop-color="${p.base}" stop-opacity=".95"/><stop offset=".45" stop-color="${p.base}" stop-opacity=".65"/><stop offset="1" stop-color="${p.base}" stop-opacity="0"/></radialGradient><radialGradient id="${id}-cyan"><stop stop-color="${p.light}" stop-opacity=".85"/><stop offset="1" stop-color="${p.light}" stop-opacity="0"/></radialGradient>`;
  const cloud=`<ellipse cx="${size*.5}" cy="${size*cy}" rx="${size*rx}" ry="${size*ry}" transform="rotate(-35 ${size*.5} ${size*cy})" fill="url(#${id}-violet)"/><ellipse cx="${size*.55}" cy="${size*(cy-.06)}" rx="${size*rx*.75}" ry="${size*ry*.7}" transform="rotate(-35 ${size*.55} ${size*(cy-.06)})" fill="url(#${id}-cyan)"/>`;
  const stars=galaxyMarks(part).map(([x,y,r])=>`<path d="M ${x*size} ${(y-r)*size} L ${(x+r*.28)*size} ${(y-r*.28)*size} L ${(x+r)*size} ${y*size} L ${(x+r*.28)*size} ${(y+r*.28)*size} L ${x*size} ${(y+r)*size} L ${(x-r*.28)*size} ${(y+r*.28)*size} L ${(x-r)*size} ${y*size} L ${(x-r*.28)*size} ${(y-r*.28)*size} Z" fill="${theme.palette.detail}"/>`).join('');
  return {defs,paint:cloud+stars};
}
function surfacePixel(theme,x,y,size,part,color){
  const p=theme.pixelPalette||theme.palette,nx=(x+.5)/size,ny=(y+.5)/size;
  if(theme.pattern==='melonRind'){
    const radius=melonRadius(nx,ny,part);
    if(color===p.ink)return color;
    if(radius>.85)return p.edge;
    if(radius>.76)return p.detail;
    if(melonSeeds(part).some(([sx,sy])=>Math.hypot(nx-sx,ny-sy)<(part==='tail'?.027:.037)))return p.ink;
    // The red disk is smaller than the full body. Keep its own rounded steps
    // instead of letting the green rind replace all of the original shading.
    if(radius>.66)return color===p.light||color===p.detail?p.base:p.shade;
    if(radius>.50&&color===p.light)return p.base;
    return color===p.edge||color===p.ink?p.shade:color===p.detail?p.light:color;
  }
  if(color===p.ink)return color;
  if(theme.pattern==='tidalGlass'||theme.pattern==='keeperInlay'){
    const tide=theme.pattern==='tidalGlass',[u,v]=tide?surfaceCoordinates(nx,ny,part):motifCoordinates(nx,ny,part);
    if(!tide&&part==='head-base'&&ny<snakeSpec.head.decorationMinimumY)return color;
    if(tide){
      const distance=Math.min(...tidePaths.map(line=>openPathDistance(line,u,v)));
      if(distance<.015)return p.detail;
      if(distance<.038)return p.edge;
      if(distance<.103)return color===p.shade||color===p.edge?p.base:p.light;
      return color===p.detail?p.light:color;
    }
    if(part==='head-base'&&keeperGem.some(shape=>football.contains(shape,u,v)))return p.detail;
    if(keeperIvory.some(shape=>football.contains(shape,u,v)))return color===p.shade||color===p.edge?p.light:p.edge;
    const distance=Math.min(...keeperRails.map(line=>openPathDistance(line,u,v)));
    if(distance<.018)return p.edge;
    if(distance<.048)return p.light;
    return color===p.light||color===p.detail?p.base:color===p.edge?p.shade:color;
  }
  if(theme.pattern==='candyPrism'||theme.pattern==='shadowVeils'){
    const [u,v]=surfaceCoordinates(nx,ny,part);
    if(theme.pattern==='candyPrism'){
      const face=prismFaces.findIndex(points=>football.contains(points,u,v));
      if(prismGlints.some(line=>openPathDistance(line,u,v)<.014))return p.detail;
      // Six colors, including the shared outline. The lower arc preserves
      // rounded volume rather than presenting a flat tessellated disk.
      if(part==='body'&&Math.hypot(u-.5,v-.42)>.38&&v>.64)return p.shade;
      return face<0?p.shade:[p.light,p.base,p.edge,p.light,p.base,p.shade][face];
    }
    const veil=shadowVeils.findIndex(points=>football.contains(points,u,v));
    if(shadowEdges.some(line=>openPathDistance(line,u,v)<.018))return p.detail;
    if(veil>=0)return color===p.edge||color===p.shade?p.base:veil===0?p.light:p.edge;
    return color===p.detail?p.light:color===p.light?p.base:color;
  }
  if(theme.pattern==='brassMechanism'||theme.pattern==='runestone'){
    const [u,v]=relicCoordinates(nx,ny,part);
    if(theme.pattern==='brassMechanism'){
      if(openPathDistance(clockTrace,u,v)<.023)return p.edge;
      for(const gear of clockGears){
        const r=Math.hypot(u-gear.x,v-gear.y),angle=Math.atan2(v-gear.y,u-gear.x);
        if(football.contains(gear.points,u,v)){
          if(r<gear.r*.30)return p.ink;
          if(r<gear.r*.58&&Math.abs(Math.sin(angle*3))>.28)return p.shade;
          return r>gear.r*.76?p.detail:p.light;
        }
      }
      if(openPathDistance(clockBridge,u,v)<.048)return color===p.shade||color===p.edge?p.base:p.light;
      return color===p.edge?p.shade:color===p.light||color===p.detail?p.base:color;
    }
    const rune=Math.min(...runeStrokes.map(line=>openPathDistance(line,u,v)));
    if(rune<.017)return p.detail;
    if(rune<.043)return p.edge;
    if(rune<.068)return p.ink;
    if(runeCracks.some(line=>openPathDistance(line,u,v)<.018))return p.ink;
    if(runeChips.some(shape=>football.contains(shape,u,v)))return p.shade;
  }
  if(theme.pattern==='nuclearFlux'||theme.pattern==='plasmaStreams'){
    const [u,v]=surfaceCoordinates(nx,ny,part),nuclear=theme.pattern==='nuclearFlux';
    const paths=nuclear?nuclearPaths:plasmaPaths;
    const distances=paths.map(points=>openPathDistance(points,u,v));
    // Nuclear has toxic green channels in dark material; Plasma has broad
    // intertwined cyan/pink ribbons, not the former thin DNA-like sine pair.
    const cyan=Math.min(...distances.filter((_,i)=>nuclear||i%2===0));
    const pink=nuclear?Infinity:Math.min(...distances.filter((_,i)=>i%2===1));
    if(part==='head-base'&&nuclear&&radiationMark.some(shape=>football.contains(shape,nx,ny)))return p.edge;
    if(cyan<.020||pink<.014)return p.detail;
    if(nuclear&&cyan<.052)return p.edge;
    if(pink<.085)return p.edge;
    if(cyan<(nuclear?.10:.095))return p.light;
    return color===p.light||color===p.detail?p.base:color===p.edge?p.shade:color;
  }
  if(theme.pattern==='rosePetals'||theme.pattern==='forestLeaves'){
    const [u,v]=motifCoordinates(nx,ny,part),rose=theme.pattern==='rosePetals';
    if(rose){
      const petal=roseShapes.findIndex(points=>football.contains(points,u,v));
      if(petal>=0){
        if(openPathDistance([...roseShapes[petal],roseShapes[petal][0]],u,v)<.022)return p.detail;
        return color===p.edge||color===p.shade?p.base:p.edge;
      }
      // A pink motif must not recolor the rounded dark underside outside petals.
      return color===p.edge?p.shade:color;
    }
    if(forestVeins.some(points=>openPathDistance(points,u,v)<.019))return p.detail;
    if(forestShapes.some(points=>football.contains(points,u,v)))return color===p.shade||color===p.edge?p.base:p.light;
    if(openPathDistance(forestStem,u,v)<.021)return p.shade;
  }
  if(theme.pattern==='magmaCracks'){
    const [u,v]=surfaceCoordinates(nx,ny,part),distance=Math.min(...magmaPaths.map(points=>openPathDistance(points,u,v)));
    if(distance<.023)return p.detail;
    if(distance<.061)return p.edge;
  }
  if(theme.pattern==='obsidianSheen'){
    const [u,v]=surfaceCoordinates(nx,ny,part);
    if(obsidianFaces.some(face=>football.contains(face,u,v)))return p.light;
    if(obsidianGlints.some(points=>openPathDistance(points,u,v)<.021))return p.detail;
  }
  if(theme.pattern==='sunsetWaves'){
    const [u,v]=motifCoordinates(nx,ny,part);
    if(v>waveY(u))return v>.83?p.shade:p.edge;
    if(sunsetSun(u,v)&&!sunsetCut(v))return p.detail;
  }
  if(theme.pattern==='electricCurrent'){
    const distance=Math.min(...electricPaths(part).map(points=>openPathDistance(points,nx,ny)));
    if(distance<.034)return p.detail;
    if(distance<.095&&color!==p.edge&&color!==p.shade)return p.light;
  }
  if(theme.pattern==='auroraRibbons'||theme.pattern==='oceanFoam'){
    const [u,v]=surfaceCoordinates(nx,ny,part),aurora=theme.pattern==='auroraRibbons';
    const distances=[0,1,2].map(i=>Math.abs(v-ribbonY(u,i,aurora)));
    if(aurora){
      if(distances[1]<.047)return p.detail;
      if(distances[0]<.055||distances[2]<.045)return p.edge;
      if(distances[0]<.10&&color!==p.edge&&color!==p.shade)return p.light;
    }else{
      if(Math.min(...distances)<.026)return p.detail;
      if(Math.min(...distances)<.073&&color!==p.edge&&color!==p.shade)return p.light;
    }
  }
  if(theme.pattern==='footballPanels'){
    const {cx,cy,rx,ry}=panelFrame(part),px=(nx-cx)/rx,py=(ny-cy)/ry;
    if(football.panels.some(panel=>panel.black&&football.contains(panel.points,px,py)))return color===p.light||color===p.detail?p.edge:p.ink;
    if(football.panels.some(panel=>football.distance(panel.points,px,py)<.030))return p.shade;
  }
  if(theme.pattern==='candyBands'){
    if(candyBand(nx,ny))return color===p.light||color===p.detail?p.detail:color===p.base?p.edge:p.ink;
    // White underside stays white; red lower shading is reserved for red bands.
    return color===p.edge?p.shade:color===p.detail?p.light:color;
  }
  if(theme.pattern==='galaxyClouds'){
    const cloud=galaxyCloud(nx,ny,part);
    if(cloud<.45)color=p.light;else if(cloud<1&&color!==p.edge)color=p.base;
    if(galaxyMarks(part).some(([sx,sy,r])=>{
      const dx=Math.abs(nx-sx)*size,dy=Math.abs(ny-sy)*size;
      return dx+dy<Math.max(1,r*size*1.7);
    }))color=p.detail;
  }
  return color;
}
// Theme-local coordinates: head motifs are in the rear zone, behind the eyes;
// tail motifs shrink with the existing narrow attachment. No geometry changes.
function motifCoordinates(nx,ny,part){
  return part==='head-base'?[(nx-.5)/.82+.5,(ny-.60)/.36]:
    part==='tail'?[(nx-.5)/.32+.5,(ny-.125)/.40]:[nx,ny];
}
function motifFrame(part){return part==='head-base'?{x:.09,y:.60,w:.82,h:.36}:part==='tail'?{x:.34,y:.125,w:.32,h:.40}:{x:0,y:0,w:1,h:1};}
// Sample curves once at build time. Both styles use the same botanical shapes,
// with a shaded toy material and a native six-color pixel interpretation.
function cubicPoints(a,b,c,d){
  return Array.from({length:25},(_,i)=>{
    const t=i/24,s=1-t;return [0,1].map(k=>s*s*s*a[k]+3*s*s*t*b[k]+3*s*t*t*c[k]+t*t*t*d[k]);
  });
}
function petalShape(a,b,c,d,e,f){return cubicPoints(a,b,c,d).concat(cubicPoints(d,e,f,a).slice(1));}
const roseShapes=[
  petalShape([.00,.50],[-.06,.07],[.52,-.01],[.77,.34],[.46,.13],[.28,.35]),
  petalShape([.43,.13],[1.02,.13],[1.09,.76],[.60,1.05],[.91,.56],[.78,.33]),
  petalShape([.91,.52],[.78,1.10],[-.01,1.02],[.06,.40],[.31,.83],[.64,.77]),
  petalShape([.29,.53],[.24,.18],[.74,.21],[.73,.59],[.60,.37],[.43,.37])
];
const forestStem=[[.25,.79],[.41,.61],[.55,.45],[.69,.28],[.76,.15]];
const forestVeins=[[[.41,.61],[.17,.40]],[[.55,.45],[.36,.18]],[[.41,.61],[.73,.72]],[[.55,.45],[.84,.51]],[[.69,.28],[.76,.15]]];
function leafShape([a,b],width){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),sides=[];
  for(const side of [1,-1]){
    const points=Array.from({length:17},(_,i)=>{
      const t=i/16,w=Math.sin(Math.PI*t)*width*side;
      return [a[0]+dx*t-dy/len*w,a[1]+dy*t+dx/len*w];
    });sides.push(side===1?points:points.reverse());
  }
  return sides.flat();
}
const forestShapes=forestVeins.map((vein,i)=>leafShape(vein,i===4?.053:.067));
function botanicalSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,rose=theme.pattern==='rosePetals',f=motifFrame(part),p=theme.patternPalette;
  const pt=([u,v])=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`;
  const d=points=>'M '+points.map(pt).join(' L ');
  const shapes=rose?roseShapes:forestShapes,material=toyMaterial(p,id,size,{tail:part==='tail',lightCenter});
  const fills=shapes.map(points=>`<path d="${d(points)} Z" fill="white"/>`).join('');
  const mask=`<mask id="${id}-botanical" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${fills}</mask>`;
  const stroke=(points,width,color,opacity)=>`<path d="${d(points)}" fill="none" stroke="${color}" stroke-width="${size*width*f.w}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const lines=rose?shapes.map(points=>stroke(points,.008,p.detail,.60)).join(''):
    stroke(forestStem,.018,theme.palette.edge,.80)+forestVeins.map(points=>stroke(points,.010,p.detail,.82)).join('');
  return {defs:material.defs+mask,paint:`<g mask="url(#${id}-botanical)">${material.paint}</g>`+lines};
}
function waveY(u){return .65+.045*Math.sin((u-.12)*Math.PI*2);}
function sunsetSun(u,v){return Math.hypot(u-.44,v-.35)<.19;}
function sunsetCut(v){return v>.36&&v<.385||v>.435&&v<.46;}
function sunsetSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,f=motifFrame(part);
  const ocean=toyMaterial(theme.patternPalette,id+'-ocean',size,{tail:part==='tail',lightCenter});
  const sun=toyMaterial({base:'#ffad55',light:'#ffe9a2',shade:'#e57546',edge:'#ba5550'},id+'-sun',size,{tail:part==='tail',lightCenter});
  const pt=(u,v)=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`;
  const wave=Array.from({length:65},(_,i)=>pt(i/64,waveY(i/64))).join(' L ');
  const waveShape=`<path d="M ${wave} L ${pt(1,1.5)} L ${pt(0,1.5)} Z" fill="white"/>`;
  const sunShape=`<ellipse cx="${size*(f.x+.44*f.w)}" cy="${size*(f.y+.35*f.h)}" rx="${size*.19*f.w}" ry="${size*.19*f.h}" fill="white"/>`;
  const cuts=[[.36,.385],[.435,.46]].map(([a,b])=>`<rect x="0" y="${size*(f.y+a*f.h)}" width="${size}" height="${size*(b-a)*f.h}" fill="black"/>`).join('');
  const mask=(name,shape)=>`<mask id="${id}-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${shape}</mask>`;
  const crest=`<path d="M ${wave}" fill="none" stroke="${theme.patternPalette.light}" stroke-opacity=".48" stroke-width="${size*.012}"/>`;
  return {defs:ocean.defs+sun.defs+mask('sun',sunShape+cuts)+mask('wave',waveShape),paint:`<g mask="url(#${id}-sun)">${sun.paint}</g><g mask="url(#${id}-wave)">${ocean.paint}</g>`+crest};
}
// Whole-surface lightning: the material itself is electric yellow-white.
// Open, branched paths cross the silhouette; there is no enclosed bolt badge.
function electricPaths(part){
  if(part==='tail')return [[[.50,.10],[.45,.20],[.54,.27],[.48,.37],[.51,.55]],[[.54,.27],[.62,.31],[.65,.42]]];
  const paths=[[[-.12,.49],[.18,.49],[.32,.28],[.42,.55],[.56,.40],[.68,.70],[.81,.49],[1.12,.49]],
    [[.42,.55],[.28,.73],[.18,.84]],[[.56,.40],[.70,.18],[.84,.08]],[[.68,.70],[.76,.86],[.88,.96]]];
  // The head source faces up. Rotate its flow so the right-facing head joins
  // the horizontal body, while all head masks/lighting variants stay fixed.
  return part==='head-base'?paths.map(points=>points.map(([x,y])=>[y,1-x])):paths;
}
function openPathDistance(points,x,y){
  let distance=Infinity;
  for(let i=1;i<points.length;i++){
    const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
    if(dx===0&&dy===0)continue; // Sampled closed curves can repeat the first point.
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
    distance=Math.min(distance,Math.hypot(x-ax-t*dx,y-ay-t*dy));
  }
  return distance;
}
function lightningSvg(theme,size,part){
  const id=`${theme.id}-${part}-surface`,p=theme.palette;
  const paths=electricPaths(part).map(points=>'M '+points.map(([x,y])=>`${size*x},${size*y}`).join(' L '));
  const strokes=(width,color,opacity)=>paths.map(d=>`<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${size*width}" stroke-linejoin="miter" stroke-linecap="round"/>`).join('');
  // These nested broad strokes create a baked, soft energy halo. The common
  // alpha mask clips it, and the shared sculpted material remains underneath.
  return {defs:`<!-- ${id}: full-surface electric flow -->`,paint:strokes(.19,p.light,.20)+strokes(.12,p.light,.40)+strokes(.067,p.detail,.86)+strokes(.024,p.detail,1)};
}
function surfaceCoordinates(nx,ny,part){return part==='tail'?[(nx-.34)/.32,(ny-.125)/.40]:[nx,ny];}
// Tideglass uses large curling currents, not Hav's straight foam bands.
// Museum Keeper has open brass inlays and off-center porcelain fans: neither
// theme introduces a central badge or changes any body/head/tail contour.
const tidePaths=[
  cubicPoints([-.12,.18],[.48,-.02],[.15,.64],[1.12,.45]),
  cubicPoints([-.12,.65],[.26,1.02],[.75,.12],[1.12,.79])
];
const keeperRails=[
  [[-.12,.82],[.26,.66],[.40,.25],[.81,.10],[1.12,.29]],
  [[.03,1.08],[.51,.88],[.68,.43],[1.12,.28]],
  [[.14,.31],[.26,.19],[.42,.15]],
  [[.69,.85],[.86,.75],[.93,.61]]
];
const keeperIvory=[
  [[.16,.50],[.19,.30],[.35,.21],[.29,.39]],
  [[.08,.35],[.16,.20],[.26,.15],[.21,.27]],
  [[.72,.57],[.86,.49],[.88,.69],[.70,.78]]
];
const keeperGem=[[[.45,.34],[.56,.47],[.45,.60],[.34,.47]]];
function tideKeeperSvg(theme,size,part,lightCenter){
  const tide=theme.pattern==='tidalGlass',tail=part==='tail',id=`${theme.id}-${part}-surface`;
  const f=tide?(tail?{x:.34,y:.125,w:.32,h:.40}:{x:0,y:0,w:1,h:1}):motifFrame(part);
  const point=([u,v])=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`,data=points=>'M '+points.map(point).join(' L ');
  const stroke=(points,width,color,opacity=1)=>`<path d="${data(points)}" fill="none" stroke="${color}" stroke-width="${size*width*f.w}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const mask=(name,shape)=>`<mask id="${id}-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${shape}</mask>`;
  const material=toyMaterial(theme.patternPalette,id,size,{tail,lightCenter});
  if(tide){
    const shape=tidePaths.map(line=>stroke(line,.195,'white')).join('');
    const crests=tidePaths.map(line=>stroke(line,.045,theme.patternPalette.light,.60)+stroke(line,.012,theme.palette.detail,.78)).join('');
    return {defs:material.defs+mask('currents',shape),paint:`<g mask="url(#${id}-currents)">${material.paint}</g>`+crests};
  }
  const rails=keeperRails.map(line=>stroke(line,.089,'white')).join('');
  const ivory=toyMaterial({base:'#efdfb8',light:'#fff8e6',shade:'#b4976b',edge:'#7f6f52'},id+'-ivory',size,{tail,lightCenter});
  const porcelain=keeperIvory.map(shape=>`<path d="${data(shape)} Z" fill="white"/>`).join('');
  const grooves=keeperRails.map(line=>stroke(line,.11,theme.palette.edge,.65)).join('');
  const relief=keeperRails.map(line=>stroke(line,.016,theme.palette.detail,.82)).join('');
  const gem=part==='head-base'?keeperGem.map(shape=>`<path d="${data(shape)} Z" fill="${theme.patternPalette.detail}" stroke="${theme.palette.detail}" stroke-width="${size*.010*f.w}"/>`).join(''):'';
  return {defs:material.defs+ivory.defs+mask('rails',rails)+mask('porcelain',porcelain),paint:grooves+`<g mask="url(#${id}-rails)">${material.paint}</g>`+relief+`<g mask="url(#${id}-porcelain)">${ivory.paint}</g>`+gem};
}
// Large candy facets are surface patches, not a changed polygonal silhouette.
// The off-center junction avoids a repeated central jewel/emblem row.
const prismFaces=[
  [[-.2,-.2],[.68,-.2],[.42,.46],[-.2,.66]],
  [[.68,-.2],[1.2,-.2],[1.2,.48]],
  [[1.2,.48],[1.2,1.2],[.77,1.2],[.42,.46]],
  [[.42,.46],[.77,1.2],[.17,1.2]],
  [[-.2,.66],[.42,.46],[.17,1.2],[-.2,1.2]],
  [[.42,.46],[.68,-.2],[1.2,.48]]
];
const prismGlints=[[[.18,.24],[.39,.18],[.53,.12]],[[.68,.65],[.78,.79]]];
const shadowEdges=[
  cubicPoints([-.15,.28],[.37,-.06],[.64,.22],[.43,.48]),
  cubicPoints([.43,.48],[.22,.75],[.67,1.05],[1.15,.68]),
  cubicPoints([.24,1.10],[.30,.64],[1.05,.70],[1.10,.26])
];
const shadowVeils=[
  [...shadowEdges[0],...shadowEdges[1].slice(1),...cubicPoints([1.15,.68],[.65,1.30],[.03,.72],[.32,.40]).slice(1),...cubicPoints([.32,.40],[.58,.10],[.16,.14],[-.15,.28]).slice(1)],
  [...shadowEdges[2],...cubicPoints([1.10,.26],[1.06,.98],[.50,.80],[.24,1.10]).slice(1)]
];
function mysteryCandySvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,tail=part==='tail',f=tail?{x:.34,y:.125,w:.32,h:.40}:{x:0,y:0,w:1,h:1};
  const point=([u,v])=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`;
  const data=points=>'M '+points.map(point).join(' L ');
  const path=(points,color,width,opacity)=>`<path d="${data(points)}" fill="none" stroke="${color}" stroke-width="${size*width*f.w}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const candy=theme.pattern==='candyPrism',shapes=candy?prismFaces:shadowVeils;
  const candyPalettes=[
    {base:'#66dce0',light:'#c5fff3',shade:'#278da8',edge:'#286b89'},
    {base:'#f886c4',light:'#ffd4e5',shade:'#b3458d',edge:'#7e386e'},
    {base:'#ffce79',light:'#fff2c1',shade:'#d7904b',edge:'#93613b'},
    {base:'#85d5ec',light:'#defbf9',shade:'#4d8eb3',edge:'#48658f'},
    {base:'#ed91ca',light:'#ffdeec',shade:'#a45a9d',edge:'#70466d'},
    theme.palette
  ];
  let defs='',paint='';
  shapes.forEach((points,i)=>{
    const name=`${id}-${i}`,material=toyMaterial(candy?candyPalettes[i]:theme.patternPalette,name,size,{tail,lightCenter});
    defs+=material.defs+`<mask id="${name}-patch" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><path d="${data(points)} Z" fill="white"/></mask>`;
    paint+=`<g mask="url(#${name}-patch)">${material.paint}</g>`;
  });
  const edges=candy?prismGlints:shadowEdges;
  // Broad translucent seams provide a soft bevel; no sharp new contour,
  // microtexture, central symbols or runtime glow/animation are introduced.
  for(const line of edges)paint+=path(line,theme.palette.detail,candy ? .040 : .070,.12)+path(line,theme.palette.detail,.010,candy ? .70 : .72);
  return {defs,paint};
}
// Relic themes have their own surface details, never their own silhouettes.
// The rear head motif is compact; it cannot drift into the eye zone.
function relicFrame(part){return part==='head-base'?{x:.20,y:.60,w:.60,h:.34}:motifFrame(part);}
function relicCoordinates(nx,ny,part){const f=relicFrame(part);return [(nx-f.x)/f.w,(ny-f.y)/f.h];}
function gearShape(x,y,r,teeth=10){
  const points=Array.from({length:teeth*4},(_,i)=>{
    const a=i/(teeth*4)*Math.PI*2,outer=i%4===1||i%4===2,rad=r*(outer?1:.80);
    return [x+Math.cos(a)*rad,y+Math.sin(a)*rad];
  });
  return {x,y,r,points};
}
const clockGears=[gearShape(.21,.27,.235,10),gearShape(.79,.73,.245,11)];
const clockBridge=[[.13,.62],[.28,.69],[.70,.30],[.86,.37]];
const clockTrace=[[.36,.14],[.54,.22],[.62,.40],[.43,.60],[.48,.78],[.64,.88]];
const runeStrokes=[[[.36,.23],[.36,.79]],[[.36,.23],[.67,.40],[.36,.52]],[[.36,.52],[.68,.78]]];
const runeCracks=[[[.05,.35],[.19,.43],[.13,.59],[.23,.70],[.16,.96]],[[.88,.10],[.78,.25],[.89,.37],[.80,.50],[1.04,.58]]];
const runeChips=[[[.09,.57],[.24,.68],[.16,.89],[.05,.79]],[[.78,.23],[.91,.14],[.94,.34],[.85,.41]]];
function relicSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,f=relicFrame(part),p=theme.patternPalette,clock=theme.pattern==='brassMechanism';
  const point=([u,v])=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`;
  const data=points=>'M '+points.map(point).join(' L ');
  const stroke=(points,width,color,opacity=1)=>`<path d="${data(points)}" fill="none" stroke="${color}" stroke-width="${size*width*f.w}" stroke-opacity="${opacity}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const mask=shape=>`<mask id="${id}-relief" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${shape}</mask>`;
  const material=toyMaterial(p,id,size,{tail:part==='tail',lightCenter});
  if(clock){
    const gears=clockGears.map(g=>`<path d="${data(g.points)} Z" fill="white"/>`).join('');
    const bridge=stroke(clockBridge,.082,'white');
    const gearDetails=clockGears.map(g=>{
      const ellipse=(r,fill,strokeColor,width)=>`<ellipse cx="${size*(f.x+g.x*f.w)}" cy="${size*(f.y+g.y*f.h)}" rx="${size*r*f.w}" ry="${size*r*f.h}" fill="${fill}" stroke="${strokeColor}" stroke-width="${size*width*f.w}"/>`;
      const spokes=Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return stroke([[g.x,g.y],[g.x+Math.cos(a)*g.r*.68,g.y+Math.sin(a)*g.r*.68]],.022,p.base);}).join('');
      return ellipse(g.r*.59,theme.palette.shade,p.edge,.015)+spokes+ellipse(g.r*.23,theme.palette.ink,p.light,.013)+`<path d="${data(g.points)} Z" fill="none" stroke="${p.light}" stroke-opacity=".76" stroke-width="${size*.008*f.w}"/>`;
    }).join('');
    const power=stroke(clockTrace,.085,p.detail,.12)+stroke(clockTrace,.030,theme.palette.ink)+stroke(clockTrace,.015,p.detail,.94);
    return {defs:material.defs+mask(gears+bridge),paint:`<g mask="url(#${id}-relief)">${material.paint}</g>`+gearDetails+power};
  }
  const grooves=runeStrokes.map(line=>stroke(line,.104,theme.palette.edge,.95)).join('');
  const glow=runeStrokes.map(line=>stroke(line,.14,p.base,.15)).join('');
  const relief=runeStrokes.map(line=>stroke(line,.073,'white')).join('');
  const cores=runeStrokes.map(line=>stroke(line,.020,p.detail,.90)).join('');
  const cracks=runeCracks.map(line=>stroke(line,.013,theme.palette.ink,.82)).join('');
  const chips=runeChips.map(shape=>`<path d="${data(shape)} Z" fill="${theme.palette.shade}" fill-opacity=".48"/>`+stroke(shape.slice(0,2),.007,theme.palette.light,.56)).join('');
  return {defs:material.defs+mask(relief),paint:chips+cracks+glow+grooves+`<g mask="url(#${id}-relief)">${material.paint}</g>`+cores};
}
// Open, asymmetric curves are sampled only during the asset build. No rings,
// central round badges, silhouette changes or per-frame glow calculations.
const nuclearPaths=[
  cubicPoints([-.12,.80],[.23,-.07],[.52,.95],[1.12,.28]),
  cubicPoints([.12,-.12],[.24,.36],[.85,.28],[.72,1.12]),
  cubicPoints([.49,.42],[.63,.57],[.20,.71],[.16,1.08]),
  cubicPoints([.69,.58],[.95,.72],[.91,.89],[1.10,.87])
];
const plasmaPaths=[
  cubicPoints([-.12,.78],[.10,-.14],[.65,.19],[1.12,.63]),
  cubicPoints([-.10,.22],[.63,.04],[.13,1.02],[1.14,.81]),
  cubicPoints([.31,1.12],[.93,.72],[.50,.52],[.83,-.12]),
  cubicPoints([.13,-.12],[.53,.31],[.96,.30],[1.12,.03]),
  cubicPoints([-.10,.93],[.06,.70],[.39,.65],[.51,.82])
];
// A single trefoil is restricted to the back of the head, never a body badge.
const radiationMark=Array.from({length:3},(_,i)=>{
  const angle=-Math.PI/2+i*Math.PI*2/3,point=(r,a)=>[.5+r*Math.cos(a),.76+r*Math.sin(a)];
  return [point(.05,angle-.39),...Array.from({length:13},(_,j)=>point(.15,angle-.39+j/12*.78)),point(.05,angle+.39)];
});
function energySvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,f=part==='tail'?motifFrame(part):{x:0,y:0,w:1,h:1},p=theme.patternPalette;
  const point=(u,v)=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`;
  const nuclear=theme.pattern==='nuclearFlux',paths=nuclear?nuclearPaths:plasmaPaths;
  const material=toyMaterial(p,id,size,{tail:part==='tail',lightCenter});
  const cyanMaterial=nuclear?material:toyMaterial({base:'#17cbed',light:'#9cffff',shade:'#237fba',edge:'#15486b'},id+'-cyan',size,{tail:part==='tail',lightCenter});
  const mask=shape=>`<mask id="${id}-pattern" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${shape}</mask>`;
  const data=points=>'M '+points.map(([u,v])=>point(u,v)).join(' L ');
  const stroke=(d,width,color,opacity)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${size*width*f.h}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
  const cyan=paths.filter((_,i)=>nuclear||i%2===0),pink=paths.filter((_,i)=>!nuclear&&i%2===1);
  const strokes=(list,w,c,o)=>list.map(points=>stroke(data(points),w,c,o)).join('');
  const cyanMask=strokes(cyan,nuclear?.19:.20,'white',1);
  const pinkMask=strokes(pink,.17,'white',1);
  const glow=strokes(cyan,.35,nuclear?p.base:'#22cfee',.18)+strokes(pink,.34,p.base,.20);
  const cyanDefs=cyanMaterial.defs+mask(cyanMask);
  const pinkDefs=nuclear?'':material.defs+mask(pinkMask).replaceAll(`${id}-pattern`,`${id}-pink`);
  const lanes=`<g mask="url(#${id}-pattern)">${cyanMaterial.paint}</g>`+(nuclear?'':`<g mask="url(#${id}-pink)">${material.paint}</g>`);
  const cores=strokes(cyan,.025,theme.palette.detail,.94)+strokes(pink,.016,p.light,.92);
  const trefoil=part==='head-base'&&nuclear?radiationMark.map(shape=>`<path d="M ${shape.map(([x,y])=>`${x*size},${y*size}`).join(' L ')} Z" fill="${p.light}" stroke="${theme.palette.ink}" stroke-width="${size*.013}" stroke-linejoin="round"/>`).join(''):'';
  return {defs:cyanDefs+pinkDefs,paint:glow+lanes+cores+trefoil};
}
// Surface-only geology: the same round masks remain underneath both materials.
// Lava is an open branching crack network; Obsidian has broad polished slivers.
const magmaPaths=[[[.03,.35],[.23,.39],[.36,.55],[.56,.46],[.72,.64],[.98,.69]],
  [[.36,.55],[.31,.75],[.17,.98]],[[.56,.46],[.61,.28],[.77,.06]],
  [[.23,.39],[.18,.18],[.07,.03]],[[.72,.64],[.68,.84],[.79,1.03]]];
const obsidianFaces=[[[.02,.20],[.38,.18],[.64,.42],[.51,.41],[.31,.29],[.02,.31]],
  [[.36,.48],[.75,.60],[.91,.83],[.73,.75],[.54,.62],[.27,.56]]];
const obsidianGlints=[[[.08,.20],[.38,.18],[.64,.42]],[[.36,.48],[.75,.60],[.88,.79]]];
function stoneSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,p=theme.patternPalette,f=part==='tail'?motifFrame(part):{x:0,y:0,w:1,h:1};
  const points=path=>path.map(([u,v])=>`${size*(f.x+u*f.w)},${size*(f.y+v*f.h)}`).join(' L ');
  const stroke=(path,width,color,opacity)=>`<path d="M ${points(path)}" fill="none" stroke="${color}" stroke-width="${size*width*f.w}" stroke-opacity="${opacity}" stroke-linejoin="round" stroke-linecap="round"/>`;
  if(theme.pattern==='magmaCracks'){
    const paint=magmaPaths.map(path=>stroke(path,.16,p.shade,.24)+stroke(path,.098,p.base,.28)+stroke(path,.051,p.base,1)+stroke(path,.019,p.light,1)+stroke(path,.006,p.detail,.85)).join('');
    return {defs:`<!-- ${id}: baked molten fissures -->`,paint};
  }
  const material=toyMaterial(p,id,size,{tail:part==='tail',lightCenter});
  const faces=obsidianFaces.map(face=>`<path d="M ${points(face)} Z" fill="white"/>`).join('');
  const glints=obsidianGlints.map(path=>stroke(path,.009,p.detail,.68)).join('');
  return {defs:material.defs+`<mask id="${id}-slivers" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${faces}</mask>`,paint:`<g mask="url(#${id}-slivers)" opacity=".70">${material.paint}</g>`+glints};
}
function ribbonY(u,i,aurora){
  return aurora?.24+i*.24+.11*Math.sin((u+.08+i*.20)*Math.PI*2):
    .24+i*.25+.066*Math.sin((u+i*.18)*Math.PI*2)+.055*(u-.5);
}
function ribbonSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,p=theme.patternPalette,f=part==='tail'?motifFrame(part):{x:0,y:0,w:1,h:1},aurora=theme.pattern==='auroraRibbons';
  const material=toyMaterial(p,id,size,{tail:part==='tail',lightCenter});
  const paths=[0,1,2].map(i=>'M '+Array.from({length:81},(_,n)=>{
    const u=-.1+n/80*1.2;return `${size*(f.x+u*f.w)},${size*(f.y+ribbonY(u,i,aurora)*f.h)}`;
  }).join(' L '));
  const stroke=(d,width,color,opacity)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${size*width*f.h}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
  if(aurora){
    const mask=paths.map(d=>stroke(d,.09,'white',1)).join('');
    const glow=paths.map(d=>stroke(d,.27,p.light,.12)+stroke(d,.17,p.base,.20)).join('');
    const cores=paths.map((d,i)=>stroke(d,.030,i===1?p.light:p.base,.62)).join('');
    return {defs:material.defs+`<mask id="${id}-curtains" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${mask}</mask>`,paint:glow+`<g mask="url(#${id}-curtains)">${material.paint}</g>`+cores};
  }
  const waveGlow=paths.map(d=>stroke(d,.10,p.base,.22)+stroke(d,.059,p.light,.30)).join('');
  const foam=paths.map((d,i)=>stroke(d,.022,theme.palette.detail,i===1?.83:.62)).join('');
  return {defs:`<!-- ${id}: baked wave crests -->`,paint:waveGlow+foam};
}
function melonSeeds(part){
  return part==='tail'?[[.5,.28]]:part==='head-base'?[[.34,.60],[.65,.64],[.48,.75]]:
    [[.29,.33],[.67,.30],[.43,.54],[.31,.67],[.67,.65]];
}
function melonRadius(nx,ny,part){
  if(part==='tail'){
    const t=(ny-snakeSpec.tail.attachment[1])/(snakeSpec.tail.tipY-snakeSpec.tail.attachment[1]);
    const half=spec.geometry.visibleDiameter*snakeSpec.tail.widthRelativeToBody/2*Math.pow(Math.max(0,1-t),snakeSpec.tail.taperExponent);
    return Math.max(Math.abs(nx-.5)/Math.max(half,1e-8),t);
  }
  const rx=part==='body'?spec.geometry.outerRadius:snakeSpec.head.radiusX,ry=part==='body'?rx:snakeSpec.head.radiusY;
  return Math.hypot((nx-.5)/rx,(ny-.5)/ry);
}
function melonShape(size,part,fraction){
  if(part!=='tail'){
    const rx=part==='body'?spec.geometry.outerRadius:snakeSpec.head.radiusX,ry=part==='body'?rx:snakeSpec.head.radiusY;
    return `<ellipse cx="${size*.5}" cy="${size*.5}" rx="${size*rx*fraction}" ry="${size*ry*fraction}"/>`;
  }
  const left=[],right=[];
  for(let i=0;i<=48;i++){
    const t=fraction*i/48,y=snakeSpec.tail.attachment[1]+(snakeSpec.tail.tipY-snakeSpec.tail.attachment[1])*t;
    const half=spec.geometry.visibleDiameter*snakeSpec.tail.widthRelativeToBody/2*Math.pow(1-t,snakeSpec.tail.taperExponent)*fraction;
    left.push(`${size*(.5-half)},${size*y}`);right.unshift(`${size*(.5+half)},${size*y}`);
  }
  return `<polygon points="${left.concat(right).join(' ')}"/>`;
}
function melonSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,green=toyMaterial(theme.patternPalette,id,size,{tail:part==='tail',lightCenter});
  const mask=(name,shape)=>`<mask id="${id}-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="white"/><g fill="black">${shape}</g></mask>`;
  const ring=`<g mask="url(#${id}-outer)">${green.paint}</g><g mask="url(#${id}-inner)"><g fill="${theme.palette.detail}">${melonShape(size,part,.85)}</g></g>`;
  const seeds=melonSeeds(part).map(([x,y],i)=>`<ellipse cx="${x*size}" cy="${y*size}" rx="${size*(part==='tail'?.013:.018)}" ry="${size*(part==='tail'?.022:.032)}" transform="rotate(${[-25,23,4,25,-20][i]} ${x*size} ${y*size})" fill="${theme.palette.ink}"/>`).join('');
  return {defs:green.defs+mask('outer',melonShape(size,part,.85))+mask('inner',melonShape(size,part,.76)),paint:ring+seeds};
}
function panelFrame(part){return part==='tail'?{cx:.5,cy:.30,rx:.17,ry:.245}:part==='head-base'?{cx:.5,cy:.5,rx:snakeSpec.head.radiusX,ry:snakeSpec.head.radiusY}:{cx:.5,cy:.5,rx:spec.geometry.outerRadius,ry:spec.geometry.outerRadius};}
function footballSvg(theme,size,part,lightCenter){
  const id=`${theme.id}-${part}-surface`,black=toyMaterial(theme.patternPalette,id,size,{tail:part==='tail',lightCenter}),frame=panelFrame(part);
  const path=panel=>'M '+panel.points.map(([x,y])=>`${size*(frame.cx+x*frame.rx)},${size*(frame.cy+y*frame.ry)}`).join(' L ')+' Z';
  const patches=football.panels.filter(panel=>panel.black).map(panel=>`<path d="${path(panel)}" fill="white"/>`).join('');
  const seams=football.panels.map(panel=>`<path d="${path(panel)}" fill="none" stroke="${theme.palette.ink}" stroke-opacity=".32" stroke-width="${size*.007}" stroke-linejoin="round"/>`).join('');
  return {defs:black.defs+`<mask id="${id}-patches" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">${patches}</mask>`,paint:`<g mask="url(#${id}-patches)">${black.paint}</g>`+seams};
}
function toyBody(theme){
  const size=spec.styles.toy.frame,c=size/2,r=size*spec.geometry.outerRadius,p=theme.palette;
  const maskId='toy-'+theme.id+'-body',material=toyMaterial(p,'toy-'+theme.id,size,{finish:theme.material});
  const pattern=theme.pattern==='strawberrySeeds'
    ?seeds.map(([x,y])=>`<ellipse cx="${c+x*r}" cy="${c+y*r}" rx="${r*.06}" ry="${r*.074}" fill="${p.detail}"/>`).join('')
    :theme.pattern==='basketballSeams'
      ?`<path d="M ${c} ${c-r} V ${c+r} M ${c-r} ${c} H ${c+r}" fill="none" stroke="${p.ink}" stroke-width="${r*.035}"/>`
      :theme.pattern==='emeraldInlay'?emeraldSvg(p,size,'body'):'';
  // One diffuse sculpted material; no shiny circular spot or grain texture.
  // Composite one complete opaque material, then apply the outer alpha mask ONCE.
  // Clipping each stroke separately would change alpha at antialiased seam ends.
  const surface=surfaceSvg(theme,size,'body');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${material.defs}${surface.defs}<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="white"/></mask></defs><g mask="url(#${maskId})">${material.paint}${pattern}${surface.paint}</g></svg>`;
}
function pixelGrid(theme){
  const size=spec.styles.pixel.frame,c=size/2,r=size*spec.geometry.outerRadius,p=theme.pixelPalette||theme.palette;
  return Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
    const dx=x+.5-c,dy=y+.5-c,distance=Math.hypot(dx,dy);
    if(distance>r)return null;
    let color=pixelMaterial(p,dx,dy,r,r);
    if(color===p.ink)return color;
    if(theme.pattern==='strawberrySeeds'&&seeds.some(([sx,sy])=>
      Math.abs(dx-sx*r)<1.05&&Math.abs(dy-sy*r)<1.20))color=p.detail;
    if(theme.pattern==='basketballSeams'&&(x===16||y===16))color=p.ink;
    if(theme.pattern==='emeraldInlay'&&emeraldPixel(x,y,size,'body'))color=p.detail;
    return surfacePixel(theme,x,y,size,'body',color);
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
module.exports={spec,themes,seeds,toyMaterial,pixelMaterial,emeraldMark,emeraldSvg,emeraldPixel,candyBand,galaxyMarks,galaxyCloud,melonSeeds,melonRadius,motifCoordinates,roseShapes,forestShapes,forestVeins,forestStem,electricPaths,openPathDistance,nuclearPaths,plasmaPaths,radiationMark,clockGears,clockTrace,runeStrokes,runeCracks,relicFrame,magmaPaths,obsidianFaces,obsidianGlints,ribbonY,surfaceSvg,surfacePixel,bodySvg,pixelGrid,previewHtml,validateTheme,build};
if(require.main===module){
  const args=process.argv.slice(2),sharpIndex=args.indexOf('--sharp');
  if(sharpIndex!==-1&&!args[sharpIndex+1])throw new Error('Supply the path to the installed sharp module after --sharp');
  build({sharpModule:sharpIndex===-1?undefined:args[sharpIndex+1],check:args.includes('--check')})
    .then(outputs=>console.log(`${args.includes('--check')?'CHECKED':'BUILT'}: ${outputs.length} body templates (${sharpIndex===-1?'SVG sources; pass --sharp to export WebP':'SVG + lossless WebP'}). Existing game assets unchanged.`))
    .catch(error=>{console.error(error.message);process.exitCode=1;});
}
