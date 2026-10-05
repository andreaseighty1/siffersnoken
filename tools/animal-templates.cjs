// Dog/Cow/Dragon ornaments and tail masks. The head/body masks stay unchanged.
const spec=require('../skin-templates/snake-spec.json'),body=require('../skin-templates/body-spec.json');
const {polygonSvg}=require('./feline-templates.cjs');
const isSpecial=theme=>Object.hasOwn(spec.animals,theme?.animalProfile||'');
const profile=theme=>spec.animals[theme.animalProfile];
function tailSection(theme,y,bend=0){
  const t=(y-spec.tail.attachment[1])/(profile(theme).tailTipY-spec.tail.attachment[1]);
  if(t<0||t>1)return null;
  const u=Math.max(0,(t-.055)/.945),kind=theme.animalProfile;
  const center=.5+(kind==='canine'?.12:kind==='bovine'?.025:.045)*Math.sin(Math.PI*u)+bend*u*u;
  const baseHalf=body.geometry.visibleDiameter*spec.tail.widthRelativeToBody/2;
  const shaft=kind==='bovine'?.028:kind==='canine'?.060:.042;
  const tuft=kind==='bovine'?.040*Math.exp(-(((u-.86)/.10)**2)):kind==='dragon'?.040*Math.exp(-(((u-.82)/.15)**2)):0;
  const cap=u>.90?Math.sqrt(Math.max(0,1-((u-.90)/.10)**2)):1;
  return {center,half:(shaft+(baseHalf-shaft)*Math.exp(-14*u)+tuft)*cap,t,u};
}
function insideTail(theme,x,y,bend=0){const s=tailSection(theme,y,bend);return !!s&&Math.abs(x-s.center)<=s.half;}
function tailContour(theme,size,bend=0){
  const left=[],right=[];
  for(let i=0;i<=160;i++){
    const y=spec.tail.attachment[1]+(profile(theme).tailTipY-spec.tail.attachment[1])*i/160,s=tailSection(theme,y,bend);
    left.push([s.center-s.half,y]);right.unshift([s.center+s.half,y]);
  }
  return polygonSvg([...left,...right],size);
}
const q=(a,b,c)=>Array.from({length:16},(_,i)=>{const t=i/16;return a.map((v,k)=>(1-t)**2*v+2*(1-t)*t*b[k]+t*t*c[k]);});
const closed=triples=>triples.flatMap(([a,b,c])=>q(a,b,c));
const dogEar=closed([
  [[.22,.64],[.025,.64],[.015,.80]],[[.015,.80],[.012,.97],[.105,.975]],
  [[.105,.975],[.22,.96],[.24,.80]],[[.24,.80],[.26,.69],[.22,.64]]
]);
const cowEar=closed([
  [[.23,.72],[.105,.61],[.005,.74]],[[.005,.74],[.06,.91],[.20,.86]],
  [[.20,.86],[.30,.79],[.23,.72]]
]);
const dragonFrill=closed([
  [[.22,.70],[.13,.63],[.02,.71]],[[.02,.71],[.08,.78],[.01,.84]],
  [[.01,.84],[.12,.93],[.25,.83]],[[.25,.83],[.28,.74],[.22,.70]]
]);
const cowHorn=closed([
  [[.22,.82],[.09,.80],[.105,.615]],[[.105,.615],[.125,.725],[.265,.735]],
  [[.265,.735],[.27,.79],[.22,.82]]
]);
const dragonHorn=closed([
  [[.23,.835],[.105,.775],[.085,.605]],[[.085,.605],[.19,.695],[.29,.725]],
  [[.29,.725],[.29,.80],[.23,.835]]
]);
function ear(theme){return theme.animalProfile==='canine'?dogEar:theme.animalProfile==='bovine'?cowEar:dragonFrill;}
function innerEar(theme){const poly=ear(theme);return poly.map(([x,y])=>[.135+(x-.135)*.58,.795+(y-.795)*.60]);}
function horn(theme){return theme.animalProfile==='canine'?[]:theme.animalProfile==='bovine'?cowHorn:dragonHorn;}
const patches=[closed([
  [[-.07,.20],[.09,-.02],[.27,.12]],[[.27,.12],[.41,.22],[.30,.38]],
  [[.30,.38],[.51,.58],[.25,.65]],[[.25,.65],[.19,.85],[.03,.76]],[[.03,.76],[-.14,.58],[-.07,.20]]
]),closed([
  [[.70,.49],[.99,.38],[1.06,.69]],[[1.06,.69],[.95,1.01],[.72,.91]],
  [[.72,.91],[.59,.83],[.65,.70]],[[.65,.70],[.53,.53],[.70,.49]]
])];
const saddle=closed([
  [[-.10,.12],[.30,-.16],[.68,.12]],[[.68,.12],[.86,.35],[.63,.43]],
  [[.63,.43],[.51,.73],[.24,.54]],[[.24,.54],[-.05,.70],[-.10,.12]]
]);
const scaleCenters=Array.from({length:4},(_,row)=>Array.from({length:4},(_,col)=>[.07+col*.28+(row%2?.14:0),.18+row*.23])).flat();
function scaleShape(cx,cy){return closed([
  [[cx-.15,cy-.07],[cx,cy-.16],[cx+.15,cy-.07]],
  [[cx+.15,cy-.07],[cx+.11,cy+.055],[cx,cy+.11]],
  [[cx,cy+.11],[cx-.11,cy+.055],[cx-.15,cy-.07]]
]);}
module.exports={isSpecial,profile,tailSection,insideTail,tailContour,ear,innerEar,horn,patches,saddle,scaleCenters,scaleShape};
