const assert=require('node:assert/strict');
const colors=require('../snake-colors.js'),styles=require('../snake-styles.js');
assert.deepEqual(colors.rotateRGB(255,0,0,120),[0,255,0]);
assert.deepEqual(colors.rotateRGB(255,0,0,240),[0,0,255]);
assert.deepEqual(colors.rotateRGB(84,84,84,275),[84,84,84]);
assert.equal(colors.rotateHex('#ff0000',120),'#00ff00');
const data=new Uint8ClampedArray([255,0,0,255,255,0,0,64,255,255,255,255,34,12,6,0]);
const before=data.slice();colors.recolorPixels(data,120);
assert.deepEqual([...data.slice(0,3)],[0,255,0]);
for(let i=3;i<data.length;i+=4)assert.equal(data[i],before[i],'Hue rotation never changes alpha');
assert.deepEqual([...data.slice(8)],[255,255,255,255,34,12,6,0]);
for(const hue of styles.config.colorCycles.regnbage.hues){
  for(const [r,g,b] of [[234,72,72],[255,146,146],[173,39,39],[59,20,20]]){
    const shifted=colors.rotateRGB(r,g,b,hue);
    assert.equal(Math.max(...shifted),Math.max(r,g,b));assert.equal(Math.min(...shifted),Math.min(r,g,b));
  }
}
const cycle=styles.config.colorCycles.regnbage;
assert.equal(new Set(Array.from({length:14},(_,i)=>styles.colorHue('regnbage',i))).size,7);
assert.notEqual(styles.colorHue('regnbage',2,0),styles.colorHue('regnbage',2,cycle.intervalMs));
assert.equal(styles.colorHue('regnbage',2,0),styles.colorHue('regnbage',2,cycle.intervalMs*7));
assert.equal(styles.colorHue('regnbage',2,0,true),styles.colorHue('regnbage',2,1000000,true));
assert.equal(styles.colorHue('guld',2,1000000),0);
console.log('PASS: seven bounded rainbow hues, stable shading/alpha, neutral colors, repeating animation and reduced motion.');
