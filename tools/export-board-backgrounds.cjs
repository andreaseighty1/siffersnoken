// Mechanical WebP export only: generation and art changes use built-in imagegen.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const boards=require('../board-backgrounds.js');
const root=path.resolve(__dirname,'..');
const expected=Object.keys(boards.themes).flatMap(id=>['toy','pixel'].flatMap(style=>['wide','portrait'].map(layout=>({id,style,layout,...boards.asset(id,style,layout==='wide'?714:476,layout==='wide'?544:680)}))));
async function main(){
  const manifestPath=path.join(root,'skin-templates/generated/board-manifest.json');
  if(process.argv.includes('--check')){
    const manifest=JSON.parse(fs.readFileSync(manifestPath));
    if(manifest.assets.length!==48)throw Error('Expected 12 themes × 2 styles × 2 compositions');
    for(const entry of expected){
      const file=entry.src.split('?')[0],saved=manifest.assets.find(a=>a.file===file);
      if(!saved)throw Error('Missing manifest entry: '+file);
      const bytes=fs.readFileSync(path.join(root,file));
      if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Not WebP: '+file);
      if(crypto.createHash('sha256').update(bytes).digest('hex')!==saved.sha256)throw Error('Stale manifest: '+file);
      if(saved.hasAlpha||saved.width<=0||saved.height<=0)throw Error('Invalid opaque board dimensions: '+file);
    }
    console.log('CHECKED: 48 opaque board WebPs, 12 themes, two styles and two logical-board compositions.');return;
  }
  const sourceArg=process.argv.indexOf('--sources');
  if(sourceArg<0)throw Error('Provide --sources <JSON report> or --check');
  const sources=JSON.parse(fs.readFileSync(path.resolve(process.argv[sourceArg+1])));
  const sharp=require(process.env.SNAKE_SHARP_MODULE||'sharp');
  for(const source of sources){
    const expectedEntry=expected.find(a=>a.id===source.id&&a.style===source.style&&a.layout===source.layout);
    if(!expectedEntry||source.id==='forest')throw Error('Unexpected new board export');
    const destination=path.join(root,expectedEntry.src.split('?')[0]);
    const info=await sharp(source.path).metadata();
    const ratio=info.width/info.height;
    if(source.layout==='wide'?ratio<1.35||ratio>1.65:ratio<.60||ratio>.80)throw Error('Incorrect source composition: '+source.path);
    const quality=source.style==='pixel'?94:91;
    await sharp(source.path).removeAlpha().webp({quality,effort:6}).toFile(destination);
  }
  const assets=[];
  for(const entry of expected){
    const file=entry.src.split('?')[0],absolute=path.join(root,file);
    const info=await sharp(absolute).metadata(),bytes=fs.readFileSync(absolute);
    if(info.hasAlpha)throw Error('Board background must be opaque: '+file);
    const source=sources.find(a=>a.id===entry.id&&a.style===entry.style&&a.layout===entry.layout);
    assets.push({id:entry.id,style:entry.style,layout:entry.layout,file,width:info.width,height:info.height,hasAlpha:false,
      bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
      source:source?path.basename(source.path):'approved Sagoskogen pilot',quality:entry.style==='pixel'?94:91});
  }
  fs.writeFileSync(manifestPath,JSON.stringify({date:'2026-10-06',generator:'Built-in imagegen; one image per theme/style/composition',assets},null,2)+'\n');
  console.log('EXPORTED: '+sources.length+' new WebPs; manifest contains all '+assets.length+' board images.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
