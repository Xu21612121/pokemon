// User-approved approximation: 30 packs/box, mean 2 SR+ hits; no box guarantee.
// RR and AR inherit the English-reference settings of the anniversary pack.
const m6Rates={rr:1/4,ar:1/5.2,sr:2/30*.93,sar:2/30*.06,mur:2/30*.01};
function drawM6(catalog=m6Cards,rates=m6Rates,random=Math.random){
 const categories=['mur','sar','sr','ar','rr'];
 if(categories.some(k=>!Number.isFinite(rates[k])||rates[k]<0||rates[k]>1)||categories.reduce((n,k)=>n+rates[k],0)>1)throw Error('M6概率配置无效');
 const pick=rarity=>{const pool=catalog.filter(c=>c.rarity===rarity);if(!pool.length)throw Error('M6卡池缺失：'+rarity);return pool[Math.floor(random()*pool.length)];};
 const roll=random();let cumulative=0,last='r';
 for(const rarity of categories){cumulative+=rates[rarity];if(roll<cumulative){last=rarity;break;}}
 return [pick('normal'),pick('normal'),pick('normal'),pick('normal'),pick(last)];
}
function openM6(){
 return drawM6().map(item=>({...makeCard(item.rarity!=='normal'),cardKey:item.key,base:cardPriceQuotes[item.key].cny,lang:'日版',error:false,slotGroup:item.rarity,priceKind:'usd-snapshot'}));
}
