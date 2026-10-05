// Declarative, code-native headwear surfaces. Pixel art is rasterized on its
// native grid, never obtained by shrinking the anti-aliased Modern drawing.
(function(root){
  'use strict';
  const designs={};
  const earth=['#35251e','#805037','#b57b4c','#efc887','#fff0cb','#42696b'];
  const navy=['#17283d','#345373','#759eb5','#dce9e6','#fff8dc','#e1b24e'];
  const pink=['#61253e','#a7365d','#e75e89','#ffb4c2','#fff2d9','#548b51'];
  const gold=['#654125','#ac7430','#e3b456','#fff0b3','#58b9c3','#d5fff0'];
  const silver=['#2c3c53','#57748b','#9dc0cb','#eef7ed','#df6287','#ffd9a9'];
  const cyan=['#1b4058','#2d7d96','#6cdae0','#e0fff4','#e3b863','#ac82d5'];
  const poly=(points,color,shade=false)=>({type:'polygon',points,color,shade});
  const oval=(x,y,rx,ry,color,shade=false,cut=false)=>({type:'ellipse',x,y,rx,ry,color,shade,cut});
  const box=(x,y,w,h,r,color,shade=false)=>({type:'round',x,y,w,h,r,color,shade});
  const line=(points,width,color)=>({type:'line',points,width,color});
  const add=(id,label,palette,layers,cap=null,face=false)=>designs[id]={label,palette,layers,cap,face};
  const band=(color=2)=>[oval(.5,.748,.34,.082,0),oval(.5,.738,.325,.067,color,true)];
  const gem=(x,y,r,color)=>[poly([[x,y-r],[x+r*.75,y],[x,y+r],[x-r*.75,y]],0),poly([[x,y-r*.75],[x+r*.50,y],[x,y+r*.70],[x-r*.50,y]],color,true)];
  const bow=(color=2)=>[poly([[.48,.77],[.26,.94],[.23,.71],[.32,.65]],0),poly([[.52,.77],[.74,.94],[.77,.71],[.68,.65]],0),poly([[.46,.79],[.28,.91],[.27,.73],[.32,.69]],color,true),poly([[.54,.79],[.72,.91],[.73,.73],[.68,.69]],color,true),poly([[.42,.81],[.30,.99],[.45,.94],[.5,.84]],color),poly([[.58,.81],[.70,.99],[.55,.94],[.5,.84]],color),oval(.5,.785,.092,.068,0),oval(.5,.775,.077,.058,color,true)];
  const ring=(x,y,rx,ry,width,color=2)=>[oval(x,y,rx,ry,0),oval(x,y,rx-.013,ry-.013,color,true),oval(x,y,rx-width,ry-width,0,false,true)];
  const cap={left:.17,y:.745};
  add('pirate','Pirat',navy,[poly([[.13,.74],[.20,.92],[.36,.89],[.43,.99],[.57,.99],[.64,.89],[.80,.92],[.87,.74]],0),poly([[.18,.75],[.24,.88],[.38,.85],[.45,.95],[.55,.95],[.62,.85],[.76,.88],[.82,.75]],1,true),...band(1),line([[.43,.85],[.57,.94]],.022,3),line([[.57,.85],[.43,.94]],.022,3),oval(.5,.875,.061,.046,3),oval(.482,.87,.012,.013,0),oval(.518,.87,.012,.013,0),box(.475,.902,.05,.021,.006,3)],{left:.13,y:.748});
  add('cowboy','Cowboy',earth,[oval(.5,.76,.39,.105,0),oval(.5,.75,.375,.092,2,true),box(.28,.71,.44,.26,.085,0),box(.298,.72,.404,.23,.075,2,true),oval(.5,.91,.20,.068,1),oval(.5,.90,.18,.053,2,true),box(.285,.76,.43,.063,.02,1),...gem(.5,.787,.039,3)],{left:.12,y:.76});
  const petals=Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5;return oval(.25+Math.cos(a)*.105,.79+Math.sin(a)*.105,.068,.065,2,true);});
  add('flower','Blomma',pink,[line([[.23,.77],[.38,.95]],.037,5),poly([[.29,.89],[.42,.85],[.39,.95]],5),...petals,oval(.25,.79,.049,.048,3,true)]);
  add('partyhat','Partyhatt',pink,[poly([[.20,.70],[.80,.70],[.54,.97],[.46,.97]],0),poly([[.24,.73],[.76,.73],[.51,.94],[.49,.94]],2,true),poly([[.28,.75],[.37,.75],[.60,.85],[.55,.88]],3),poly([[.45,.73],[.56,.73],[.69,.78],[.64,.82]],3),...band(2),oval(.5,.966,.051,.034,4,true)],cap);
  add('schoolcap','Studentmössa',navy,[...band(1),poly([[.12,.82],[.5,.66],[.88,.82],[.5,.98]],0),poly([[.17,.82],[.5,.70],[.83,.82],[.5,.94]],1,true),line([[.50,.82],[.78,.85],[.80,.96]],.025,5),oval(.5,.82,.025,.025,5),box(.77,.92,.06,.074,.015,5,true)],{left:.13,y:.79});
  add('captain','Kapten',navy,[oval(.5,.80,.33,.19,0),oval(.5,.79,.313,.175,3,true),...band(1),oval(.5,.86,.073,.057,1),line([[.5,.832],[.5,.895]],.018,5),line([[.457,.871],[.47,.891],[.5,.902],[.53,.891],[.543,.871]],.016,5),line([[.467,.846],[.533,.846]],.014,5)],cap);
  add('viking','Viking',silver,[poly([[.23,.82],[.13,.94],[.11,.74],[.18,.67],[.27,.75]],0),poly([[.77,.82],[.87,.94],[.89,.74],[.82,.67],[.73,.75]],0),poly([[.22,.79],[.16,.88],[.15,.74],[.18,.71],[.24,.77]],3,true),poly([[.78,.79],[.84,.88],[.85,.74],[.82,.71],[.76,.77]],3,true),oval(.5,.80,.29,.19,0),oval(.5,.79,.273,.175,2,true),box(.475,.69,.05,.29,.012,3),...band(1),oval(.26,.735,.021,.021,5),oval(.74,.735,.021,.021,5)],cap);
  add('bow','Rosett',pink,bow());
  add('apple_bow','Äppelrosett',pink,[...bow(1),oval(.478,.78,.057,.053,2,true),oval(.526,.78,.057,.053,2,true),line([[.5,.75],[.51,.706]],.018,0),poly([[.51,.734],[.57,.67],[.61,.72],[.54,.748]],5),oval(.469,.76,.013,.016,3)]);
  add('detective_cap','Detektivmössa',earth,[oval(.5,.79,.33,.19,0),oval(.5,.78,.314,.173,2,true),...band(1),oval(.17,.78,.065,.098,1,true),oval(.83,.78,.065,.098,1,true),...Array.from({length:4},(_,i)=>line([[.30+i*.13,.80],[.36+i*.09,.935]],.014,1)),line([[.27,.85],[.73,.85]],.016,3),line([[.34,.91],[.66,.91]],.014,3)],cap);
  add('weld_glasses','Svetsglasögon',earth,[line([[.12,.35],[.88,.35]],.055,1),box(.145,.18,.31,.29,.055,0),box(.545,.18,.31,.29,.055,0),box(.172,.205,.256,.235,.038,2,true),box(.572,.205,.256,.235,.038,2,true),box(.194,.227,.212,.190,.032,0),box(.594,.227,.212,.190,.032,0),line([[.20,.235],[.29,.235]],.019,3),line([[.60,.235],[.69,.235]],.019,3),box(.44,.28,.12,.055,.015,1)],null,true);
  // These opaque frames have transparent interiors; eyes/blinks are not covered.
  for(const l of designs.weld_glasses.layers)if(l.type==='round'&&l.color===0&&l.w<.25)l.cut=true;
  add('sailor_cap','Sjömansmössa',navy,[oval(.5,.82,.32,.155,0),oval(.5,.81,.304,.139,3,true),...band(1),line([[.67,.76],[.80,.94]],.035,1),line([[.72,.76],[.87,.89]],.035,1),box(.45,.705,.10,.057,.012,5,true)],cap);
  add('sugar_crown','Sockerkrona',pink,[poly([[.18,.74],[.24,.96],[.36,.85],[.5,.99],[.64,.85],[.76,.96],[.82,.74]],0),poly([[.23,.76],[.27,.91],[.36,.80],[.5,.94],[.64,.80],[.73,.91],[.77,.76]],2,true),...band(2),oval(.28,.90,.035,.035,3,true),oval(.5,.94,.043,.036,4),oval(.72,.90,.035,.035,3,true),line([[.30,.71],[.34,.765]],.023,4),line([[.45,.70],[.49,.77]],.023,4),line([[.61,.70],[.65,.765]],.023,4)],cap);
  add('key_halo','Nyckelgloria',gold,[...ring(.5,.81,.32,.15,.038),line([[.38,.82],[.66,.82]],.038,2),...ring(.35,.82,.054,.048,.022),line([[.62,.82],[.62,.87]],.035,2),line([[.66,.82],[.66,.86]],.032,2)]);
  const gearPoints=Array.from({length:48},(_,i)=>{const a=i*Math.PI/24,r=i%4<2?.112:.086;return [.5+Math.cos(a)*r,.872+Math.sin(a)*r];});
  add('gear_antenna','Kuggantenn',silver,[line([[.5,.68],[.5,.88]],.037,0),line([[.5,.68],[.5,.88]],.020,2),poly(gearPoints,1,true),oval(.5,.872,.057,.057,3),oval(.5,.872,.029,.029,0),box(.42,.66,.16,.063,.022,2,true)]);
  add('pearl_tiara','Pärltiara',silver,[...band(2),...[[.24,.80,.042],[.36,.855,.047],[.5,.895,.055],[.64,.855,.047],[.76,.80,.042]].flatMap(([x,y,r])=>[oval(x,y,r+.012,r+.012,0),oval(x,y,r,r,3,true)])]);
  add('prism_diadem','Prismadiadem',cyan,[...band(2),poly([[.38,.78],[.42,.91],[.5,.99],[.58,.91],[.62,.78]],0),poly([[.42,.80],[.45,.90],[.5,.955],[.55,.90],[.58,.80]],2,true),poly([[.5,.82],[.5,.95],[.55,.90]],5),line([[.445,.83],[.5,.925]],.018,3)],{left:.19,y:.745});
  add('shadow_monocle','Skuggmonokel',silver,[line([[.79,.40],[.85,.48],[.79,.56],[.83,.65]],.017,2),...ring(.70,.30,.146,.156,.028,2),line([[.607,.205],[.65,.185]],.014,3)],null,true);
  add('robot_diadem','Robotdiadem',silver,[box(.19,.68,.62,.16,.043,0),box(.211,.695,.578,.128,.03,2,true),line([[.29,.77],[.24,.94]],.028,1),line([[.71,.77],[.76,.94]],.028,1),oval(.24,.94,.037,.037,4,true),oval(.76,.94,.037,.037,4,true),box(.41,.697,.18,.105,.025,0),box(.434,.718,.132,.06,.012,4),box(.26,.713,.062,.062,.01,3),box(.678,.713,.062,.062,.01,3)]);
  add('compass_halo','Kompassgloria',cyan,[...ring(.5,.81,.31,.16,.03),poly([[.5,.68],[.56,.81],[.5,.81]],4),poly([[.5,.94],[.44,.81],[.5,.81]],3),oval(.5,.81,.025,.025,0),...[[.22,.81],[.78,.81],[.5,.695],[.5,.925]].map(([x,y])=>oval(x,y,.013,.013,3))]);
  add('museum_crown','Museikrona',gold,[poly([[.17,.74],[.24,.96],[.38,.86],[.43,.99],[.57,.99],[.62,.86],[.76,.96],[.83,.74]],0),poly([[.22,.77],[.27,.90],[.40,.81],[.47,.95],[.53,.95],[.60,.81],[.73,.90],[.78,.77]],2,true),...band(2),...gem(.5,.82,.081,4),...gem(.28,.79,.035,4),...gem(.72,.79,.035,4),line([[.43,.94],[.57,.94]],.025,3)],cap);
  add('relic_halo','Relikgloria',cyan,[...ring(.5,.81,.32,.16,.032),...gem(.22,.81,.048,4),...gem(.50,.95,.048,5),...gem(.78,.81,.048,2)]);
  add('santa','Tomteluva',pink,[poly([[.18,.72],[.25,.87],[.54,.99],[.75,.90],[.70,.82],[.58,.88],[.43,.73]],0),poly([[.23,.74],[.29,.84],[.54,.94],[.69,.88],[.66,.86],[.56,.91],[.43,.76]],1,true),...band(4),oval(.70,.869,.071,.062,4,true)],cap);
  const orange=['#62351e','#ad5723','#e78a2f','#ffd581','#fff0c2','#528743'];
  add('pumpkin','Pumpahatt',orange,[oval(.5,.81,.31,.17,0),oval(.34,.80,.135,.146,1,true),oval(.66,.80,.135,.146,1,true),oval(.5,.80,.18,.15,2,true),poly([[.5,.92],[.48,.99],[.57,.97],[.57,.92]],5),poly([[.39,.78],[.44,.83],[.35,.83]],0),poly([[.61,.78],[.65,.83],[.56,.83]],0),poly([[.40,.866],[.47,.889],[.50,.873],[.54,.889],[.60,.866],[.58,.906],[.43,.906]],0)],{left:.2,y:.79});
  add('bunny','Kaninöron',pink,[oval(.29,.823,.098,.172,0),oval(.71,.823,.098,.172,0),oval(.29,.816,.081,.157,4,true),oval(.71,.816,.081,.157,4,true),oval(.29,.827,.043,.12,2,true),oval(.71,.827,.043,.12,2,true),oval(.5,.716,.255,.051,4,true)]);
  function contains(s,x,y){
    if(s.type==='ellipse')return ((x-s.x)/s.rx)**2+((y-s.y)/s.ry)**2<=1;
    if(s.type==='round'){
      const r=Math.min(s.r,s.w/2,s.h/2),dx=Math.max(s.x+r-x,0,x-(s.x+s.w-r)),dy=Math.max(s.y+r-y,0,y-(s.y+s.h-r));
      return x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h&&dx*dx+dy*dy<=r*r;
    }
    if(s.type==='line')return s.points.slice(1).some(([bx,by],i)=>{const [ax,ay]=s.points[i],vx=bx-ax,vy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy||1)));return Math.hypot(x-ax-t*vx,y-ay-t*vy)<=s.width/2;});
    let hit=false;for(let i=0,j=s.points.length-1;i<s.points.length;j=i++){const [ax,ay]=s.points[i],[bx,by]=s.points[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;}return hit;
  }
  function drawPath(c,s){
    c.beginPath();
    if(s.type==='ellipse')c.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);
    else if(s.type==='round')c.roundRect(s.x,s.y,s.w,s.h,s.r);
    else{s.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(s.type!=='line')c.closePath();}
  }
  function paint(c,{mode,id,size,direction='up',eyes}){
    const d=designs[id];if(!d)return false;
    const a={up:0,right:Math.PI/2,down:Math.PI,left:-Math.PI/2}[direction];
    const vx=-.7*Math.cos(a)-.9*Math.sin(a),vy=.7*Math.sin(a)-.9*Math.cos(a);
    // Face motifs use the shared eye anchors; museum monocle uses the right eye.
    const shiftY=d.face?((eyes?.[0]?.[1]??(mode==='pixel'?.34:.29))-.30):0;
    const faceScale=d.face&&eyes?(eyes[1][0]-eyes[0][0])/.40:1;
    if(mode==='pixel'){
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=((x+.5)/size-.5)/faceScale+.5,v=(y+.5)/size-shiftY;let color=null;
        for(const s of d.layers)if(contains(s,u,v)){
          color=s.cut?null:s.color;
          if(s.shade&&!s.cut&&s.color===2){const light=(u-.5)*vx+(v-.78)*vy;color=light>.09?3:light<-.13?1:2;}
        }
        if(color!==null){c.fillStyle=d.palette[color];c.fillRect(x,y,1,1);}
      }
    }else{
      c.scale(size,size);c.translate(.5,shiftY);c.scale(faceScale,1);c.translate(-.5,0);
      for(const s of d.layers){
        c.save();if(s.cut)c.globalCompositeOperation='destination-out';
        let fill=d.palette[s.color];
        if(s.shade){const g=c.createLinearGradient(.5+vx*.38,.78+vy*.38,.5-vx*.38,.78-vy*.38),i=s.color;g.addColorStop(0,d.palette[Math.min(i+1,3)]);g.addColorStop(.50,fill);g.addColorStop(1,d.palette[Math.max(i-1,0)]);fill=g;}
        drawPath(c,s);c.fillStyle=fill;c.strokeStyle=fill;
        if(s.type==='line'){c.lineWidth=s.width;c.lineCap='round';c.lineJoin='round';c.stroke();}else c.fill();c.restore();
      }
    }
    return true;
  }
  const api={designs,contains,paint};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SnakeHeadwearDesigns=api;
})(typeof globalThis!=='undefined'?globalThis:this);
