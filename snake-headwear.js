// Code-native headwear templates. Painted only when a head sprite is cached.
(function(root){
  'use strict';
  const config=typeof module!=='undefined'&&module.exports?require('./snake-style-config.js'):root.SnakeStyleConfig;
  const ids=Object.freeze(['crown','beanie','glasses','tiara','tophat']);
  const angles={up:0,right:Math.PI/2,down:Math.PI,left:-Math.PI/2};
  const supports=(mode,id)=>(mode==='toy'||mode==='pixel')&&ids.includes(id);
  const palettes={
    crown:['#66421e','#b87724','#eab448','#ffe595','#369bac','#d6f7ed'],
    beanie:['#163b51','#28617b','#438aa4','#78b9c7','#b6e0dc','#e1f4e6'],
    glasses:['#162b3e','#315571','#6994a8','#c8eee8'],
    tiara:['#414f75','#7e94b6','#b9cfe1','#f1f5ea','#b169b0','#efb5d2'],
    tophat:['#182033','#293b50','#52687d','#94afbb','#bd4964','#f2919e']
  };
  function fit(mode){
    const h=config.headAttachment;
    return {eyes:mode==='pixel'?h.pixelEyes:h.eyes,rearMinimumY:h.decorationMinimumY,
      rearCenter:[.5,.76],maximumBounds:[.10,.12,.90,1.00]};
  }
  // Lighting remains in world space after the head rotates.
  function material(c,direction,light,mid,dark){
    const a=angles[direction],vx=-.7,vy=-.9;
    const x=Math.cos(a)*vx+Math.sin(a)*vy,y=-Math.sin(a)*vx+Math.cos(a)*vy;
    const g=c.createLinearGradient(.5+x*.42,.7+y*.42,.5-x*.42,.7-y*.42);
    g.addColorStop(0,light);g.addColorStop(.48,mid);g.addColorStop(1,dark);return g;
  }
  function polygon(c,points,fill){
    c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
  }
  function ellipse(c,x,y,rx,ry,fill){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
  function rounded(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  function toy(c,id,direction){
    const p=palettes[id];
    if(id==='crown'){
      // Rear crown footprint: small sculpted gold points, curved padded band.
      polygon(c,[[.17,.72],[.18,.94],[.32,.85],[.5,1.00],[.68,.85],[.82,.94],[.83,.72]],
        material(c,direction,p[3],p[2],p[1]));
      c.strokeStyle=p[0];c.lineWidth=.016;c.lineJoin='round';c.stroke();
      ellipse(c,.5,.73,.335,.087,p[0]);
      ellipse(c,.5,.72,.322,.070,material(c,direction,p[3],p[2],p[1]));
      rounded(c,.42,.671,.16,.095,.032,p[0]);
      rounded(c,.434,.678,.132,.073,.025,material(c,direction,p[5],p[4],'#246472'));
      ellipse(c,.20,.914,.023,.023,p[3]);ellipse(c,.50,.969,.023,.023,p[3]);ellipse(c,.80,.914,.023,.023,p[3]);
    }else if(id==='beanie'){
      ellipse(c,.5,.795,.335,.205,p[0]);
      ellipse(c,.5,.785,.320,.192,material(c,direction,p[4],p[2],p[1]));
      // Broad knitted ribs, deliberately no noisy tiny texture.
      c.strokeStyle='rgba(16,53,74,.25)';c.lineWidth=.018;c.lineCap='round';
      for(const x of [.28,.39,.5,.61,.72]){
        c.beginPath();c.moveTo(x,.73);c.quadraticCurveTo(.5+(x-.5)*.72,.84,.5+(x-.5)*.4,.92);c.stroke();
      }
      rounded(c,.166,.625,.668,.15,.065,p[0]);
      rounded(c,.18,.632,.64,.122,.05,material(c,direction,p[4],p[2],p[1]));
      for(const x of [.26,.36,.46,.56,.66,.76])rounded(c,x,.656,.016,.073,.008,'rgba(216,243,231,.25)');
      ellipse(c,.5,.943,.081,.052,p[0]);
      ellipse(c,.5,.936,.074,.048,material(c,direction,p[5],p[3],p[1]));
    }else if(id==='tiara'){
      // Small silver arches and rose-quartz jewels, all behind the eyes.
      polygon(c,[[.19,.75],[.24,.92],[.36,.83],[.5,.99],[.64,.83],[.76,.92],[.81,.75]],material(c,direction,p[3],p[2],p[1]));
      c.strokeStyle=p[0];c.lineWidth=.014;c.lineJoin='round';c.stroke();
      ellipse(c,.5,.76,.32,.075,p[0]);
      ellipse(c,.5,.75,.306,.060,material(c,direction,p[3],p[2],p[1]));
      for(const [x,y,r] of [[.25,.872,.030],[.5,.933,.046],[.75,.872,.030]]){
        polygon(c,[[x,y-r],[x+r*.80,y],[x,y+r],[x-r*.80,y]],p[0]);
        polygon(c,[[x,y-r*.76],[x+r*.56,y],[x,y+r*.76],[x-r*.56,y]],material(c,direction,p[5],p[4],'#714c91'));
      }
      for(const x of [.29,.40,.60,.71])ellipse(c,x,.744,.018,.019,p[3]);
    }else if(id==='tophat'){
      // Rounded midnight-blue felt, broad satin ribbon, compact footprint.
      ellipse(c,.5,.74,.38,.105,p[0]);
      ellipse(c,.5,.731,.365,.087,material(c,direction,p[3],p[2],p[1]));
      rounded(c,.25,.704,.50,.272,.075,p[0]);
      rounded(c,.266,.710,.468,.248,.062,material(c,direction,p[2],p[1],p[0]));
      rounded(c,.26,.741,.48,.085,.020,p[4]);
      rounded(c,.275,.746,.45,.028,.012,material(c,direction,p[5],p[4],'#843952'));
      ellipse(c,.5,.926,.246,.067,p[0]);
      ellipse(c,.5,.917,.230,.058,material(c,direction,p[3],p[2],p[1]));
    }else{
      // Open lenses: eyes and blink layer stay visible, no opaque lens disks.
      const eyes=fit('toy').eyes;
      c.strokeStyle=p[0];c.lineWidth=.030;c.lineCap='round';
      c.beginPath();c.moveTo(.433,eyes[0][1]);c.quadraticCurveTo(.5,eyes[0][1]-.045,.567,eyes[1][1]);c.stroke();
      for(const [x,y] of eyes){
        c.beginPath();c.ellipse(x,y,.143,.156,0,0,Math.PI*2);c.stroke();
        c.strokeStyle=p[2];c.lineWidth=.010;
        c.beginPath();c.ellipse(x,y,.145,.158,0,Math.PI*1.13,Math.PI*1.78);c.stroke();
        c.strokeStyle=p[0];c.lineWidth=.030;
      }
      c.beginPath();c.moveTo(.152,eyes[0][1]);c.lineTo(.126,.46);c.moveTo(.848,eyes[1][1]);c.lineTo(.874,.46);c.stroke();
    }
  }
  // Scan-convert to whole native pixels: no anti-aliased vector edges or blur.
  function pixelPolygon(c,size,points,color){
    const vertices=points.map(([x,y])=>[x*size,y*size]);c.fillStyle=color;
    for(let y=0;y<size;y++){
      const cross=[];
      for(let i=0;i<vertices.length;i++){
        const [ax,ay]=vertices[i],[bx,by]=vertices[(i+1)%vertices.length];
        if((ay<=y+.5&&by>y+.5)||(by<=y+.5&&ay>y+.5))cross.push(ax+(y+.5-ay)*(bx-ax)/(by-ay));
      }
      cross.sort((a,b)=>a-b);
      for(let i=0;i+1<cross.length;i+=2){const x=Math.ceil(cross[i]-.5),end=Math.ceil(cross[i+1]-.5);if(end>x)c.fillRect(x,y,end-x,1);}
    }
  }
  function pixel(c,id,size,direction){
    const p=palettes[id],poly=(points,color)=>pixelPolygon(c,size,points,color);
    const rect=(x,y,w,h,color)=>{c.fillStyle=color;const l=Math.round(x*size),t=Math.round(y*size);c.fillRect(l,t,Math.round((x+w)*size)-l,Math.round((y+h)*size)-t);};
    const leftLit=direction==='up'||direction==='left';
    if(id==='crown'){
      poly([[.15,.65],[.15,.97],[.32,.86],[.5,1.0],[.68,.86],[.85,.97],[.85,.65]],p[0]);
      poly([[.19,.70],[.20,.91],[.32,.81],[.5,.95],[.68,.81],[.80,.91],[.81,.70]],p[2]);
      rect(leftLit?.20:.72,.72,.08,.14,p[3]);rect(.19,.67,.62,.09,p[1]);rect(.23,.67,.54,.03,p[3]);
      rect(.42,.65,.16,.12,p[0]);rect(.45,.68,.10,.06,p[4]);rect(.45,.68,.06,.03,p[5]);
    }else if(id==='beanie'){
      poly([[.16,.64],[.16,.83],[.23,.91],[.36,.97],[.64,.97],[.77,.91],[.84,.83],[.84,.64]],p[0]);
      poly([[.20,.69],[.20,.81],[.29,.89],[.39,.93],[.61,.93],[.71,.89],[.80,.81],[.80,.69]],p[2]);
      poly(leftLit?[[.20,.70],[.20,.81],[.29,.89],[.37,.92],[.37,.73]]:[[.80,.70],[.80,.81],[.71,.89],[.63,.92],[.63,.73]],p[3]);
      for(const x of [.32,.47,.62])rect(x,.76,.03,.13,p[1]);
      rect(.16,.63,.68,.15,p[0]);rect(.19,.66,.62,.09,p[2]);rect(.23,.66,.54,.03,p[4]);
      poly([[.44,.90],[.56,.90],[.61,.95],[.56,1.00],[.44,1.00],[.39,.95]],p[0]);
      rect(.44,.93,.12,.06,p[4]);rect(leftLit?.44:.50,.93,.06,.03,p[5]);
    }else if(id==='tiara'){
      poly([[.18,.71],[.23,.94],[.35,.85],[.5,1],[.65,.85],[.77,.94],[.82,.71]],p[0]);
      poly([[.23,.75],[.26,.88],[.35,.79],[.5,.94],[.65,.79],[.74,.88],[.77,.75]],p[2]);
      rect(.19,.71,.62,.09,p[1]);rect(.23,.71,.54,.03,p[3]);
      poly([[.50,.84],[.56,.90],[.50,.96],[.44,.90]],p[4]);rect(.48,.87,.04,.04,p[5]);
      rect(.23,.85,.06,.06,p[5]);rect(.71,.85,.06,.06,p[5]);
      for(const x of [.30,.39,.58,.67])rect(x,.72,.03,.03,p[3]);
    }else if(id==='tophat'){
      poly([[.12,.68],[.18,.63],[.82,.63],[.88,.68],[.88,.79],[.82,.84],[.18,.84],[.12,.79]],p[0]);
      rect(.16,.68,.68,.11,p[2]);rect(.22,.65,.56,.03,p[3]);
      poly([[.24,.71],[.24,.94],[.30,1],[.70,1],[.76,.94],[.76,.71]],p[0]);
      rect(.28,.72,.44,.21,p[1]);rect(leftLit?.28:.66,.75,.06,.16,p[2]);
      rect(.26,.73,.48,.09,p[4]);rect(.29,.73,.42,.03,p[5]);
      poly([[.31,.85],[.69,.85],[.73,.89],[.73,.94],[.69,.97],[.31,.97],[.27,.94],[.27,.89]],p[2]);
      rect(.32,.88,.36,.06,p[1]);rect(leftLit?.31:.61,.88,.06,.03,p[3]);
    }else{
      for(const [x,y] of fit('pixel').eyes){
        const r=.145;
        poly([[x-r+.04,y-r],[x+r-.04,y-r],[x+r,y-r+.04],[x+r,y+r-.04],[x+r-.04,y+r],[x-r+.04,y+r],[x-r,y+r-.04],[x-r,y-r+.04]],p[0]);
        // Cut out lens interior WITHOUT erasing the head/eyes below this layer.
        c.save();c.globalCompositeOperation='destination-out';
        poly([[x-r+.06,y-r+.035],[x+r-.06,y-r+.035],[x+r-.035,y-r+.06],[x+r-.035,y+r-.06],[x+r-.06,y+r-.035],[x-r+.06,y+r-.035],[x-r+.035,y+r-.06],[x-r+.035,y-r+.06]],'#000');c.restore();
        rect(x-r+.04,y-r,.10,.03,p[2]);
      }
      rect(.44,.31,.12,.03,p[0]);rect(.12,.34,.03,.12,p[0]);rect(.85,.34,.03,.12,p[0]);
    }
  }
  function paint(c,{mode,id,size,direction='up'}){
    if(!supports(mode,id))return false;
    c.save();c.imageSmoothingEnabled=mode!=='pixel';
    if(mode==='pixel')pixel(c,id,size,direction);else{c.scale(size,size);toy(c,id,direction);}
    c.restore();return true;
  }
  function occludeHead(c,{mode,id,size}){
    if(mode!=='toy'||!['crown','tiara','tophat'].includes(id))return false;
    // Rear head cap is behind the hat, including crown/tiara open notches.
    // The curved front of this mask stays under solid material, not on the face.
    c.save();c.scale(size,size);c.globalCompositeOperation='destination-out';
    const left=id==='tophat'?.135:id==='tiara'?.19:.165,right=1-left;
    c.fillStyle='#000';c.beginPath();c.moveTo(left,.74);
    c.quadraticCurveTo(.5,.86,right,.74);
    c.lineTo(right,1.01);c.lineTo(left,1.01);c.closePath();c.fill();c.restore();
    return true;
  }
  const api={ids,supports,fit,palettes,paint,occludeHead};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SnakeHeadwear=api;
})(typeof globalThis!=='undefined'?globalThis:this);
