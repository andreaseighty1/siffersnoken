// Template renderer shared by the game and skin cards. No unlock/progress writes.
(function(root){
  'use strict';
  const config=typeof module!=='undefined'&&module.exports?require('./snake-style-config.js'):root.SnakeStyleConfig;
  const colors=typeof module!=='undefined'&&module.exports?require('./snake-colors.js'):root.SnakeColors;
  const headwear=typeof module!=='undefined'&&module.exports?require('./snake-headwear.js'):root.SnakeHeadwear;
  const normalizeMode=mode=>mode==='classic'||mode==='pixel'?mode:'toy';
  const supports=(mode,id)=>!!config.styles[normalizeMode(mode)]&&config.skins.includes(id);
  const facing=d=>d.x===1?'right':d.x===-1?'left':d.y===1?'down':'up';
  const angles={up:0,right:Math.PI/2,down:Math.PI,left:-Math.PI/2};
  const alpha=index=>Math.max(config.rendering.minimumOpacity,Math.min(1,1-index*config.rendering.fadePerSegment));
  function colorHue(id,index,time=0,reducedMotion=false){
    const cycle=config.colorCycles[id];
    if(!cycle)return 0;
    const phase=reducedMotion?0:Math.floor(Math.max(0,time)/cycle.intervalMs);
    return cycle.hues[(index+phase)%cycle.hues.length];
  }
  function tailFrame(id,time=0,reducedMotion=false){
    const animation=config.tailAnimations?.[id];
    if(!animation||reducedMotion)return 'tail';
    const phase=Math.sin(Math.max(0,time)/animation.periodMs*Math.PI*2);
    return animation.frames[Math.round((phase+1)*(animation.frames.length-1)/2)];
  }
  function paths(mode,id){
    if(!supports(mode,id))return [];
    const dir=`skins/styles/${normalizeMode(mode)}/`;
    return ['body','tail','head-base','head-base-right','head-base-down','head-base-left'].map(p=>dir+id+'-'+p+'.webp')
      .concat([dir+'eyes-open.webp',dir+'eyes-blink.webp'],id==='jordgubbe'?[dir+'jordgubbe-head-decoration.webp']:[],
        config.animalProfiles?.[id]==='feline'?['head-ears','head-face',...config.tailAnimations[id].frames.filter(p=>p!=='tail')].map(p=>dir+id+'-'+p+'.webp'):[],
        normalizeMode(mode)==='pixel'?[dir+'tongue.webp']:[]);
  }
  function createRenderer({createCanvas=()=>document.createElement('canvas'),createImage=()=>new Image(),assetPrefix=''}={}){
    const images=new Map(),sprites=new Map();
    let layer=null;
    function preload(mode,id){
      return Promise.all(paths(mode,id).map(src=>{
        if(images.has(src))return images.get(src).promise;
        const image=createImage();image.decoding='async';
        const entry={image,ready:false,promise:null};
        entry.promise=new Promise(resolve=>{
          image.onload=()=>{entry.ready=!!image.naturalWidth;resolve(entry.ready);};
          image.onerror=()=>resolve(false);
        });
        images.set(src,entry);
        const revision=config.assetRevisions?.[id],themed=src.includes('/'+id+'-');
        image.src=assetPrefix+src+(revision&&themed?'?v='+revision:'');
        return entry.promise;
      })).then(results=>results.length>0&&results.every(Boolean));
    }
    function ready(mode,id){return paths(mode,id).every(src=>images.get(src)?.ready);}
    function image(mode,name){return images.get(`skins/styles/${mode}/${name}.webp`).image;}
    function insetOutline(out,color,radius,opacity){
      const eroded=createCanvas();eroded.width=out.width;eroded.height=out.height;
      const ec=eroded.getContext('2d');ec.drawImage(out,0,0);
      ec.globalCompositeOperation='destination-in';
      for(const [dx,dy] of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]])ec.drawImage(out,dx*radius,dy*radius);
      const ring=createCanvas();ring.width=out.width;ring.height=out.height;
      const rc=ring.getContext('2d');rc.drawImage(out,0,0);
      rc.globalCompositeOperation='source-in';rc.fillStyle=color;rc.fillRect(0,0,ring.width,ring.height);
      rc.globalCompositeOperation='destination-out';rc.drawImage(eroded,0,0);
      const oc=out.getContext('2d');oc.save();
      // Inset: no enlarged mask, no seam across the pre-joined tail attachment.
      oc.setTransform(1,0,0,1,0,0);oc.globalCompositeOperation='source-atop';oc.globalAlpha=opacity;
      oc.drawImage(ring,0,0);oc.restore();
    }
    // A joined tail/body is composited BEFORE opacity. Its overlap cannot darken
    // or shine through a faded end segment. Cached in four cardinal directions.
    function recolorMaterial(out,hue){
      if(!hue)return;
      const c=out.getContext('2d'),pixels=c.getImageData(0,0,out.width,out.height);
      colors.recolorPixels(pixels.data,hue);c.putImageData(pixels,0,0);
    }
    function sprite(mode,id,part,cell,direction='up',blink=false,hue=0,accessory=null,tailPose='tail'){
      if(part==='body')direction='up';
      if(part!=='head')blink=false;
      accessory=part==='head'&&headwear.supports(mode,accessory)?accessory:null;
      const key=[mode,id,part,cell,direction,blink,hue,accessory,part==='tail'?tailPose:''].join('|');
      if(sprites.has(key))return sprites.get(key);
      const pixel=mode==='pixel',s=config.styles[mode];
      const bodySize=pixel?32:cell*s.bodyScale;
      const size=part==='head'?(pixel?Math.round(bodySize*s.headScale):bodySize*s.headScale):bodySize;
      const res=pixel?1:2,extent=pixel?80:Math.ceil(cell*3);
      const out=createCanvas();out.width=out.height=extent*res;
      const c=out.getContext('2d');c.scale(res,res);c.imageSmoothingEnabled=!pixel;
      const center=extent/2;
      if(part==='tail'){
        c.save();c.translate(center,center);c.rotate(angles[direction]-Math.PI);
        const chord=s.chord/s.frame*bodySize;
        c.drawImage(image(mode,id+'-'+tailPose),-size/2,chord-s.pivot[1]/s.frame*size,size,size);
        c.restore();
      }
      if(part==='head'){
        c.save();c.translate(center,center);c.rotate(angles[direction]);
        const base=id+'-head-base'+(direction==='up'?'':'-'+direction);
        const start=pixel?-Math.floor(size/2):-size/2;
        if(config.animalProfiles?.[id]==='feline')c.drawImage(image(mode,id+'-head-ears'),start,start,size,size);
        c.drawImage(image(mode,base),start,start,size,size);
        // Color the material BEFORE painting eyes/tongue/decorations.
        recolorMaterial(out,hue);
        if(mode==='pixel')c.drawImage(image(mode,'tongue'),start,start+Math.round(-.13*size),size,size);
        if(id==='jordgubbe')c.drawImage(image(mode,'jordgubbe-head-decoration'),start,start,size,size);
        if(config.animalProfiles?.[id]==='feline')c.drawImage(image(mode,id+'-head-face'),start,start,size,size);
        c.drawImage(image(mode,'eyes-'+(blink?'blink':'open')),start,start,size,size);
        c.restore();
      }else{
        c.drawImage(image(mode,id+'-body'),center-size/2,center-size/2,size,size);
        recolorMaterial(out,hue); // Joined tail and final body share one color.
      }
      const r=config.rendering;
      if(!pixel)insetOutline(out,colors.rotateHex(config.outlineColors[id],hue),Math.max(1,Math.round(cell*r.toyOutlineWidth*res)),r.toyOutlineOpacity);
      if(accessory){
        // Separate transparent lens canvas prevents a lens cutout erasing eyes.
        const hat=createCanvas();hat.width=hat.height=pixel?size:Math.ceil(size*res);
        const hc=hat.getContext('2d');
        headwear.paint(hc,{mode,id:accessory,size:hat.width,direction});
        c.save();c.translate(center,center);c.rotate(angles[direction]);
        const start=pixel?-Math.floor(size/2):-size/2;
        c.save();c.translate(start,start);
        headwear.occludeHead(c,{mode,id:accessory,size});c.restore();
        c.drawImage(hat,start,start,size,size);c.restore();
      }
      // Cache contrast/shadows once. Never run morphology/blur per game frame.
      const shaded=createCanvas();shaded.width=shaded.height=out.width;
      const sc=shaded.getContext('2d');sc.shadowColor=`rgba(12,23,18,${r.shadowOpacity})`;
      sc.shadowBlur=pixel?r.pixelShadowBlur:cell*r.toyShadowBlur*res;
      sc.shadowOffsetY=pixel?r.pixelShadowOffset:cell*r.toyShadowOffset*res;
      sc.drawImage(out,0,0);
      // Thirty hats must not retain thousands of canvases as the picker cycles
      // through every skin. Evict on cache misses only, never on warm frames.
      if(sprites.size>=256)sprites.delete(sprites.keys().next().value);
      sprites.set(key,{canvas:shaded,extent});
      return sprites.get(key);
    }
    function draw(context,{mode,id,cell,cols,rows,points,heading,tailDirection,blink=false,wrap=false,fade=true,time=0,reducedMotion=false,accessory=null}){
      mode=normalizeMode(mode);
      if(!supports(mode,id))return false;
      if(!ready(mode,id)){preload(mode,id);return false;}
      const pixel=mode==='pixel',pitch=pixel?24:cell;
      const opacity=config.materialOpacities[id]??1,composite=pixel||opacity<1;
      let target=context;
      if(composite){
        if(!layer)layer=createCanvas();
        const width=Math.ceil(cols*pitch),height=Math.ceil(rows*pitch);
        if(layer.width!==width||layer.height!==height){layer.width=width;layer.height=height;}
        target=layer.getContext('2d');target.clearRect(0,0,layer.width,layer.height);
      }
      target.save();target.imageSmoothingEnabled=!pixel;target.shadowBlur=0;
      const w=cols*pitch,h=rows*pitch;
      const selectedTail=tailFrame(id,time,reducedMotion);
      for(let i=points.length-1;i>=0;i--){
        const part=i===0?'head':i===points.length-1?'tail':'body';
        const direction=facing(i===0?heading:tailDirection);
        const cached=sprite(mode,id,part,pitch,direction,i===0&&blink,colorHue(id,i,time,reducedMotion),accessory,selectedTail);
        const x=(points[i].x+.5)*pitch,y=(points[i].y+.5)*pitch;
        target.globalAlpha=fade&&i?alpha(i):1;
        // Only a real logical crossing may mirror a segment. Oversized sprites
        // and their shadows must not leak onto the opposite edge while nearby.
        for(const dx of wrap&&points[i].wrapX?[-w,0,w]:[0])for(const dy of wrap&&points[i].wrapY?[-h,0,h]:[0]){
          const left=x+dx-cached.extent/2,top=y+dy-cached.extent/2;
          if(left+cached.extent<0||top+cached.extent<0||left>w||top>h)continue;
          target.drawImage(cached.canvas,pixel?Math.round(left):left,pixel?Math.round(top):top,cached.extent,cached.extent);
        }
      }
      target.restore();
      if(composite){
        context.save();context.shadowBlur=0;
        // Ghost opacity belongs to the assembled snake, not individual parts:
        // adjacent segments and the pre-joined tail cannot double the opacity.
        context.globalAlpha*=opacity;
        // Soften only the final scaling, never the native sprites/logical grid.
        context.imageSmoothingEnabled=pixel?config.rendering.pixelFinalSmoothing:true;
        context.imageSmoothingQuality='low';
        context.drawImage(layer,0,0,cols*cell,rows*cell);context.restore();
      }
      return true;
    }
    return {preload,draw,cacheSize:()=>sprites.size};
  }
  const api={config,normalizeMode,supports,paths,alpha,colorHue,tailFrame,facing,createRenderer};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SnakeStyles=api;
})(typeof globalThis!=='undefined'?globalThis:this);
