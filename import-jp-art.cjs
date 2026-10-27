// Import only named image assets; never execute scripts from the saved webpage.
const fs=require('node:fs'),path=require('node:path');
const source=process.argv[2];
if(!source)throw Error('Usage: node import-jp-art.cjs <extracted assets directory>');
const cn=JSON.parse(fs.readFileSync('anniversary-data.js','utf8').replace(/^const anniversaryCards = /,'').replace(/;\s*$/,''));
const rr=new Set([9,15,47,48,55,57,59,76,81,88]);
const cards=[];
fs.mkdirSync('assets/30th-jp',{recursive:true});
for(const file of fs.readdirSync(source).sort()){
 const m=file.match(/^pokemon-30th-celebration-m6a-(\d{3}|rgb-[rgb]|energy-[a-z]+)-(.+)\.webp$/);
 if(!m)continue;
 const number=m[1],n=Number(number),slug=m[2].replace(/-\d+x\d+$/,'');
 const image=`assets/30th-jp/${number}.webp`;
 fs.copyFileSync(path.join(source,file),image);
 const slotGroup=number.startsWith('rgb')?'rgb':number.startsWith('energy')?'energy':n>=136?'gold':n>=134?'fur':n>=124?'sar':n>=104?'ar':n>=17&&n<=46?'pikachu':rr.has(n)?'rr':'normal';
 const energyNames={darkness:'恶',fighting:'斗',fire:'火',grass:'草',lightning:'雷',metal:'钢',psychic:'超',water:'水'};
 const name=slotGroup==='energy'?'基本'+energyNames[number.slice(7)]+'能量':cn.find(c=>c.number===number)?.name || (slotGroup==='rgb'?'梦幻 RGB '+number.slice(-1).toUpperCase():slug.replaceAll('-',' '));
 cards.push({key:'30th-jp-'+number,number,name,image,pikachu:slotGroup==='pikachu',slotGroup});
}
if(cards.filter(c=>/^\d{3}$/.test(c.number)).length!==165)throw Error('Expected 165 numbered cards');
fs.copyFileSync(path.join(source,'pokemon-30th-celebration-m6a-hero.webp'),'assets/30th-jp/hero.webp');
fs.writeFileSync('anniversary-jp-data.js','const anniversaryJpCards = '+JSON.stringify(cards,null,2)+';\n');
console.log('Imported',cards.length,'Japanese card images');
