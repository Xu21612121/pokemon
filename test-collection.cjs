const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console,document:{querySelector:()=>null},assert,gameStorage:{setItem(){}},setInterval(){}});
for(const file of ['anniversary-data.js','anniversary-jp-data.js','price-data.js','jp-price-data.js','m6-data.js','sv151-data.js','anniversary.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/setInterval\(\(\)=>[^]*$/,''),ctx);
vm.runInContext(`
render=()=>{};
let pending;showGameDialog=o=>pending=o.onConfirm;
const base={id:'one',cardKey:'m6-jp-001',base:10,condition:96,center:20,error:false,state:'raw',lang:'日版',i:0};
s={balance:100,cards:[{...base},{...base,id:'two'},{...base,id:'lost',state:'lost'}]};
assert.equal(collectionSetOf(base),'m6-jp');
s.collectionSet='m6-jp';const area={};renderCollection(area);assert.ok(area.innerHTML.includes('1 / 113'));
assert.ok(card(s.cards[2]).includes('永久损毁'));
assert.ok(!card(s.cards[2]).includes('市场挂单'));
assert.equal(gradeScore(base),9);
assert.ok(gradeExplanation({...base,grade:9}).includes('磨损扣'));
assert.ok(gradeExplanation({...base,grade:9}).includes('旧存档'));
for(const state of ['raw','graded']){
 const c=s.cards[0];c.state=state;c.grade=state==='graded'?9:undefined;
 const before=value(c);showListingDialog(c.id);pending(3);
 assert.equal(c.state,'listed');assert.equal(value(c),before);
 cancelListing(c.id);pending();assert.equal(c.state,state);assert.equal(c.ask,undefined);
 assert.equal(s.balance,100);
}
const c=s.cards[0];c.state='listed';c.grade=9;c.ask=50;c.due=day()+1;delete c.listedFrom;
cancelListing(c.id);pending();assert.equal(c.state,'graded');
c.state='listed';c.ask=50;c.due=day();cancelListing(c.id);pending();assert.equal(c.state,'sold');assert.equal(s.balance,150);
c.state='grading';c.due=day();Math.random=()=>.5;settle();assert.equal(c.grade,9);assert.equal(c.gradeReport.condition,96);
c.state='grading';Math.random=()=>0;settle();assert.equal(c.state,'lost');assert.equal(c.lostDay,day());
assert.equal(packs[1].price,30);assert.equal(packs[2].price,130);assert.ok(packs.every(p=>Number.isInteger(p.price)));
`,ctx);
console.log('PASS: collection progress, lost history, grading reasons, listing value, cancellation and integer prices');
