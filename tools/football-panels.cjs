// Build-time spherical panel layout. Nothing here runs during game frames.
const phi=(1+Math.sqrt(5))/2;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const norm=a=>{const length=Math.hypot(...a);return a.map(v=>v/length);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const vertices=[];
for(const a of [-1,1])for(const b of [-phi,phi])vertices.push([0,a,b],[a,b,0],[b,0,a]);
const adjacent=(i,j)=>Math.abs(Math.hypot(...vertices[i].map((v,k)=>v-vertices[j][k]))-2)<1e-8;
const cut=(i,j)=>norm(vertices[i].map((v,k)=>2*v+vertices[j][k]));
const faces=[];
for(let i=0;i<12;i++){
  const z=norm(vertices[i]),x=norm(cross(z,Math.abs(z[0])<.8?[1,0,0]:[0,1,0])),y=cross(z,x);
  const points=vertices.flatMap((_,j)=>adjacent(i,j)?[cut(i,j)]:[]);
  points.sort((a,b)=>Math.atan2(dot(a,y),dot(a,x))-Math.atan2(dot(b,y),dot(b,x)));
  faces.push({black:true,points});
}
for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)for(let k=j+1;k<12;k++){
  if(adjacent(i,j)&&adjacent(j,k)&&adjacent(k,i))faces.push({black:false,points:[cut(i,j),cut(j,i),cut(j,k),cut(k,j),cut(k,i),cut(i,k)]});
}
const z=norm(vertices[0]),x=[1,0,0],y=cross(z,x);
const project=p=>[dot(p,x),dot(p,y)];
const panels=faces.filter(face=>dot(norm(face.points.reduce((sum,p)=>sum.map((v,i)=>v+p[i]),[0,0,0])),z)>1e-8).map(face=>({
  black:face.black,
  // Sample spherical edges so panels wrap around the round surface.
  points:face.points.flatMap((p,i)=>Array.from({length:8},(_,step)=>{
    const next=face.points[(i+1)%face.points.length],t=step/8;
    return project(norm(p.map((v,k)=>v*(1-t)+next[k]*t)));
  }))
}));
function contains(points,x,y){
  let hit=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const [ax,ay]=points[i],[bx,by]=points[j];
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;
  }
  return hit;
}
function distance(points,x,y){
  return Math.min(...points.map(([ax,ay],i)=>{
    const [bx,by]=points[(i+1)%points.length],dx=bx-ax,dy=by-ay;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(x-ax-t*dx,y-ay-t*dy);
  }));
}
module.exports={faces,panels,contains,distance};
