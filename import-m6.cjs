// Import saved HTML and image files as data; never execute third-party scripts.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [htmlPath,imagesPath]=process.argv.slice(2),fx=7.2;
if(!htmlPath||!imagesPath)throw Error('Usage: node import-m6.cjs <HTML> <extracted image directory>');
const html=fs.readFileSync(htmlPath,'utf8');
const clean=s=>s.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').trim();
const table=html.match(/Full Japanese Storm Emeralda card list[^]*?<tbody>([^]*?)<\/tbody>/)?.[1];
if(!table)throw Error('Missing full table');
const blocks=[...html.matchAll(/<div class="card w-full" data-name="[^"]* #([0-9]+)"[^]*?(?=<div class="card w-full"|<\/main>|$)/g)];
const images=new Map();
for(const block of blocks){
 const src=block[0].match(/<img\b[^>]*\bsrc="([^\"]+)"/)?.[1];
 const filename=src&&decodeURIComponent(src.split('/').pop());
 if(!filename||!/^240(?:\([0-9]+\))?\.jpg$/.test(filename))throw Error('Unexpected image '+src);
 if(images.has(Number(block[1])))throw Error('Duplicate card image');
 images.set(Number(block[1]),path.join(imagesPath,filename));
}
const cards=[],quotes={},seen=new Set();
for(const row of table.matchAll(/<tr\b[^>]*>([^]*?)<\/tr>/g)){
 const cells=[...row[1].matchAll(/<td\b[^>]*>([^]*?)<\/td>/g)].map(m=>m[1]);
 if(cells.length!==3)throw Error('Unexpected table row');
 const n=Number(clean(cells[0])),name=clean(cells[1]),price=clean(cells[2]);
 if(!Number.isInteger(n)||n<1||n>113||seen.has(n)||!/^\$[0-9,]+\.[0-9]{2}$/.test(price))throw Error('Invalid quote row');
 seen.add(n);
 const number=String(n).padStart(3,'0'),key='m6-jp-'+number,image='assets/m6-jp/'+number+'.jpg';
 const usd=Number(price.replace(/[$,]/g,''));
 const source=cells[1].match(/href="([^"]+)"/)?.[1];
 if(!images.has(n)||!fs.existsSync(images.get(n)))throw Error('Missing image '+number);
 const rr=new Set([9,15,21,24,33,48,58,62]),r=new Set([5,11,18,31,39,43,52,56]);
 const rarity=n===113?'mur':n>=107?'sar':n>=89?'sr':n>=77?'ar':rr.has(n)?'rr':r.has(n)?'r':'normal';
 cards.push({key,number,name,image,lang:'日版',set:'M6',rarity});
 quotes[key]={usd,cny:Math.round(usd*fx*100)/100,name,source};
}
if(cards.length!==113||images.size!==113)throw Error('Expected 113 matched images and quotes');
cards.sort((a,b)=>a.number.localeCompare(b.number));
fs.mkdirSync('assets/m6-jp',{recursive:true});
for(const card of cards)fs.copyFileSync(images.get(Number(card.number)),card.image);
const packBlock=html.match(/<a href="https:\/\/www\.pokeinvest\.io\/card\/japanese-storm-emeralda\/booster-pack"[^]*?<\/a>/)?.[0];
const packFile=packBlock?.match(/<img src="[^\"]*\/([^\"/]+)"/)?.[1];
const packUsd=Number(packBlock?.match(/\$([0-9]+\.[0-9]{2})/)?.[1]);
if(!packFile||!/^240(?:\([0-9]+\))?\.jpg$/.test(packFile)||!Number.isFinite(packUsd))throw Error('Missing pack cover/quote');
fs.copyFileSync(path.join(imagesPath,packFile),'assets/m6-jp/pack.jpg');
const meta={name:'Storm Emeralda',code:'M6',language:'日版',usdToCny:fx,organizedAt:'2026-10-28',source:'用户上传PokeInvest网页快照，非实时价格',sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),ready:true,packUsd,packCny:Math.round(packUsd*fx*100)/100,count:5};
fs.writeFileSync('m6-data.js','const m6Meta = '+JSON.stringify(meta,null,2)+';\nconst m6Cards = '+JSON.stringify(cards,null,2)+';\nconst m6PriceQuotes = '+JSON.stringify(quotes,null,2)+';\nObject.assign(cardPriceQuotes, m6PriceQuotes);\n');
const rows=[['卡号','名称','语言','系列','美元网页报价','固定汇率','人民币基础报价','来源'],...cards.map(c=>[c.number,c.name,c.lang,c.set,quotes[c.key].usd,fx,quotes[c.key].cny,quotes[c.key].source])];
fs.writeFileSync('prices/M6日版-美元人民币价格表.csv','\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'));
console.log('Imported 113 M6 images and quotes, USD/CNY = 7.20; pack CNY =',meta.packCny);
