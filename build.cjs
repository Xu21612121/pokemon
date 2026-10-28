const fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const imagePattern=/assets\/(?:30th(?:-jp)?|m6-jp|151-jp)\/[\w.-]+\.(?:webp|png|jpg)/g;
const embeddedAssets={};
const dataURL=file=>'data:image/'+(file.endsWith('.jpg')?'jpeg':file.endsWith('.png')?'png':'webp')+';base64,'+fs.readFileSync(path.join(__dirname,file)).toString('base64');
function inlineScript(name){
 const source=read(name);
 // Keep shared illustrations embedded once, without merging card identities.
 if(name.endsWith('-data.js'))return source.replace(new RegExp('"('+imagePattern.source+')"','g'),(_,file)=>{
   if(!embeddedAssets[file])embeddedAssets[file]=dataURL(file);
   return 'embeddedAssets['+JSON.stringify(file)+']';
 });
 return source.replace(imagePattern,file=>dataURL(file));
}
let html=read('index.html').replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+read('style.css').replace(/^\s*@import\s+url\([^\r\n]*\);\s*$/gm,'')+'</style>');
html=html.replace(/<script src="([\w.-]+\.js)"><\/script>/g,(_,file)=>'<script>'+inlineScript(file)+'</script>');
html=html.replace('<script>',()=>'<script>const embeddedAssets = '+JSON.stringify(embeddedAssets)+';</script><script>');
fs.writeFileSync(path.join(__dirname,'口袋藏馆.html'),html);
fs.writeFileSync(path.join(__dirname,'口袋藏馆-v0.5.3-151三卡包版.html'),html);
console.log('Built offline game with',Object.keys(embeddedAssets).length,'deduplicated image assets');
