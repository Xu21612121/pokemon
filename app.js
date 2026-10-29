const KEY='pocket-museum-v1';
const packs=[{name:'30周年庆典 M6a',lang:'日版',price:25,count:6,color:'blue',icon:'✨',anniversary:true},{name:'Storm Emeralda M6',lang:'日版',price:30,count:5,set:'m6',icon:'🐉'},{name:'宝可梦卡牌151 sv2a',lang:'日版',price:130,count:7,set:'sv151',icon:'🌸'},{name:'30周年庆典',lang:'简中',price:25,count:6,color:'blue',icon:'✨'},{name:'绯红与紫罗兰',lang:'美版',price:45,count:10,color:'pink',icon:'🔮'},{name:'旧时光收藏包',old:true,lang:'日版',price:180,count:5,color:'',icon:'⌛'}];
const names=['皮卡丘','妙蛙种子','杰尼龟','小火龙','伊布','耿鬼','梦幻','喷火龙'];const icons=['⚡','🌱','💧','🔥','🦊','👻','🌸','🐉'];
let s=null,tab='卡包商店',packLanguage='日版',notice='',opening=[],collectionFocus=null,collectionReturn=null;const app=document.querySelector('#app');
const day=()=>Math.floor((Date.now()+8*3600000)/86400000);const money=n=>'¥ '+n.toFixed(2);const save=()=>gameStorage.setItem(KEY,JSON.stringify({...s,cards:[...new Map([...s.cards,...opening].map(c=>[c.id,c])).values()]}));
function refresh(){if(s.day>=day())return;const n=day()-s.day;s.balance+=1000*n;s.day=day();s.old=Math.random()<.2;s.shop=Array.from({length:3},makeCard);for(const c of s.cards)if(c.state==='raw')c.condition=Math.max(0,c.condition-n*.3);settle();save()}
function settle(){for(const c of s.cards){if(c.state==='grading'&&c.due<=day()){if(Math.random()<.25){c.state='lost';c.lostDay=c.due;}else {c.state='graded';c.gradeReport={condition:c.condition,center:c.center,error:!!c.error};c.grade=gradeScore(c.gradeReport);}}if(c.state==='listed'&&c.due<=day()){s.balance+=c.ask;c.state='sold'}}}
function makeCard(rare=false){const i=Math.floor(Math.random()*names.length);return {id:cardId(),i,rare,base:rare?60+Math.floor(Math.random()*450):2+Math.floor(Math.random()*14),condition:95+Math.random()*5,center:Math.floor(Math.random()*81),error:rare&&Math.random()<.005,state:'raw',lang:'日版'}}
const value=c=>(cardPriceQuotes[c.cardKey]?.cny ?? c.base)*(c.condition/100)*(c.error?3:1)*(c.grade?([0,.4,.5,.6,.7,.8,1,1.2,1.5,2,3][c.grade]):1);
function start(fresh,approved=false){if(fresh){if(gameStorage.getItem(KEY)&&!approved){showGameDialog({title:'开启新存档',message:'新存档将覆盖当前存档，已有资金和收藏将被替换。建议先导出备份，确定继续吗？',confirmLabel:'确认覆盖',onConfirm:()=>start(true,true)});return;}s={balance:1000,day:day(),cards:[],shop:Array.from({length:3},()=>makeCard()),old:Math.random()<.2};save()}else{try{s=JSON.parse(gameStorage.getItem(KEY));if(!s||!Array.isArray(s.cards))throw Error();refresh();settle();save()}catch{notice='存档无法读取，请新建存档。';s=null}}render()}
function card(c,shop=false,compact=false){return `<article class="panel">${compact?`<p class="muted">收藏序号 #${s.cards.indexOf(c)+1} · ${{raw:'未评级',graded:'已评级',grading:'送评中',listed:'已上架'}[c.state]||c.state}</p>`:`<div class="cardart ${c.cardKey?'has-art':''} ${c.rare?'rare':''}">${cardPicture(c)}</div>`}<span class="tag">${c.lang} · ${c.rare?'闪卡 ✦':'普通卡'} ${c.error?'⭐ 错版':''}</span><div class="row"><h3>${cardTitle(c)}</h3><span>× ${shop||compact||c.state==='lost'?1:s.cards.filter(x=>sameCard(x,c)&&['raw','graded'].includes(x.state)).length}</span></div><div class="price">${money(value(c))}${(c.cardKey?.startsWith('30th-jp-')||c.cardKey?.startsWith('m6-jp-')||c.cardKey?.startsWith('151-jp-'))?`<small class="muted"> · ${cardPriceQuotes[c.cardKey]?'网页报价折算估值':'缺报价，游戏占位价'}</small>`:''}</div><p class="muted">品相 ${c.condition.toFixed(1)}% · 左右居中 ${50-c.center/2}:${50+c.center/2}${c.grade?' · 评级 '+c.grade:''}</p>${c.grade?gradeExplanation(c):''}${shop?`<button data-buy="${c.id}">买入收藏</button>`:c.state==='raw'||c.state==='graded'?`<div class="actions"><button data-sell="${c.id}">八折回收</button><button data-list="${c.id}">市场挂单</button>${c.state==='raw'?`<button data-grade="${c.id}">送评 ¥20</button>`:''}</div>`:c.state==='lost'?'<p class="muted">评级过程中永久损毁 · 仅保留历史记录，不可交易</p>':`<p class="muted">${c.state==='grading'?'评级中': '市场挂单'} · 剩余 ${Math.max(0,c.due-day())} 天</p>${c.state==='listed'?`<p>挂单价：${money(c.ask)}</p><button data-cancel-list="${c.id}">撤销上架</button>`:''}`}</article>`}
// Inventory is append-only in acquisition order; sort a copy to preserve old saves.
function sortedCollection(cards,mode='time'){
 const ordered=[...cards].reverse();
 return mode==='price'?ordered.sort((a,b)=>value(b)-value(a)):ordered;
}
function collectionFilter(){
 const mode=s.collectionSort==='price'?'price':'time';
 return `<div class="collection-filter"><button id="collection-filter-toggle" aria-expanded="false" aria-controls="collection-filter-options">筛选</button><div id="collection-filter-options" class="collection-filter-options" hidden>${[['time','按时间顺序排列','新获得的在前'],['price','按价格顺序排列','价格从高到低']].map(([key,label,hint])=>`<button data-collection-sort="${key}" aria-pressed="${mode===key}">${label}<small>${hint}</small></button>`).join('')}</div></div>`;
}
function showGameDialog({title,message,confirmLabel='确认',askDays=false,onConfirm}){
 if(document.querySelector('#game-dialog'))return;
 const trigger=document.activeElement,dialog=document.createElement('dialog');
 dialog.id='game-dialog';dialog.className='game-dialog';
 dialog.setAttribute('aria-labelledby','game-dialog-title');
 dialog.setAttribute('aria-describedby','game-dialog-description');
 dialog.innerHTML='<form novalidate><h2 id="game-dialog-title"></h2><p id="game-dialog-description"></p><div class="dialog-input" hidden><label for="listing-days">挂单天数（1–7 天）</label><input id="listing-days" type="text" inputmode="numeric" value="3" autocomplete="off" aria-describedby="dialog-input-error"><p id="dialog-input-error" class="dialog-error" role="alert"></p></div><div class="dialog-actions"><button type="button" data-dialog-cancel>取消</button><button type="submit" class="gold" data-dialog-confirm></button></div></form>';
 dialog.querySelector('h2').textContent=title;
 dialog.querySelector('#game-dialog-description').textContent=message;
 dialog.querySelector('[data-dialog-confirm]').textContent=confirmLabel;
 dialog.querySelector('.dialog-input').hidden=!askDays;
 const input=dialog.querySelector('input');let result=null,submitted=false;
 dialog.querySelector('form').onsubmit=e=>{
   e.preventDefault();if(submitted)return;
   const text=input.value.trim(),days=Number(text);
   if(askDays&&(!/^[0-9]+$/.test(text)||!Number.isInteger(days)||days<1||days>7)){
     dialog.querySelector('.dialog-error').textContent='请输入 1–7 之间的整数天数。';
     input.setAttribute('aria-invalid','true');input.focus();return;
   }
   result=askDays?days:true;submitted=true;dialog.close('confirm');
 };
 input.oninput=()=>{input.removeAttribute('aria-invalid');dialog.querySelector('.dialog-error').textContent='';};
 dialog.querySelector('[data-dialog-cancel]').onclick=()=>dialog.close('cancel');
 dialog.addEventListener('close',()=>{
   const confirmed=dialog.returnValue==='confirm';
   dialog.remove();document.body.classList.remove('has-dialog');
   if(confirmed)onConfirm?.(result);
   if(trigger?.isConnected)trigger.focus({preventScroll:true});
   else (document.querySelector('nav button.active')||document.querySelector('#new'))?.focus({preventScroll:true});
 },{once:true});
 document.body.append(dialog);document.body.classList.add('has-dialog');dialog.showModal();
 if(askDays){input.focus();input.select();}else dialog.querySelector('[data-dialog-cancel]').focus();
}
function showGradingDialog(cardId){
 const owner=s,target=owner?.cards.find(c=>c.id===cardId);
 if(!target||target.state!=='raw')return;
 if(owner.balance<20){notice='资金不足，送评需要 ¥20。';render();return;}
 showGameDialog({title:'送评风险提示',message:'支付 ¥20 送评，1 天后结算。\n有 25% 概率永久损毁，75% 概率返回评级仓库。\n确认后将扣除送评费用，是否继续？',confirmLabel:'确认送评 ¥20',onConfirm:()=>{
   if(s!==owner)return;
   const card=s.cards.find(c=>c.id===cardId);
   if(card?.state==='raw'&&s.balance>=20){s.balance-=20;card.state='grading';card.due=day()+1;save();render();}
 }});
}
function showListingDialog(cardId){
 const owner=s,target=owner?.cards.find(c=>c.id===cardId);
 if(!target||!['raw','graded'].includes(target.state))return;
 const ask=value(target);
 showGameDialog({title:'市场挂单',message:'当前锁定价格：'+money(ask)+'\n选择挂单天数，确认后将在到期日按锁定价格模拟成交。',confirmLabel:'确认挂单',askDays:true,onConfirm:days=>{
   if(s!==owner)return;
   const card=s.cards.find(c=>c.id===cardId);
   if(card&&['raw','graded'].includes(card.state)){card.ask=ask;card.listedFrom=card.state;card.state='listed';card.due=day()+days;save();render();}
 }});
}

function gradeScore(report){return Math.max(1,Math.min(10,Math.round(report.condition/10-report.center/20)))}
function gradeExplanation(c){
 const r=c.gradeReport||c,wear=(100-r.condition)/10,centering=r.center/20;
 return `<details class="grade-reasons"><summary>评级 ${c.grade}/10 · 查看评分理由</summary><p>游戏模拟评分：10 − 磨损扣分 − 居中扣分，四舍五入后限制为1–10分。</p><p>品相 ${r.condition.toFixed(1)}%：磨损扣 ${wear.toFixed(2)} 分。<br>左右边比例 ${50-r.center/2}:${50+r.center/2}：偏离50:50，扣 ${centering.toFixed(2)} 分。<br>错版：${r.error?'是（⭐）':'否'}，本游戏不额外扣分；错版仅影响估值。<br>最终评级：${c.grade} 分。${c.gradeReport?'':'旧存档无送评快照，以上按现存品相解释，保留原分数。'}</p></details>`;
}
function cancelListing(id){
 const owner=s,target=s.cards.find(c=>c.id===id);
 if(target?.state!=='listed')return;
 showGameDialog({title:'撤销市场上架',message:'撤单不收取费用，卡牌将恢复上架前状态；已成交的订单无法撤销。',confirmLabel:'确认撤单',onConfirm:()=>{
  if(s!==owner)return;
  settle();
  if(target.state!=='listed'){notice='订单已到期成交，无法撤销。';save();render();return}
  target.state=target.listedFrom|| (target.grade?'graded':'raw');
  delete target.ask;delete target.due;delete target.listedFrom;
  notice='已撤销上架，卡牌已返回收藏。';save();render();
 }});
}
function collectionCatalogs(){return [
 {id:'30th-jp',name:'日版30周年',cards:anniversaryJpCards},
 {id:'m6-jp',name:'日版M6',cards:m6Cards},
 {id:'151-jp',name:'日版151',cards:sv151Cards},
 {id:'30th-cn',name:'简中30周年',cards:anniversaryCards},
 {id:'other',name:'其他 / 旧版模拟卡',cards:[]}
]}
function collectionSetOf(c){return collectionCatalogs().find(group=>group.cards.some(item=>item.key===c.cardKey))?.id||'other'}
function openCollectionDetail(button){
 const tiles=[...document.querySelectorAll('[data-card-detail]')];
 collectionReturn={key:button.dataset.cardDetail,y:window.scrollY,offset:button.getBoundingClientRect().top,index:tiles.indexOf(button)};
 collectionFocus=button.dataset.cardDetail;render();
 document.querySelector('#back-collection')?.focus({preventScroll:true});
 document.querySelector('#content')?.scrollIntoView({block:'start',behavior:'instant'});
}
function returnToCollection(){
 const position=collectionReturn;
 collectionFocus=null;tab='我的图鉴';render();
 const tiles=[...document.querySelectorAll('[data-card-detail]')];
 const target=position&&(tiles.find(b=>b.dataset.cardDetail===position.key)||tiles[Math.min(position.index,tiles.length-1)]);
 target?.focus({preventScroll:true});
 if(position)window.scrollTo({top:target?window.scrollY+target.getBoundingClientRect().top-position.offset:position.y,behavior:'instant'});
}
function collectionIdentity(c){return c.cardKey||'legacy-'+c.lang+'-'+c.i+'-'+!!c.rare}
function groupedCollection(cards){
 const groups=new Map();
 for(const c of cards){const key=collectionIdentity(c);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)}
 return [...groups.entries()];
}
function collectionTile(key,copies){
 const c=copies[0];
 return `<button type="button" class="panel collection-tile" data-card-detail="${key}" aria-label="查看${cardTitle(c)}，持有${copies.length}张"><span class="cardart ${c.cardKey?'has-art':''}">${cardPicture(c)}</span><strong>${cardTitle(c)}</strong><span class="tag">${c.lang} · 持有 ${copies.length} 张</span><span class="muted">点击查看各张品相及操作</span></button>`;
}
function renderCollection(area){
 const catalogs=collectionCatalogs();
 const selected=catalogs.find(g=>g.id===s.collectionSet)||catalogs[0];
 const held=s.cards.filter(c=>['raw','graded','grading','listed'].includes(c.state));
 const cards=sortedCollection(held.filter(c=>collectionSetOf(c)===selected.id),s.collectionSort);
 const unique=new Set(cards.map(collectionIdentity));
 if(collectionFocus){
  const copies=cards.filter(c=>collectionIdentity(c)===collectionFocus);
  area.innerHTML=`<button id="back-collection">← 返回图鉴</button><h2>${copies.length?cardTitle(copies[0]):'该卡已不在当前收藏中'}</h2><p>当前持有 ${copies.length} 张。同一卡面下，每张卡的品相、居中、错版和评级均独立；按钮只操作所在行的那一张。</p>${notice?`<p role="status">${notice}</p>`:''}<div class="collection-detail-layout">${copies.length?`<div class="collection-detail-art"><div class="cardart ${copies[0].cardKey?'has-art':''}">${cardPicture(copies[0])}</div></div>`:''}<div class="copy-list">${copies.map(c=>card(c,false,true)).join('')||'<p>该卡已售出或损毁，可以返回图鉴查看其他卡牌。</p>'}</div></div>`;
  return;
 }
 const total=selected.cards.length;
 area.innerHTML=`<div class="row"><h2>我的图鉴</h2>${collectionFilter()}</div><div class="actions collection-sets">${catalogs.map(g=>`<button data-collection-set="${g.id}" class="${g.id===selected.id?'gold':''}">${g.name}</button>`).join('')}</div><h3>${selected.name} · ${cards.length} 张</h3><p>收集进度：${unique.size}${total?' / '+total+' 种（'+(unique.size/total*100).toFixed(1)+'%）':' 种（模拟卡无固定总数）'}</p>${total?`<progress aria-label="收集进度" value="${unique.size}" max="${total}"></progress>`:''}<p class="muted">按当前持有的不同版本计数，含评级、送评与挂单；重复卡不重复计数，已售出和损毁不计入。151普通、球闪、大师球分别统计。</p><div class="grid">${groupedCollection(cards).map(([key,copies])=>collectionTile(key,copies)).join('')||'<p>还没有这个卡包的收藏。</p>'}</div>`;
}


