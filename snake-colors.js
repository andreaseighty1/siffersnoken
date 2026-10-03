// Hue rotation of material pixels only. Alpha, geometry and separate eyes stay intact.
(function(root){
  'use strict';
  function rotateRGB(r,g,b,degrees){
    const hi=Math.max(r,g,b),lo=Math.min(r,g,b),chroma=hi-lo;
    if(!chroma)return [r,g,b];
    let h=(hi===r?(g-b)/chroma:hi===g?(b-r)/chroma+2:(r-g)/chroma+4)+degrees/60;
    h=(h%6+6)%6;
    const x=chroma*(1-Math.abs(h%2-1));
    const rgb=h<1?[chroma,x,0]:h<2?[x,chroma,0]:h<3?[0,chroma,x]:h<4?[0,x,chroma]:h<5?[x,0,chroma]:[chroma,0,x];
    return rgb.map(v=>Math.round(v+lo));
  }
  function recolorPixels(data,degrees){
    if(!degrees)return data;
    const colors=new Map();
    for(let i=0;i<data.length;i+=4){
      if(!data[i+3])continue;
      const key=(data[i]<<16)|(data[i+1]<<8)|data[i+2];
      let rgb=colors.get(key);
      if(!rgb){rgb=rotateRGB(data[i],data[i+1],data[i+2],degrees);colors.set(key,rgb);}
      [data[i],data[i+1],data[i+2]]=rgb;
    }
    return data;
  }
  function rotateHex(hex,degrees){
    const rgb=rotateRGB(parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),degrees);
    return '#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  const api={rotateRGB,recolorPixels,rotateHex};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SnakeColors=api;
})(typeof globalThis!=='undefined'?globalThis:this);
