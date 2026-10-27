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
const seen=new Set();
for(let i=0;i<20000;i++){
 const pack=openAnniversary('日版');
 if(pack.length!==6||pack.some(c=>c.lang!=='日版'||!c.cardKey.startsWith('30th-jp-')||c.priceKind!=='simulation'||!Number.isFinite(c.base)))throw Error('Japanese pack mismatch');
 if(pack.slice(0,3).some(c=>c.slotGroup!=='normal')||!['normal','fur'].includes(pack[3].slotGroup)||!['normal','sar','ar','rr'].includes(pack[4].slotGroup)||!['gold','pikachu'].includes(pack[5].slotGroup))throw Error('Japanese slots mismatch');
 for(const c of pack){if(!findCardArt(c.cardKey)?.image)throw Error('Missing art');seen.add(c.cardKey);}
}
if(seen.size!==165)throw Error('Incomplete active pool '+seen.size);
if(sameCard({cardKey:'30th-cn-017'},{cardKey:'30th-jp-017'}))throw Error('Languages merged');
console.log('PASS: Japanese 20,000 packs, all 165 cards reachable, isolated identities and simulation prices');
`,context);
for(const file of vm.runInContext('anniversaryJpCards.map(c=>c.image)',context))assert.ok(fs.existsSync(file),file);
