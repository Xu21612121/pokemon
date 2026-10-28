// User-defined 20-pack box: 3 AR, 1 Master Ball, one guaranteed SR+.
function new151Box(number=1,random=Math.random){
 const slots=Array.from({length:20},()=>({special:'pokeball',high:false}));
 const positions=Array.from({length:20},(_,i)=>i);
 for(let i=19;i>0;i--){const j=Math.floor(random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
 for(let i=0;i<3;i++)slots[positions[i]].special='ar';
 slots[positions[3]].special='masterball';
 slots[Math.floor(random()*20)].high=true;
 return {number,next:0,slots};
}
function draw151(box,random=Math.random){
 if(!box||!Number.isInteger(box.next)||box.next<0||box.next>=20||box.slots?.length!==20)throw Error('151盒进度无效');
 const slot=box.slots[box.next];
 const sample=pool=>{if(!pool.length)throw Error('151卡池缺失');return pool[Math.floor(random()*pool.length)];};
 const pick=rarity=>sample(sv151Cards.filter(c=>c.rarity===rarity));
 // RR remains 25% over all packs: 19/20 non-high slots * 5/19 = 1/4.
 const last=slot.high?sample(sv151Cards.filter(c=>['sr','sar','ur'].includes(c.rarity))):pick(random()<5/19?'rr':'r');
 return [pick('normal'),pick('normal'),pick('normal'),pick('normal'),pick('normal'),pick(slot.special),last];
}
function open151(){
 let box=s.sv151Box;
 if(!box||box.next===20)box=new151Box((box?.number||0)+1);
 const cards=draw151(box).map(item=>({...makeCard(item.rarity!=='normal'),cardKey:item.key,base:cardPriceQuotes[item.key].cny,lang:'日版',error:false,slotGroup:item.rarity,variant:item.variant,priceKind:'usd-snapshot'}));
 box.next++;s.sv151Box=box;return cards;
}
function sv151Progress(){const box=s.sv151Box;return box?`第${box.number}盒 · 已拆 ${box.next}/20 包`:'新盒 · 20包一盒';}
