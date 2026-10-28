const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console,cardPriceQuotes:{}});
vm.runInContext(fs.readFileSync('sv151-data.js','utf8'),ctx);
vm.runInContext('let s={};let uid=0;function makeCard(rare){return {id:String(++uid),rare,state:"raw"}}',ctx);
vm.runInContext(fs.readFileSync('sv151.js','utf8'),ctx);
vm.runInContext(`
if(sv151Cards.length!==516||new Set(sv151Cards.map(c=>c.key)).size!==516)throw Error('Variants');
for(const c of sv151Cards){const q=cardPriceQuotes[c.key];if(q.cny!==Math.round(q.usd*7.2*100)/100)throw Error('FX');}
let seed=41;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let rr=0;const seen=new Set();
for(let box=1;box<=5000;box++){
 const counts={ar:0,masterball:0,high:0};
 for(let p=0;p<20;p++){
   const cards=open151();if(cards.length!==7)throw Error('Pack count');
   if(cards.slice(0,5).some(c=>c.slotGroup!=='normal'))throw Error('First five');
   if(!['ar','masterball','pokeball'].includes(cards[5].slotGroup))throw Error('Slot 6');
   if(!['r','rr','sr','sar','ur'].includes(cards[6].slotGroup))throw Error('Slot 7');
   if(cards[5].slotGroup==='ar')counts.ar++;
   if(cards[5].slotGroup==='masterball')counts.masterball++;
   if(['sr','sar','ur'].includes(cards[6].slotGroup))counts.high++;
   if(cards[6].slotGroup==='rr')rr++;
   for(const c of cards){seen.add(c.cardKey);if(c.base!==cardPriceQuotes[c.cardKey].cny)throw Error('Quote');}
   if(s.sv151Box.number!==box||s.sv151Box.next!==p+1)throw Error('Progress');
   // A reload after every pack must preserve, rather than reset, the remaining box.
   s=JSON.parse(JSON.stringify(s));
 }
 if(counts.ar!==3||counts.masterball!==1||counts.high!==1)throw Error('Box guarantee '+JSON.stringify(counts));
}
if(seen.size!==516)throw Error('Unreachable variants '+seen.size);
if(Math.abs(rr/100000-.25)>.01)throw Error('RR marginal rate');
if(cardPriceQuotes['151-jp-094-masterball'].cny===cardPriceQuotes['151-jp-094-base'].cny)throw Error('Variant prices merged');
console.log('PASS 5,000 boxes / 100,000 packs: exact guarantees, seven slots, reload continuity, all 516 variants reachable, RR',rr/100000);
`,ctx);
for(const image of vm.runInContext('sv151Cards.filter(c=>c.image).map(c=>c.image)',ctx))assert.ok(fs.existsSync(image));
assert.throws(()=>vm.runInContext('draw151({next:20,slots:[]})',ctx));
