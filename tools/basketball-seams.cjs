// Four ball seams shared by Modern and native Pixelretro. Build time only.
function frame(part){
  return part==='tail'?{cx:.5,cy:.30,rx:.17,ry:.245}:part==='head-base'?{cx:.5,cy:.5,rx:.4671875,ry:.43}:{cx:.5,cy:.5,rx:.40625,ry:.40625};
}
const curve=side=>Array.from({length:65},(_,i)=>{
  const t=i/64,u=1-t;
  return [side==='left'?.02*(u*u*u+t*t*t)+.37*3*u*t:.98*(u*u*u+t*t*t)+.63*3*u*t,t];
});
const paths=[[[.5,0],[.5,1]],[[0,.5],[1,.5]],curve('left'),curve('right')];
function mapped(part){const f=frame(part);return paths.map(line=>line.map(([u,v])=>[f.cx+(u-.5)*2*f.rx,f.cy+(v-.5)*2*f.ry]));}
function distance(line,x,y){let best=Infinity;for(let i=1;i<line.length;i++){const [ax,ay]=line[i-1],[bx,by]=line[i],dx=bx-ax,dy=by-ay;const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));best=Math.min(best,Math.hypot(x-ax-t*dx,y-ay-t*dy));}return best;}
function pixel(x,y,size,part){const width=part==='tail'?.019:.016;return mapped(part).some(line=>distance(line,(x+.5)/size,(y+.5)/size)<Math.max(width,.48/size));}
function svg(p,size,part){const data=mapped(part).map(line=>'M '+line.map(([x,y])=>`${(x*size).toFixed(4)},${(y*size).toFixed(4)}`).join(' L ')).join(' ');const width=size*(part==='tail'?.025:.028);return `<path d="${data}" fill="none" stroke="${p.shade}" stroke-width="${width*1.45}" stroke-opacity=".45"/><path d="${data}" fill="none" stroke="${p.ink}" stroke-width="${width}"/>`;}
module.exports={paths,frame,mapped,distance,pixel,svg};