const hitLabels={rr:'RR',ar:'AR',sr:'SR',sar:'SAR',ur:'UR',mur:'MUR',fur:'FUR',rgb:'RGB',gold:'金边复刻',masterball:'大师球闪'};
function openingHitGroup(c){return c.slotGroup||findCardArt(c.cardKey)?.rarity}
function buyPacks(index,count=1){
 if(!s||opening.length||s.openingResult||![1,5,10].includes(count))return;
 const p=packs[index];if(!p)return;
 const cost=p.price*count;
 if(s.balance<cost){notice='资金不足，'+count+'包需要 '+money(cost)+'。';render();return}
 const previousBox=s.sv151Box?JSON.parse(JSON.stringify(s.sv151Box)):null;
 const drawn=[];
 try{
  for(let i=0;i<count;i++)drawn.push(...(p.set==='sv151'?open151():p.set==='m6'?openM6():p.anniversary?openAnniversary('日版'):p.lang==='简中'?openAnniversary():Array.from({length:p.count},(_,j)=>({...makeCard(j===p.count-1&&Math.random()<.2),lang:p.lang}))));
 }catch(error){if(previousBox)s.sv151Box=previousBox;else delete s.sv151Box;notice='本次拆包未完成，未扣费，请重试。';render();return}
 s.balance-=cost;opening=drawn;
 s.openingResult={name:p.name,count,cost,ids:drawn.map(c=>c.id)};
 save();notice='全部卡牌已自动保存。';render();
}
function skipOpening(){
 if(!s||!opening.length)return;
 const owned=new Set(s.cards.map(c=>c.id));
 for(const c of opening)if(!owned.has(c.id)){s.cards.push(c);owned.add(c.id)}
 opening=[];save();render();
}
function renderOpeningResult(){
 const result=s.openingResult,ids=new Set(result.ids);
 const cards=s.cards.filter(c=>ids.has(c.id)),groups=new Map();
 for(const c of cards){
  const rarity=openingHitGroup(c);if(!hitLabels[rarity])continue;
  const key=c.cardKey||c.lang+'-'+c.i+'-'+rarity;
  if(!groups.has(key))groups.set(key,{card:c,rarity,count:0,total:0});
  const group=groups.get(key);group.count++;group.total+=value(c);
 }
 app.innerHTML=`<main class="opening-results"><h1>本次拆卡结果</h1><p>${result.name} · ${result.count} 包 · 花费 ${money(result.cost)}</p><p>已收下 ${cards.length} 张卡，以下仅列出 RR 及以上，以及金边复刻、大师球闪。</p>${groups.size?`<ul class="hit-list">${[...groups.values()].map(g=>`<li><strong>${cardTitle(g.card)}</strong><span>${hitLabels[g.rarity]} · ×${g.count} · 合计估值 ${money(g.total)}</span></li>`).join('')}</ul>`:'<p>这次没有获得上述稀有卡，下次再试试手气！</p>'}<p class="muted">普通卡也已全部进入图鉴。估值按当前品相计算。</p><button id="close-opening-result" class="gold">返回卡包商店</button></main>`;
 document.querySelector('#close-opening-result').onclick=()=>{delete s.openingResult;tab='卡包商店';save();render()};
}

