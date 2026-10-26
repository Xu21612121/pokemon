function cardTitle(c){return c.cardKey ? anniversaryCards.find(a=>a.key===c.cardKey)?.name || c.cardKey : names[c.i];}
function cardPicture(c){const item=anniversaryCards.find(a=>a.key===c.cardKey);return item?`<img class="real-card" src="${item.image}" alt="${item.name} ${item.number}" draggable="false">`:icons[c.i];}
function sameCard(a,b){return a.cardKey||b.cardKey?a.cardKey===b.cardKey:a.i===b.i&&a.lang===b.lang&&a.rare===b.rare;}
function openAnniversary(){
 const pikachu=anniversaryCards.filter(c=>c.pikachu),others=anniversaryCards.filter(c=>!c.pikachu);
 // Prototype only: uniform sampling within the available images, NOT real pull rates.
 const result=Array.from({length:6},(_,i)=>{
  const pool=i===0?pikachu:others,item=pool[Math.floor(Math.random()*pool.length)];
  return {...makeCard(true),cardKey:item.key,lang:'简中',error:false};
 });
 // Position is simulated; the official source only confirms one guaranteed Pikachu.
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
