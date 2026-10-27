function findCardArt(key){return anniversaryCards.find(a=>a.key===key)||(typeof anniversaryJpCards!=='undefined'?anniversaryJpCards.find(a=>a.key===key):null);}
function cardTitle(c){return c.cardKey ? findCardArt(c.cardKey)?.name || c.cardKey : names[c.i];}
function cardPicture(c){const item=findCardArt(c.cardKey);return item?(item.image?`<img class="real-card" src="${item.image}" alt="${item.name} ${item.number}" draggable="false">`:`<div class="missing-art">SAR<br>${item.name}<br><small>${item.number}/103 · 卡图待补充</small></div>`):icons[c.i];}
function sameCard(a,b){return a.cardKey||b.cardKey?a.cardKey===b.cardKey:a.i===b.i&&a.lang===b.lang&&a.rare===b.rare;}
const sarNames=['呆火鳄ex','甲贺忍蛙ex','皮卡丘ex','皮卡丘ex','超梦ex','梦幻ex','仙子伊布ex','耿鬼ex','基拉祈ex','暴飞龙ex'];
for(let i=0;i<10;i++){const number=String(124+i);anniversaryCards.push({key:'30th-cn-'+number,number,name:sarNames[i],image:null,pikachu:false});}
const anniversaryRates={gold:70/732,ar:130/732,sar:37/732,fur:7/732,rr:133/587,rgb:0};
function openAnniversary(lang='简中'){
 if(lang==='日版')return drawConfiguredAnniversary(anniversaryJpCards,anniversaryRates).map(item=>({...makeCard(true),cardKey:item.key,base:({normal:.5,pikachu:.5,rr:5,ar:10,sar:50,fur:100,gold:30,rgb:1000})[item.slotGroup],lang:'日版',error:false,slotGroup:item.slotGroup,priceKind:'simulation'}));
 const rr=new Set([9,15,47,48,55,57,59,76,81,88]);
 const catalog=anniversaryCards.map(c=>{const n=+c.number;return {...c,slotGroup:c.pikachu?'pikachu':n>=136?'gold':n>=134?'fur':n>=124?'sar':n>=104?'ar':rr.has(n)?'rr':'normal'};});
 return drawConfiguredAnniversary(catalog,anniversaryRates).map(item=>({...makeCard(true),cardKey:item.key,base:cardPriceQuotes[item.key].cny,lang:'简中',error:false,slotGroup:item.slotGroup}));
}