function render(){
document.body.classList.toggle('is-opening',!!s&&opening.length>0);
if(s&&opening.length){
 app.innerHTML=`<main class="opening-screen" aria-label="滑动卡片逐张收藏，方向键也可操作"><div class="swipe-stack">${opening[1]?`<article class="swipe-under" aria-hidden="true">${revealCard(opening[1])}</article>`:''}<article class="swipe-top" tabindex="0" role="group" aria-label="${cardTitle(opening[0])}，剩余${opening.length}张，拖动或按方向键收藏">${revealCard(opening[0])}</article></div><div class="opening-controls"><span>剩余 ${opening.length} 张</span><button id="skip-opening">跳过翻卡，查看结果</button></div></main>`;
 document.querySelector("#skip-opening").onclick=skipOpening;
 mountSwipe();
 document.querySelector('.swipe-top').focus({preventScroll:true});
 return;
}
if(s?.openingResult){renderOpeningResult();return}
if(!s){app.innerHTML=`<main class="start"><div class="eyebrow">POCKET MUSEUM / 私人收藏室 · v0.5.3 151三卡包版</div><h1>每一包，<br>都是新的期待。</h1><p>收集喜欢的伙伴，把闪耀的瞬间留在藏馆。<br>你的拆卡日记，从这里开始。</p><div class="pack"><b>⚡</b><strong>口袋藏馆</strong></div><button class="gold" id="new">开启新存档</button> <button id="continue" ${gameStorage.getItem(KEY)?'':'disabled'}>继续收藏</button><p>${notice}</p></main>`;document.querySelector('#new').onclick=()=>start(true);document.querySelector('#continue').onclick=()=>start(false);return}
const owned=s.cards.filter(c=>['raw','graded'].includes(c.state));app.innerHTML=`<header><div><strong>◈ 口袋藏馆</strong><br><small>POCKET MUSEUM · v0.5.3 151三卡包版</small></div><div><span class="muted">收藏资金 </span><b class="price">${money(s.balance)}</b> <button id="exit">存档退出</button></div></header><main><section class="hero"><div class="eyebrow">YOUR LITTLE COLLECTING RITUAL</div><h1>今天，会遇见谁？</h1><p>打开一包惊喜，收藏一份心动。</p><div class="row"><span>◷ 每日收入 ¥1,000 · 北京时间零点结算</span><span>藏馆已收录 ${owned.length} 张卡片</span></div></section><div class="notice">每日收入 ¥1,000 · 卡价为静态估值（美元×7.20），随品相与评级调整。<br>30周年：6张/包；M6：5张/包；151：7张/包，20包一盒保底3AR＋1大师球＋1SR以上。<br>出率为游戏模拟，非官方承诺；部分151卡图缺失或为示意图。送评 ¥20，1天后返回，损毁风险25%。</div>${notice?`<p role="status">${notice}</p>`:''}<nav>${['卡包商店','我的图鉴','评级仓库','交易市场'].map(t=>`<button data-tab="${t}" class="${tab===t?'active':''}">${t}</button>`).join('')}</nav><section id="content"></section></main><footer>本地自动存档 · 建议定期导出备份 · 离线天数会结算收入与裸卡磨损<br><button id="export">导出存档</button></footer>`;
const area=document.querySelector('#content');if(tab==='卡包商店'){area.innerHTML=`<div class="row"><h2>挑一包，试试手气</h2><div class="language-switch" role="group" aria-label="卡包语言版本">${['简中','日版','美版'].map(lang=>`<button type="button" data-language="${lang}" aria-pressed="${packLanguage===lang}" class="${packLanguage===lang?'selected':''}">${lang}</button>`).join('')}</div><span class="muted">老卡包每日 20% 概率上架</span></div><div class="grid pack-grid">${packs.map((p,i)=>p.lang!==packLanguage||(p.old&&!s.old)?'':`<article class="panel pack-tile"><span class="tag">${p.lang} / ${p.count} CARDS</span>${p.set==='sv151'?`<div class="pack-cover"><img src="${sv151Meta.cover}" alt="日版151补充包包装" draggable="false"></div>`:p.set==='m6'?'<div class="pack-cover"><img src="assets/m6-jp/pack.jpg" alt="M6 Storm Emeralda 日版补充包包装" draggable="false"></div>':p.anniversary?'<div class="pack-cover"><img src="assets/30th-jp/pack.jpg" alt="日版30周年庆典补充包包装" draggable="false"></div>':p.lang==='简中'?'<div class="pack-cover"><img src="assets/30th/pack.png" alt="简中30周年庆典补充包包装" draggable="false"></div>':`<div class="pack ${p.color}"><b>${p.icon}</b><strong>${p.name}</strong></div>`}<h3>${p.name}</h3><p class="muted">${p.set==='sv151'?`7张/包 · 20包/盒<br>每盒3AR＋1大师球＋1SR以上<br>${sv151Progress()}`:p.set==='m6'?'113张卡 · 每包5张<br>前4张普卡 · 末位R以上<br>美元报价×7.20 · 独立模拟出率':p.anniversary?'日版全编号卡图 · 6张全闪<br>沿用玩家规则 · 无盒箱保底<br>包价为游戏设定 · 卡价按美元网页报价折算':p.lang==='简中'?'6张全闪 · 末位银边/金边互斥<br>玩家统计近似概率 · 无盒箱保底<br>游戏售价 ¥25 · 官方建议零售 ¥18':'最后一张 20% 概率为闪卡（模拟）'}</p><div class="row"><span class="price">${money(p.price)}</span></div><div class="batch-options">${[1,5,10].map(count=>`<button class="${count===1?'gold':''}" data-pack="${i}" data-count="${count}" aria-label="${p.name} ${count}包，${p.price*count}元">${count===1?'拆1包':'连拆'+count+'包'}<small>¥${p.price*count}</small></button>`).join('')}</div></article>`).join('')}</div>`}else if(tab==='交易市场'){area.innerHTML=`<h2>卡店老板的今日收藏</h2><div class="grid">${s.shop.map(c=>card(c,true)).join('')}</div><h2>我的市场挂单</h2><div class="grid">${s.cards.filter(c=>c.state==='listed').map(c=>card(c)).join('')||'<p>暂无挂单。挂单按锁定价格在 1–7 天后模拟成交。</p>'}</div>`}else if(tab==='我的图鉴'){renderCollection(area)}else{
 const cards=s.cards.filter(c=>['graded','grading'].includes(c.state));
 const lost=s.cards.filter(c=>c.state==='lost');
 area.innerHTML=`<h2>评级仓库 · ${cards.length} 张</h2><div class="grid">${cards.map(c=>card(c)).join('')||'<p>暂无送评卡牌。</p>'}</div><h2>损毁记录 · ${lost.length} 张</h2><p class="muted">以下卡牌已永久损毁，不计入当前收藏进度。</p><div class="grid">${lost.map(c=>card(c)).join('')||'<p>暂无损毁记录。</p>'}</div>`;
}
document.querySelectorAll('[data-card-detail]').forEach(b=>b.onclick=()=>openCollectionDetail(b));
const backCollection=document.querySelector('#back-collection');
if(backCollection)backCollection.onclick=returnToCollection;
document.querySelectorAll('[data-collection-set]').forEach(b=>b.onclick=()=>{collectionFocus=null;s.collectionSet=b.dataset.collectionSet;save();render()});
document.querySelectorAll('[data-cancel-list]').forEach(b=>b.onclick=()=>cancelListing(b.dataset.cancelList));

const filterToggle=document.querySelector('#collection-filter-toggle');
if(filterToggle){
 const options=document.querySelector('#collection-filter-options');
 filterToggle.onclick=()=>{options.hidden=!options.hidden;filterToggle.setAttribute('aria-expanded',String(!options.hidden));};
 options.onkeydown=e=>{if(e.key==='Escape'){options.hidden=true;filterToggle.setAttribute('aria-expanded','false');filterToggle.focus();}};
 document.querySelectorAll('[data-collection-sort]').forEach(b=>b.onclick=()=>{s.collectionSort=b.dataset.collectionSort;save();render();document.querySelector('#collection-filter-toggle')?.focus({preventScroll:true});});
}
document.querySelector('#exit').onclick=()=>{for(const c of opening)s.cards.push(c);opening=[];save();s=null;render()};document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(s)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pocket-museum.json';a.click();URL.revokeObjectURL(url)};
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{packLanguage=b.dataset.language;render()});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{collectionFocus=null;tab=b.dataset.tab;render()});document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>buyPacks(+b.dataset.pack,Number(b.dataset.count)));
for(const action of ['sell','grade','list','buy'])document.querySelectorAll(`[data-${action}]`).forEach(b=>b.onclick=()=>{const c=(action==='buy'?s.shop:s.cards).find(c=>c.id===b.dataset[action]);if(!c)return;if(action==='buy'){if(s.balance<value(c)){notice='资金不足';render();return}s.balance-=value(c);s.shop=s.shop.filter(x=>x.id!==c.id);s.cards.push(c)}if(action==='sell'&&!['raw','graded'].includes(c.state))return;if(action==='sell'){s.balance+=value(c)*.8;c.state='sold'}if(action==='grade'){showGradingDialog(c.id);return}if(action==='list'){showListingDialog(c.id);return}save();render()})}
setInterval(()=>{if(s&&!opening.length&&!document.querySelector('#game-dialog')){refresh();render()}},60000);render();
