// Run with: node tests/menu-news.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const fn=html.match(/function getVersionNewsHtml\([^]*?\n}/)[0];
const fallbackA=html.match(/id="menuNewsA">([^]*?)<\/span>/)[1];
const fallbackB=html.match(/id="menuNewsB" aria-hidden="true">([^]*?)<\/span>/)[1];
const expected=[['Negativa tal','Modern','Pixelretro','Original','Stjärnhimmel','genomskinliga Ghost'],['Negative numbers','Modern','Pixel retro','Original','Starry Sky','translucent Ghost'],['Negative Zahlen','Modern','Pixelretro','Original','Sternenhimmel','durchscheinender Geist']];
for(let lang=0;lang<3;lang++){
  const context=vm.createContext({pickLangText:(...texts)=>texts[lang]});
  vm.runInContext(fn,context);
  const news=context.getVersionNewsHtml();
  for(const term of expected[lang])assert.ok(news.includes(term));
  assert.ok(news.includes('3.12'));
  assert.ok(news.includes(String(require('../snake-style-config.js').skins.length)));
  assert.equal((news.match(/<strong>/g)||[]).length,4);
  assert.equal((news.match(/<\/strong>/g)||[]).length,4);
  if(lang===0)assert.equal(news,fallbackA,'HTML fallback and Swedish runtime text must agree');
}
assert.equal(fallbackA,fallbackB,'Ticker loop uses identical copies');
assert.ok(html.includes('animation:menuNewsScroll 52s linear infinite;'));
assert.ok(html.includes('<title>SifferSnoken V3.12'));
assert.ok(html.includes("textContent='Version 3.12'"));
assert.ok(!html.includes('3.11'));
const translations=fs.readFileSync(path.join(__dirname,'../translations.js'),'utf8');
assert.ok(!translations.includes('3.11'));
assert.equal([...translations.matchAll(/copyright:'[^']*v3\.12'/g)].length,2);
assert.ok(html.includes("if($('menuNewsA'))$('menuNewsA').innerHTML=newsHtml;"));
assert.ok(html.includes("if($('menuNewsB'))$('menuNewsB').innerHTML=newsHtml;"));
new vm.Script(html.match(/<script>([^]*?)<\/script>/)[1]);
console.log('PASS: updated news in three languages, matching fallback/loop copies, readable duration and app syntax.');
