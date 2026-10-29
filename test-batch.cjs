const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let saved,uid=0;
const ctx=vm.createContext({console,assert,cardId:()=>String(++uid),document:{querySelector:()=>null},gameStorage:{setItem(k,v){saved=v}},setInterval(){}});
for(const file of ['anniversary-data.js','anniversary-jp-data.js','price-data.js','jp-price-data.js','m6-data.js','sv151-data.js','slot-rules.js','anniversary.js','m6.js','sv151.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/setInterval\(\(\)=>[^]*$/,''),ctx);
vm.runInContext(`
render=()=>{};
for(const count of [1,5,10]){
 s={balance:10000,cards:[]};opening=[];buyPacks(1,count);
 assert.equal(opening.length,5*count);assert.equal(s.balance,10000-30*count);
 buyPacks(1,count);assert.equal(opening.length,5*count);
 skipOpening();skipOpening();assert.equal(s.cards.length,5*count);assert.equal(new Set(s.cards.map(c=>c.id)).size,5*count);
 assert.equal(s.openingResult.ids.length,5*count);
}
s={balance:10000,cards:[],sv151Box:new151Box()};s.sv151Box.next=18;opening=[];buyPacks(2,5);
assert.equal(opening.length,35);assert.equal(s.sv151Box.number,2);assert.equal(s.sv151Box.next,3);
skipOpening();delete s.openingResult;const before=JSON.stringify(s.sv151Box);s.balance=0;buyPacks(2,10);
assert.equal(JSON.stringify(s.sv151Box),before);assert.equal(opening.length,0);
assert.ok(hitLabels[openingHitGroup({slotGroup:'masterball'})]);assert.ok(!hitLabels[openingHitGroup({slotGroup:'pokeball'})]);
assert.ok(hitLabels[openingHitGroup({slotGroup:'rr'})]);assert.ok(!hitLabels[openingHitGroup({slotGroup:'r'})]);
s={balance:1000,cards:[]};opening=[];buyPacks(0,5);
`,ctx);
const snapshot=JSON.parse(saved);assert.equal(snapshot.cards.length,30);assert.equal(snapshot.openingResult.ids.length,30);assert.equal(snapshot.balance,875);
console.log('PASS: batch costs, single purchase guard, skip deduplication, persisted results, 151 cross-box progress, insufficient funds and hit categories');
