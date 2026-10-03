// Export only playable themes and WebPs; concept references never ship at runtime.
const fs=require('node:fs'),path=require('node:path');
const body=require('./body-templates.cjs'),snake=require('./snake-templates.cjs');
const root=path.resolve(__dirname,'..');
const ids=body.themes.filter(t=>t.id!=='neutral').map(t=>t.id);
function config(){
  return {skins:ids,rendering:body.spec.rendering,
    assetRevisions:Object.fromEntries(body.themes.filter(t=>t.assetRevision).map(t=>[t.id,t.assetRevision])),
    colorCycles:Object.fromEntries(body.themes.filter(t=>t.colorCycle).map(t=>[t.id,t.colorCycle])),
    outlineColors:Object.fromEntries(body.themes.filter(t=>ids.includes(t.id)).map(t=>[t.id,t.palette.ink])),
    styles:Object.fromEntries(Object.entries(body.spec.styles).map(([id,s])=>{
    const join=snake.joinGeometry(id);
    return [id,{frame:s.frame,headScale:s.headRenderScale,bodyScale:1.26*1.08,
      pivot:join.pivot,chord:join.bodyChord}];
  }))};
}
function exportAssets({check=false}={}){
  const manifest=require('../skin-templates/generated/snake-manifest.json');
  const files=manifest.outputs.filter(o=>!o.id||ids.includes(o.id));
  for(const asset of files){
    const src=path.join(root,'skin-templates',asset.file);
    const dst=path.join(root,'skins',asset.file.replace(/^generated\//,'styles/'));
    if(check){if(!fs.readFileSync(src).equals(fs.readFileSync(dst)))throw Error('Stale runtime asset: '+dst);}
    else{fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);}
  }
  const content='// Generated from the approved template specs. Run tools/export-snake-styles.cjs.\n'+
    '(function(root){const config='+JSON.stringify(config())+';if(typeof module!=="undefined"&&module.exports)module.exports=config;else root.SnakeStyleConfig=config;})(typeof globalThis!=="undefined"?globalThis:this);\n';
  const target=path.join(root,'snake-style-config.js');
  if(check){if(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n')!==content)throw Error('Stale runtime config');}
  else fs.writeFileSync(target,content);
  console.log(`${check?'CHECKED':'EXPORTED'} ${files.length} runtime WebPs, ${ids.length} themes, both styles.`);
}
module.exports={config,exportAssets};
if(require.main===module)exportAssets({check:process.argv.includes('--check')});
