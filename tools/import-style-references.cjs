// Development-only concept references. Lossless format conversion, no cropping.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
for(const flag of ['--sharp','--toy','--pixel'])if(!args.includes(flag)||!value(flag))throw new Error('Required: '+flag);
const sharp=require(path.resolve(value('--sharp'))),folder=path.resolve(__dirname,'../skin-templates/references');
async function main(){
  fs.mkdirSync(folder,{recursive:true});const references=[];
  for(const style of ['toy','pixel']){
    const source=path.resolve(value('--'+style)),meta=await sharp(source).metadata();
    if(meta.width!==1672)throw new Error('Expected original 1672px-wide concept, not a resized thumbnail');
    const file=style+'-concept.webp';await sharp(source).webp({lossless:true,effort:6}).toFile(path.join(folder,file));
    references.push({style,file,sourceFile:path.basename(source),sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),width:meta.width,height:meta.height,role:'concept-target-not-runtime'});
  }
  fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify({references},null,2)+'\n');
  console.log('Imported two lossless development-only concept references. Original files unchanged.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
