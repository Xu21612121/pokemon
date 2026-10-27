const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({console});
for(const file of ['anniversary-data.js','anniversary-jp-data.js','price-data.js','slot-rules.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
vm.runInContext(`function makeCard(){return {condition:100,rare:true,state:'raw'}}`,context);
vm.runInContext(fs.readFileSync('anniversary.js','utf8'),context);
vm.runInContext(`
let seed=42;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const counts={fur:0,sar:0,ar:0,rr:0,gold:0};
for(let i=0;i<50000;i++){
 const cards=openAnniversary();if(cards.length!==6)throw Error('Wrong count');
 for(let j=0;j<3;j++)if(cards[j].slotGroup!=='normal')throw Error('Wrong common slot');
 if(!['normal','fur'].includes(cards[3].slotGroup))throw Error('Wrong slot 4');
 if(!['normal','sar','ar','rr'].includes(cards[4].slotGroup))throw Error('Wrong slot 5');
 if(!['gold','pikachu'].includes(cards[5].slotGroup))throw Error('Wrong slot 6');
 if(cards.slice(0,5).some(c=>['gold','pikachu'].includes(c.slotGroup)))throw Error('Exclusive final slot violated');
 for(const c of cards){if(!Number.isFinite(c.base)||c.base!==cardPriceQuotes[c.cardKey].cny)throw Error('Quote mismatch');if(c.slotGroup in counts)counts[c.slotGroup]++;}
}
for(const k in counts){const p=anniversaryRates[k];if(Math.abs(counts[k]/50000-p)>.008)throw Error('Unexpected rate '+k);}
console.log('PASS: 50,000 packs, slot exclusivity, static prices, category frequencies',counts);
`,context);
assert.throws(()=>vm.runInContext('drawConfiguredAnniversary([], {})',context));
vm.runInContext(`
if(anniversaryJpCards.length!==176)throw Error('Missing Japanese images');
if(anniversaryJpCards.filter(c=>c.slotGroup==='pikachu').length!==30)throw Error('Pikachu pool');
const seen=new Set(),jpCounts={rgb:0,fur:0,sar:0,ar:0,rr:0,gold:0};
for(let i=0;i<100000;i++){
 const pack=openAnniversary('日版');
 if(pack.length!==6||pack.some(c=>c.lang!=='日版'||!c.cardKey.startsWith('30th-jp-')||c.priceKind!=='simulation'||!Number.isFinite(c.base)))throw Error('Japanese pack mismatch');
 if(pack.slice(0,2).some(c=>c.slotGroup!=='normal')||!['normal','fur','rgb'].includes(pack[2].slotGroup)||!['normal','r','sar','ar','rr'].includes(pack[3].slotGroup)||!['gold','pikachu'].includes(pack[4].slotGroup)||pack[5].slotGroup!=='energy')throw Error('Japanese slots mismatch');
 if(pack.filter(c=>c.slotGroup in jpCounts).length>1)throw Error('Multiple hits');
 for(const c of pack){if(c.slotGroup in jpCounts)jpCounts[c.slotGroup]++;if(!findCardArt(c.cardKey)?.image)throw Error('Missing art');seen.add(c.cardKey);}
}
if(seen.size!==176)throw Error('Incomplete active pool '+seen.size);
if(sameCard({cardKey:'30th-cn-017'},{cardKey:'30th-jp-017'}))throw Error('Languages merged');
for(const k in jpCounts){const p=anniversaryJpRates[k];if(Math.abs(jpCounts[k]/100000-p)>6*Math.sqrt(p*(1-p)/100000))throw Error('Japanese rate '+k);}
console.log('PASS: Japanese 100,000 packs, all 176 cards reachable, fixed energy, one hit maximum, English reference frequencies',jpCounts);
const fixture=['normal','r','fur','rgb','sar','ar','rr','gold','pikachu','energy'].map(slotGroup=>({slotGroup}));
for(const [group,rates] of [['rgb',{rgb:1}],['fur',{fur:1}],['sar',{sar:1}],['ar',{ar:1}],['rr',{rr:1}],['gold',{gold:1}]]){
 const pack=drawConfiguredAnniversary(fixture,{rgb:0,fur:0,sar:0,ar:0,rr:0,gold:0,...rates},()=>0.5,true);
 const index=['rgb','fur'].includes(group)?2:['sar','ar','rr'].includes(group)?3:4;
 if(pack[index].slotGroup!==group||pack[5].slotGroup!=='energy')throw Error('Forced slot '+group);
 if(!['sar','ar','rr'].includes(group)&&pack[3].slotGroup!=='r')throw Error('R fallback');
}
`,context);
for(const file of vm.runInContext('anniversaryJpCards.map(c=>c.image)',context))assert.ok(fs.existsSync(file),file);
