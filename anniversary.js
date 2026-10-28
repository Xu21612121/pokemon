function findCardArt(key){return anniversaryCards.find(a=>a.key===key)||(typeof anniversaryJpCards!=='undefined'?anniversaryJpCards.find(a=>a.key===key):null)||(typeof m6Cards!=='undefined'?m6Cards.find(a=>a.key===key):null)||(typeof sv151Cards!=='undefined'?sv151Cards.find(a=>a.key===key):null);}
function variantLabel(item){return item?.variant==='masterball'?'大师球闪':item?.variant==='pokeball'?'精灵球闪':'';}
function cardTitle(c){const item=findCardArt(c.cardKey);return c.cardKey?(item?item.name+(variantLabel(item)?'（'+variantLabel(item)+'）':''):c.cardKey):names[c.i];}
function cardPicture(c){const item=findCardArt(c.cardKey);if(!item)return icons[c.i];const variant=variantLabel(item);if(!item.image)return `<div class="missing-art">${cardTitle(c)}<small>${item.number} · 卡图待补充</small></div>`;const art=`<img class="real-card" src="${item.image}" alt="${cardTitle(c)} ${item.number}" draggable="false">`;return variant?`<div class="variant-art">${art}<span class="variant-badge ${item.variant}">${variant}${item.illustrationOnly?' · 示意图':''}</span></div>`:art;}
function sameCard(a,b){return a.cardKey||b.cardKey?a.cardKey===b.cardKey:a.i===b.i&&a.lang===b.lang&&a.rare===b.rare;}
const sarNames=['呆火鳄ex','甲贺忍蛙ex','皮卡丘ex','皮卡丘ex','超梦ex','梦幻ex','仙子伊布ex','耿鬼ex','基拉祈ex','暴飞龙ex'];
for(let i=0;i<10;i++){const number=String(124+i);anniversaryCards.push({key:'30th-cn-'+number,number,name:sarNames[i],image:null,pikachu:false});}
const anniversaryRates={gold:70/732,ar:130/732,sar:37/732,fur:7/732,rr:133/587,rgb:0};
// User-supplied English community statistics, used as Japanese simulation settings.
const anniversaryJpRates={gold:1/9.6,ar:1/5.2,sar:1/19,fur:1/99,rr:1/4,rgb:1/4063};
function openAnniversary(lang='简中'){
 if(lang==='日版')return drawConfiguredAnniversary(anniversaryJpCards,anniversaryJpRates,Math.random,true).map(item=>({...makeCard(true),cardKey:item.key,base:cardPriceQuotes[item.key]?.cny??.5,lang:'日版',error:false,slotGroup:item.slotGroup,priceKind:cardPriceQuotes[item.key]?'usd-snapshot':'simulation'}));
 const rr=new Set([9,15,47,48,55,57,59,76,81,88]);
 const catalog=anniversaryCards.map(c=>{const n=+c.number;return {...c,slotGroup:c.pikachu?'pikachu':n>=136?'gold':n>=134?'fur':n>=124?'sar':n>=104?'ar':rr.has(n)?'rr':'normal'};});
 return drawConfiguredAnniversary(catalog,anniversaryRates).map(item=>({...makeCard(true),cardKey:item.key,base:cardPriceQuotes[item.key].cny,lang:'简中',error:false,slotGroup:item.slotGroup}));
}
