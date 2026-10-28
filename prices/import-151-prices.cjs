// Audit saved HTML and attachments as data, without executing page scripts.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [htmlPath,...imageRoots]=process.argv.slice(2),fx=7.2;
if(!htmlPath||!imageRoots.length)throw Error('Usage: node prices/import-151-prices.cjs <HTML> <image folders...>');
const html=fs.readFileSync(htmlPath,'utf8');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');
const files=new Map();
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(/\.(jpg|jpeg|png|webp)$/i.test(item.name)){if(files.has(item.name)&&!fs.readFileSync(file).equals(fs.readFileSync(files.get(item.name))))throw Error('Conflicting image filename '+item.name);files.set(item.name,file);}}}
imageRoots.forEach(walk);
const starts=[...html.matchAll(/<div class="card w-full" data-name="([^"]+)"[^>]*data-price="([^"]*)"/g)];
const records=new Map(),excluded=[],duplicates=[];
for(let i=0;i<starts.length;i++){
 const entry=starts[i],name=decode(entry[1]),usd=Number(entry[2]);
 const match=name.match(/#([0-9]+)$/),n=match?Number(match[1]):NaN;
 const variant=name.includes('[Master Ball]')?'masterball':/\[(Reverse|Pokeball)\]/.test(name)?'pokeball':'base';
 if(!Number.isInteger(n)||n<1||n>210){excluded.push({name,usd,reason:'非本补充包001–210编号卡'});continue;}
 if(!Number.isFinite(usd)||usd<0)throw Error('Invalid quote '+name);
 const number=String(n).padStart(3,'0'),key='151-jp-'+number+'-'+variant;
 const block=html.slice(entry.index,starts[i+1]?.index);
 const src=decode(block.match(/<img\b[^>]*\bsrc="([^\"]+)"/)?.[1]||'');
 const imageFile=decodeURIComponent(src.split('/').pop());
 const source=decode(block.match(/<a href="(https:\/\/www\.pokeinvest\.io\/card\/[^\"]+)"/)?.[1]||'');
 const record={key,number,name,variant,usd,cny:Math.round(usd*fx*100)/100,source,imageFile,imageAvailable:files.has(imageFile)};
 if(records.has(key)){
   const previous=records.get(key);duplicates.push({key,names:[previous.name,name],prices:[previous.usd,usd]});
   if(previous.usd>0&&usd>0&&previous.usd!==usd)throw Error('Conflicting nonzero quote '+key);
   if(previous.usd>0)continue;
 }
 records.set(key,record);
}
const cards=[...records.values()].sort((a,b)=>a.key.localeCompare(b.key));
if(cards.length!==516)throw Error('Expected 210 base + 153 Pokeball + 153 Master Ball');
const counts=Object.fromEntries(['base','pokeball','masterball'].map(v=>[v,cards.filter(c=>c.variant===v).length]));
for(const c of cards)c.imageSharedWithBase=c.variant!=='base'&&c.imageFile===records.get('151-jp-'+c.number+'-base')?.imageFile;
const packBlock=html.match(/<a href="https:\/\/www\.pokeinvest\.io\/card\/japanese-scarlet-and-violet-151\/booster-pack"[^]*?<\/a>/)?.[0];
const packUsd=Number(packBlock?.match(/\$([0-9]+\.[0-9]{2})/)?.[1]);
const missing=cards.filter(c=>!c.imageAvailable).map(c=>({key:c.key,name:c.name,imageFile:c.imageFile}));
const meta={organizedAt:'2026-10-28',sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),usdToCny:fx,source:'用户上传PokeInvest网页快照，非实时行情',rawRows:starts.length,counts,packUsd,packCny:Math.round(packUsd*fx*100)/100,duplicates,excluded,missing,sharedMasterballImages:cards.filter(c=>c.variant==='masterball'&&c.imageSharedWithBase).length};
fs.writeFileSync(path.join(__dirname,'151日版-报价与图片核对.json'),JSON.stringify({meta,cards},null,2)+'\n');
const rows=[['唯一编号','卡号','卡名','版本','美元报价','固定汇率','人民币基础报价','图片文件','图片状态','来源'],...cards.map(c=>[c.key,c.number,c.name,{base:'普通/原版',pokeball:'精灵球闪',masterball:'大师球闪'}[c.variant],c.usd,fx,c.cny,c.imageFile,!c.imageAvailable?'缺图':c.imageSharedWithBase?'源网页与原版共用图片，纹理未核实':'已提供',c.source])];
fs.writeFileSync(path.join(__dirname,'151日版-美元人民币价格表.csv'),'\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'));
console.log(JSON.stringify({rows:starts.length,counts,missing:missing.length,sharedMasterballImages:meta.sharedMasterballImages,packCny:meta.packCny,duplicates:duplicates.length,excluded:excluded.length},null,2));
