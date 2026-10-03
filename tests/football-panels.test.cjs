const assert=require('node:assert/strict');
const {faces,panels,contains,distance}=require('../tools/football-panels.cjs');
assert.equal(faces.filter(f=>f.black).length,12);
assert.equal(faces.filter(f=>!f.black).length,20);
for(const face of faces){
  assert.equal(face.points.length,face.black?5:6);
  for(const point of face.points)assert.ok(Math.abs(Math.hypot(...point)-1)<1e-10);
}
assert.ok(panels.some(panel=>panel.black&&contains(panel.points,0,0)),'Central black pentagon');
for(const panel of panels){
  assert.ok(panel.points.length>=40,'Curved edges sampled on the sphere');
  assert.ok(panel.points.every(p=>p.every(Number.isFinite)&&Math.hypot(...p)<=1+1e-10));
  const [x,y]=panel.points[0];assert.equal(distance(panel.points,x,y),0);
}
assert.equal(contains([[0,0],[1,0],[1,1],[0,1]],.5,.5),true);
assert.equal(contains([[0,0],[1,0],[1,1],[0,1]],2,.5),false);
console.log('PASS: 12 pentagons, 20 hexagons, spherical panel edges and stable planar sampling.');
