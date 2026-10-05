// Shared Tiger/Cat geometry. Fixed head/body masks; only ears and tail are special.
const spec=require('../skin-templates/snake-spec.json');
const bodySpec=require('../skin-templates/body-spec.json');
const isFeline=theme=>theme?.animalProfile==='feline';
function tailSection(y,bend=0){
  const t=(y-spec.tail.attachment[1])/(spec.feline.tailTipY-spec.tail.attachment[1]);
  if(t<0||t>1)return null;
  // A fixed collar preserves the attachment plane in every animated frame.
  const u=Math.max(0,(t-.055)/.945);
  const center=.5+.055*Math.sin(Math.PI*u)+.095*u*u+bend*u*u;
  const baseHalf=bodySpec.geometry.visibleDiameter*spec.tail.widthRelativeToBody/2;
  const cap=u>.84?Math.sqrt(Math.max(0,1-((u-.84)/.16)**2)):1;
  const half=(.055+(baseHalf-.055)*Math.exp(-14*u))*cap;
  return {center,half,t};
}
function insideTail(x,y,bend=0){const s=tailSection(y,bend);return !!s&&Math.abs(x-s.center)<=s.half;}
function tailContour(size,bend=0){
  const left=[],right=[];
  for(let i=0;i<=128;i++){
    const y=spec.tail.attachment[1]+(spec.feline.tailTipY-spec.tail.attachment[1])*i/128,s=tailSection(y,bend);
    left.push([s.center-s.half,y]);right.unshift([s.center+s.half,y]);
  }
  return polygonSvg([...left,...right],size);
}
const quad=(a,b,c,n=12)=>Array.from({length:n},(_,i)=>{const t=i/n;return a.map((v,k)=>(1-t)**2*v+2*(1-t)*t*b[k]+t*t*c[k]);});
// Rounded triangular ears, behind both styles' eye zones. Shared exactly.
const ear=[...quad([.035,.65],[.034,.62],[.07,.65]),
  ...quad([.07,.65],[.24,.69],[.25,.79]),
  ...quad([.25,.79],[.18,.85],[.075,.89]),
  ...quad([.075,.89],[.035,.90],[.035,.65])];
const earInner=ear.map(([x,y])=>[.12+(x-.12)*.62,.765+(y-.765)*.62]);
function polygonSvg(points,size){return `<polygon points="${points.map(p=>p.map(v=>(v*size).toFixed(4)).join(',')).join(' ')}"/>`;}
function inPolygon(points,x,y){
  let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
  }return hit;
}
function earHit(x,y,inner=false){return inPolygon(inner?earInner:ear,Math.min(x,1-x),y);}
module.exports={isFeline,tailSection,insideTail,tailContour,ear,earInner,earHit,polygonSvg};
