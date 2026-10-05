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
      c.drawImage(source,0,0,width,height);
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
  const api={palettes,createRenderer};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.BoardBackgrounds=api;
})(typeof globalThis!=='undefined'?globalThis:this);
