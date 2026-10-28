// Generate display-sized assets; source uploads remain unchanged.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const audit=JSON.parse(fs.readFileSync('prices/151日版-报价与图片核对.json','utf8'));
const roots=process.argv.slice(2);if(!roots.length)throw Error('Supply extracted image folders');
const sources=new Map();function walk(d){for(const x of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,x.name);if(x.isDirectory())walk(f);else sources.set(x.name,f);}}roots.forEach(walk);
fs.mkdirSync('assets/151-jp',{recursive:true});
const converted=new Map();
function convert(name){if(!sources.has(name))return null;if(converted.has(name))return converted.get(name);const image='assets/151-jp/art-'+String(converted.size+1).padStart(3,'0')+'.webp';cp.execFileSync('convert',[sources.get(name),'-resize','480x680>','-quality','88',image]);converted.set(name,image);return image;}
const rr=new Set([3,6,9,24,38,40,65,76,115,124,145,151]);
const r=new Set([15,26,34,36,45,62,68,85,94,101,105,110,113,122,130,132,134,135,136,139,141,142,144,146,149,150]);
const cards=audit.cards.map(c=>{const n=+c.number;const rarity=c.variant!=='base'?c.variant:n>=208?'ur':n>=200?'sar':n>=184?'sr':n>=166?'ar':rr.has(n)?'rr':r.has(n)?'r':'normal';return {key:c.key,number:c.number,name:c.name.replace(/\s*\[(Master Ball|Reverse|Pokeball)\]/g,'').replace(/\s*#[0-9]+$/,''),variant:c.variant,rarity,image:convert(c.imageFile),illustrationOnly:c.imageSharedWithBase};});
const cover=convert('240(10).jpg');if(!cover)throw Error('Pack image missing');
const quotes=Object.fromEntries(audit.cards.map(c=>[c.key,{usd:c.usd,cny:c.cny,source:c.source}]));
const meta={count:7,boxSize:20,packPrice:audit.meta.packCny,packUsd:audit.meta.packUsd,usdToCny:7.2,cover,missingImages:audit.meta.missing.length,masterballIllustrations:audit.meta.sharedMasterballImages};
fs.writeFileSync('sv151-data.js','const sv151Meta = '+JSON.stringify(meta,null,2)+';\nconst sv151Cards = '+JSON.stringify(cards,null,2)+';\nconst sv151Prices = '+JSON.stringify(quotes,null,2)+';\nObject.assign(cardPriceQuotes, sv151Prices);\n');
console.log('151:',cards.length,'variants;',converted.size,'unique display images;',meta);
