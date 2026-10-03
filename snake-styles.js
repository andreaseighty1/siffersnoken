// Template renderer shared by the game and skin cards. No unlock/progress writes.
(function(root){
  'use strict';
  const config=typeof module!=='undefined'&&module.exports?require('./snake-style-config.js'):root.SnakeStyleConfig;
  const normalizeMode=mode=>mode==='modern'?'toy':config.styles[mode]?mode:'classic';
  const supports=(mode,id)=>!!config.styles[normalizeMode(mode)]&&config.skins.includes(id);
  const facing=d=>d.x===1?'right':d.x===-1?'left':d.y===1?'down':'up';
  const angles={up:0,right:Math.PI/2,down:Math.PI,left:-Math.PI/2};
  const alpha=index=>Math.max(.35,1-index*.035);
  function paths(mode,id){
    if(!supports(mode,id))return [];
    const dir=`skins/styles/${normalizeMode(mode)}/`;
    return ['body','tail','head-base','head-base-right','head-base-down','head-base-left'].map(p=>dir+id+'-'+p+'.webp')
      .concat([dir+'eyes-open.webp',dir+'eyes-blink.webp'],id==='jordgubbe'?[dir+'jordgubbe-head-decoration.webp']:[],normalizeMode(mode)==='pixel'?[dir+'tongue.webp']:[]);
  }
  function createRenderer({createCanvas=()=>document.createElement('canvas'),createImage=()=>new Image()}={}){
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
        images.set(src,entry);image.src=src;return entry.promise;
      })).then(results=>results.length>0&&results.every(Boolean));
    }
    function ready(mode,id){return paths(mode,id).every(src=>images.get(src)?.ready);}
    function image(mode,name){return images.get(`skins/styles/${mode}/${name}.webp`).image;}
    // A joined tail/body is composited BEFORE opacity. Its overlap cannot darken
    // or shine through a faded end segment. Cached in four cardinal directions.
    function sprite(mode,id,part,cell,direction='up',blink=false){
      const key=[mode,id,part,cell,direction,blink].join('|');
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
        c.drawImage(image(mode,id+'-tail'),-size/2,chord-s.pivot[1]/s.frame*size,size,size);
        c.restore();
      }
      if(part==='head'){
        c.save();c.translate(center,center);c.rotate(angles[direction]);
        const base=id+'-head-base'+(direction==='up'?'':'-'+direction);
        const start=pixel?-Math.floor(size/2):-size/2;
        c.drawImage(image(mode,base),start,start,size,size);
        if(mode==='pixel')c.drawImage(image(mode,'tongue'),start,start+Math.round(-.13*size),size,size);
        if(id==='jordgubbe')c.drawImage(image(mode,'jordgubbe-head-decoration'),start,start,size,size);
        c.drawImage(image(mode,'eyes-'+(blink?'blink':'open')),start,start,size,size);
        c.restore();
      }else c.drawImage(image(mode,id+'-body'),center-size/2,center-size/2,size,size);
      if(!pixel){
        // Bake soft world-down shadows once per sprite, not once per frame/segment.
        const shaded=createCanvas();shaded.width=shaded.height=out.width;
        const sc=shaded.getContext('2d');sc.shadowColor='rgba(22,30,12,.38)';
        sc.shadowBlur=cell*.12*res;sc.shadowOffsetY=cell*.12*res;sc.drawImage(out,0,0);
        sprites.set(key,{canvas:shaded,extent});
      }else sprites.set(key,{canvas:out,extent});
      return sprites.get(key);
    }
    function draw(context,{mode,id,cell,cols,rows,points,heading,tailDirection,blink=false,wrap=false,fade=true}){
      mode=normalizeMode(mode);
      if(!supports(mode,id))return false;
      if(!ready(mode,id)){preload(mode,id);return false;}
      const pixel=mode==='pixel',pitch=pixel?24:cell;
      let target=context;
      if(pixel){
        if(!layer)layer=createCanvas();
        if(layer.width!==cols*pitch||layer.height!==rows*pitch){layer.width=cols*pitch;layer.height=rows*pitch;}
        target=layer.getContext('2d');target.clearRect(0,0,layer.width,layer.height);
      }
      target.save();target.imageSmoothingEnabled=!pixel;target.shadowBlur=0;
      const w=cols*pitch,h=rows*pitch;
      for(let i=points.length-1;i>=0;i--){
        const part=i===0?'head':i===points.length-1?'tail':'body';
        const direction=facing(i===0?heading:tailDirection);
        const cached=sprite(mode,id,part,pitch,direction,i===0&&blink);
        const x=(points[i].x+.5)*pitch,y=(points[i].y+.5)*pitch;
        target.globalAlpha=fade&&i?alpha(i):1;
        for(const dx of wrap?[-w,0,w]:[0])for(const dy of wrap?[-h,0,h]:[0]){
          const left=x+dx-cached.extent/2,top=y+dy-cached.extent/2;
          if(left+cached.extent<0||top+cached.extent<0||left>w||top>h)continue;
          target.drawImage(cached.canvas,pixel?Math.round(left):left,pixel?Math.round(top):top,cached.extent,cached.extent);
        }
      }
      target.restore();
      if(pixel){context.save();context.shadowBlur=0;context.imageSmoothingEnabled=false;context.drawImage(layer,0,0,cols*cell,rows*cell);context.restore();}
      return true;
    }
    return {preload,draw};
  }
  const api={config,normalizeMode,supports,paths,alpha,facing,createRenderer};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SnakeStyles=api;
})(typeof globalThis!=='undefined'?globalThis:this);
