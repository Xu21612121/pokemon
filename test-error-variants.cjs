const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let saved,uid=0;
const ctx=vm.createContext({console,assert,cardId:()=>String(++uid),document:{querySelector:()=>null},gameStorage:{setItem(k,v){saved=v}},setInterval(){}});
for(const file of ['anniversary-data.js','anniversary-jp-data.js','price-data.js','jp-price-data.js','m6-data.js','sv151-data.js','slot-rules.js','anniversary.js','m6.js','sv151.js','swipe.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/setInterval\(\(\)=>[^]*$/,''),ctx);
vm.runInContext(`
render=()=>{};
assert.equal(errorVariantRate,0.005/100);
for(const slotGroup of ['sar','sir','ur','mur','fur','rgb']){
 assert.equal(rollErrorVariant({slotGroup},()=>0).error,true);
 assert.equal(rollErrorVariant({slotGroup},()=>0.000049999).error,true);
 assert.equal(rollErrorVariant({slotGroup},()=>0.00005).error,false);
}
for(const slotGroup of ['normal','r','rr','ar','sr','gold','pikachu','masterball','pokeball','energy',undefined])assert.equal(rollErrorVariant({slotGroup},()=>0).error,false);
const normal={...makeCard(),condition:96,center:20,base:100,state:'raw',slotGroup:'sar'};
assert.equal(value({...normal,error:true}),value(normal)*5);
assert.equal(value({...normal,error:true,grade:9}),value({...normal,grade:9})*5);
assert.equal(gradeScore(normal),gradeScore({...normal,error:true}));
assert.ok(revealCard({...normal,error:true}).includes('⭐⭐⭐⭐⭐ 错版'));
assert.ok(!revealCard(normal).includes('错版'));
assert.ok(collectionTile('test',[normal,{...normal,error:true}]).includes('错版 ×1'));
let seed=19,hits=0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
for(let i=0;i<1000000;i++)if(rollErrorVariant({slotGroup:'sar'},random).error)hits++;
assert.ok(hits>15&&hits<90,'unexpected frequency '+hits);
Math.random=()=>0;
openM6=()=>['normal','rr','sr','sar','mur'].map(slotGroup=>({...normal,id:cardId(),slotGroup,error:false}));
s={balance:1000,cards:[]};opening=[];buyPacks(1,5);
assert.equal(opening.length,25);assert.equal(opening.filter(c=>c.error).length,10);
skipOpening();assert.equal(s.cards.filter(c=>c.error).length,10);
console.log('PASS: error rarity eligibility, exact 0.005% boundaries, 5x value, unchanged grade, five-star badges, 1M rolls ('+hits+' hits), batch persistence');
`,ctx);
assert.equal(JSON.parse(saved).cards.filter(c=>c.error).length,10);
