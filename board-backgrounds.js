// Sharp board surfaces. Quietness belongs in the artwork, never in a blur pass.
(function(root){
  const palettes={
    forest:['#41685d','#304e49'],crystal:['#436b7d','#304b63'],
    sunTemple:['#917953','#6a5945'],footballPitch:['#426d56','#304e42'],
    basketballCourt:['#95795b','#6c5946'],hockeyRink:['#9bafba','#728c9b'],
    coralReef:['#497c81','#325763'],cloudCity:['#839ead','#5b778b'],
    volcanoIsland:['#6d6162','#494550'],enchantedLibrary:['#776653','#51483f'],
    neonArcade:['#514f79','#353c58'],moonGarden:['#555d76','#394754'],
    portal:['#35495f','#263348']
  };
  const themes={
    forest:{stem:'sagoskog',name:'Sagoskogen'},crystal:{stem:'kristallgrotta',name:'Kristallgrotta'},
    sunTemple:{stem:'soltemplet',name:'Soltemplet'},footballPitch:{stem:'fotbollsplan',name:'Fotbollsplan'},
    basketballCourt:{stem:'basketplan',name:'Basketplan'},hockeyRink:{stem:'hockeyrink',name:'Hockeyrink'},
    coralReef:{stem:'korallrev',name:'Korallrev'},cloudCity:{stem:'molnstaden',name:'Molnstaden'},
    volcanoIsland:{stem:'vulkanon',name:'Vulkanön'},enchantedLibrary:{stem:'magiska-biblioteket',name:'Magiska biblioteket'},
    neonArcade:{stem:'neonarkaden',name:'Neonarkaden'},moonGarden:{stem:'mantradgarden',name:'Månträdgården'}
  };
  function asset(id,mode,width,height){
    if(!Object.prototype.hasOwnProperty.call(themes,id))return null;
    const theme=themes[id];
    const style=mode==='pixel'?'pixel':'toy',layout=height>width?'portrait':'wide';
    return {key:`${id}|${style}|${layout}`,src:`assets/${theme.stem}-${style}${layout==='portrait'?'-portrait':''}.webp?v=1`};
  }
  // Only the selected art is downloaded. Bound decoded-image retention as well
  // as the composition cache; a long session must not keep all 48 bitmaps alive.
  function createLoader({createImage=()=>new Image(),maxEntries=4}={}){
    const cache=new Map();
    maxEntries=Number.isFinite(maxEntries)?Math.max(1,Math.floor(maxEntries)):4;
    function get(id,mode,width,height){
      const selected=asset(id,mode,width,height);if(!selected)return null;
      let entry=cache.get(selected.key);
      if(!entry){
        entry={image:createImage(),status:'loading',asset:selected};
        entry.image.onload=()=>{entry.status='ready';};
        entry.image.onerror=()=>{entry.status='failed';};
        entry.image.src=selected.src;
      }
      cache.delete(selected.key);cache.set(selected.key,entry);
      while(cache.size>maxEntries)cache.delete(cache.keys().next().value);
      return entry;
    }
    return {get,clear:()=>cache.clear(),cacheSize:()=>cache.size};
  }
  // Select from the logical board, not device orientation. WEB remains 21:16;
  // Android's 14:20 touch and 14:23 joystick boards share the portrait artwork.
  function forestAsset(mode,width,height){
    const style=mode==='pixel'?'pixel':'toy',layout=height>width?'portrait':'wide';
    return {key:`${style}|${layout}`,src:`assets/sagoskog-${style}${layout==='portrait'?'-portrait':''}.webp?v=1`};
  }
  function compositionSlices(id,sourceWidth,sourceHeight,width,height){
    if(!(sourceWidth>0&&sourceHeight>0&&width>0&&height>0))return null;
    const portrait=sourceHeight>sourceWidth;
    // Only the quiet full-width middle band may change aspect ratio. Preserve
    // the pilot cuts; new themes reserve their corner/end-zone art outside
    // 38–62% (wide) / 28–72% (portrait), including sports markings and goals.
    const top=Math.round(sourceHeight*(portrait ? .28 : id==='forest' ? .40 : .38));
    const bottom=Math.round(sourceHeight*(portrait ? .28 : id==='forest' ? .44 : .38));
    const scale=width/sourceWidth;
    const topHeight=Math.round(top*scale),bottomHeight=Math.round(bottom*scale);
    const middleHeight=height-topHeight-bottomHeight;
    if(middleHeight<=0)return null;
    return [
      [0,0,sourceWidth,top,0,0,width,topHeight],
      [0,top,sourceWidth,sourceHeight-top-bottom,0,topHeight,width,middleHeight],
      [0,sourceHeight-bottom,sourceWidth,bottom,0,height-bottomHeight,width,bottomHeight]
    ];
  }
  function forestSlices(sourceWidth,sourceHeight,width,height){
    return compositionSlices('forest',sourceWidth,sourceHeight,width,height);
  }
  function createRenderer({createCanvas=()=>document.createElement('canvas')}={}){
    const cache=new Map();
    function drawPlain(ctx,width,height){
      ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      ctx.shadowBlur=0;ctx.fillStyle='#163136';ctx.fillRect(0,0,width,height);ctx.restore();
    }
    function compose(source,id,width,height,pixel){
      const key=`${id}|${width}|${height}|${pixel}`;
      const previous=cache.get(key);
      if(previous&&previous.source===source)return previous.canvas;
      const sprite=createCanvas();sprite.width=width;sprite.height=height;
      const c=sprite.getContext('2d');
      c.imageSmoothingEnabled=!pixel;c.globalAlpha=1;
      const slices=themes[id]?compositionSlices(id,source.naturalWidth||source.width,source.naturalHeight||source.height,width,height):null;
      if(slices)for(const rect of slices)c.drawImage(source,...rect);
      else c.drawImage(source,0,0,width,height);
      cache.delete(key);cache.set(key,{source,canvas:sprite});
      // Two boards only: revisiting/loading themes cannot grow this cache.
      while(cache.size>2)cache.delete(cache.keys().next().value);
      return sprite;
    }
    function draw(ctx,{source,id='forest',width,height,enabled=true,pixel=false}={}){
      if(!enabled||!source){drawPlain(ctx,width,height);return;}
      const sprite=compose(source,id,width,height,pixel);
      ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      ctx.shadowBlur=0;ctx.imageSmoothingEnabled=!pixel;
      ctx.drawImage(sprite,0,0);ctx.restore();
    }
    return {draw,clear:()=>cache.clear(),cacheSize:()=>cache.size};
  }
  const api={palettes,themes,asset,createLoader,compositionSlices,forestAsset,forestSlices,createRenderer};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.BoardBackgrounds=api;
})(typeof globalThis!=='undefined'?globalThis:this);
