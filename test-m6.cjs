const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({console,cardPriceQuotes:{}});
vm.runInContext(fs.readFileSync('m6-data.js','utf8'),context);
vm.runInContext('function makeCard(rare){return {rare,condition:100,state:"raw"}}',context);
vm.runInContext(fs.readFileSync('m6.js','utf8'),context);
vm.runInContext(`
if(m6Cards.length!==113||new Set(m6Cards.map(c=>c.key)).size!==113)throw Error('M6 count/keys');
if(m6Meta.packCny!==30.89)throw Error('Pack quote');
if(cardPriceQuotes['m6-jp-113'].cny!==3888)throw Error('MUR quote');
for(const c of m6Cards){const q=cardPriceQuotes[c.key];if(q.cny!==Math.round(q.usd*7.2*100)/100)throw Error('FX '+c.key);}
let seed=17;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const counts={r:0,rr:0,ar:0,sr:0,sar:0,mur:0},seen=new Set();
for(let i=0;i<200000;i++){
 const pack=openM6();
 if(pack.length!==5||pack.slice(0,4).some(c=>c.slotGroup!=='normal')||!(pack[4].slotGroup in counts))throw Error('M6 slots');
 counts[pack[4].slotGroup]++;
 for(const c of pack){if(!c.cardKey.startsWith('m6-jp-')||c.base!==cardPriceQuotes[c.cardKey].cny||c.error||c.rare!==(c.slotGroup!=='normal'))throw Error('M6 card');seen.add(c.cardKey);}
}
if(seen.size!==113)throw Error('Unreachable cards');
for(const k in m6Rates){const p=m6Rates[k];if(Math.abs(counts[k]/200000-p)>6*Math.sqrt(p*(1-p)/200000))throw Error('Rate '+k);}
if(Math.abs(m6Rates.sr+m6Rates.sar+m6Rates.mur-2/30)>1e-12)throw Error('Conditional SR+ rates');
console.log('PASS 200,000 M6 packs, fixed slots, 113 reachable cards, exact prices and frequencies',counts);
`,context);
for(const image of vm.runInContext('m6Cards.map(c=>c.image)',context))assert.ok(fs.existsSync(image),image);
assert.ok(fs.existsSync('assets/m6-jp/pack.jpg'));
assert.throws(()=>vm.runInContext('drawM6([],m6Rates)',context));
assert.throws(()=>vm.runInContext('drawM6(m6Cards,{rr:1,ar:1,sr:0,sar:0,mur:0})',context));
