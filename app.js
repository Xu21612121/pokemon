const KEY='pocket-museum-v1';
const packs=[{name:'30周年庆典 M6a',lang:'日版',price:25,count:6,color:'blue',icon:'✨',anniversary:true},{name:'Storm Emeralda M6',lang:'日版',price:m6Meta.packCny,count:5,set:'m6',icon:'🐉'},{name:'30周年庆典',lang:'简中',price:25,count:6,color:'blue',icon:'✨'},{name:'绯红与紫罗兰',lang:'美版',price:45,count:10,color:'pink',icon:'🔮'},{name:'旧时光收藏包',old:true,lang:'日版',price:180,count:5,color:'',icon:'⌛'}];
const names=['皮卡丘','妙蛙种子','杰尼龟','小火龙','伊布','耿鬼','梦幻','喷火龙'];const icons=['⚡','🌱','💧','🔥','🦊','👻','🌸','🐉'];
let s=null,tab='卡包商店',packLanguage='日版',notice='',opening=[];const app=document.querySelector('#app');
const day=()=>Math.floor((Date.now()+8*3600000)/86400000);const money=n=>'¥ '+n.toFixed(2);const save=()=>gameStorage.setItem(KEY,JSON.stringify({...s,cards:[...new Map([...s.cards,...opening].map(c=>[c.id,c])).values()]}));
function refresh(){if(s.day>=day())return;const n=day()-s.day;s.balance+=1000*n;s.day=day();s.old=Math.random()<.2;s.shop=Array.from({length:3},makeCard);for(const c of s.cards)if(c.state==='raw')c.condition=Math.max(0,c.condition-n*.3);settle();save()}
function settle(){for(const c of s.cards){if(c.state==='grading'&&c.due<=day()){if(Math.random()<.25)c.state='lost';else {c.state='graded';c.grade=Math.max(1,Math.min(10,Math.round(c.condition/10-c.center/20)));}}if(c.state==='listed'&&c.due<=day()){s.balance+=c.ask;c.state='sold'}}}
function makeCard(rare=false){const i=Math.floor(Math.random()*names.length);return {id:cardId(),i,rare,base:rare?60+Math.floor(Math.random()*450):2+Math.floor(Math.random()*14),condition:95+Math.random()*5,center:Math.floor(Math.random()*81),error:rare&&Math.random()<.005,state:'raw',lang:'日版'}}
const value=c=>(cardPriceQuotes[c.cardKey]?.cny ?? c.base)*(c.condition/100)*(c.error?3:1)*(c.state==='graded'?([0,.4,.5,.6,.7,.8,1,1.2,1.5,2,3][c.grade]):1);
function start(fresh,approved=false){if(fresh){if(gameStorage.getItem(KEY)&&!approved){showGameDialog({title:'开启新存档',message:'新存档将覆盖当前存档，已有资金和收藏将被替换。建议先导出备份，确定继续吗？',confirmLabel:'确认覆盖',onConfirm:()=>start(true,true)});return;}s={balance:1000,day:day(),cards:[],shop:Array.from({length:3},()=>makeCard()),old:Math.random()<.2};save()}else{try{s=JSON.parse(gameStorage.getItem(KEY));if(!s||!Array.isArray(s.cards))throw Error();refresh();settle();save()}catch{notice='存档无法读取，请新建存档。';s=null}}render()}
function card(c,shop=false){return `<article class="panel"><div class="cardart ${c.cardKey?'has-art':''} ${c.rare?'rare':''}">${cardPicture(c)}</div><span class="tag">${c.lang} · ${c.rare?'闪卡 ✦':'普通卡'} ${c.error?'⭐ 错版':''}</span><div class="row"><h3>${cardTitle(c)}</h3><span>× ${shop?1:s.cards.filter(x=>sameCard(x,c)&&['raw','graded'].includes(x.state)).length}</span></div><div class="price">${money(value(c))}${(c.cardKey?.startsWith('30th-jp-')||c.cardKey?.startsWith('m6-jp-'))?`<small class="muted"> · ${cardPriceQuotes[c.cardKey]?'网页报价折算估值':'缺报价，游戏占位价'}</small>`:''}</div><p class="muted">品相 ${c.condition.toFixed(1)}% · 左右居中 ${50-c.center/2}:${50+c.center/2}${c.grade?' · 评级 '+c.grade:''}</p>${shop?`<button data-buy="${c.id}">买入收藏</button>`:c.state==='raw'||c.state==='graded'?`<div class="actions"><button data-sell="${c.id}">八折回收</button><button data-list="${c.id}">市场挂单</button>${c.state==='raw'?`<button data-grade="${c.id}">送评 ¥20</button>`:''}</div>`:`<p class="muted">${c.state==='grading'?'评级中': '市场挂单'} · 剩余 ${Math.max(0,c.due-day())} 天</p>`}</article>`}
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
   if(card&&['raw','graded'].includes(card.state)){card.ask=ask;card.state='listed';card.due=day()+days;save();render();}
 }});
}
function render(){
document.body.classList.toggle('is-opening',!!s&&opening.length>0);
if(s&&opening.length){
 app.innerHTML=`<main class="opening-screen" aria-label="滑动卡片逐张收藏，方向键也可操作"><div class="swipe-stack">${opening[1]?`<article class="swipe-under" aria-hidden="true">${revealCard(opening[1])}</article>`:''}<article class="swipe-top" tabindex="0" role="group" aria-label="${cardTitle(opening[0])}，剩余${opening.length}张，拖动或按方向键收藏">${revealCard(opening[0])}</article></div></main>`;
 mountSwipe();
 document.querySelector('.swipe-top').focus({preventScroll:true});
 return;
}
if(!s){app.innerHTML=`<main class="start"><div class="eyebrow">POCKET MUSEUM / 私人收藏室 · v0.5.3 M6双卡包版</div><h1>每一包，<br>都是新的期待。</h1><p>收集喜欢的伙伴，把闪耀的瞬间留在藏馆。<br>你的拆卡日记，从这里开始。</p><div class="pack"><b>⚡</b><strong>口袋藏馆</strong></div><button class="gold" id="new">开启新存档</button> <button id="continue" ${gameStorage.getItem(KEY)?'':'disabled'}>继续收藏</button><p>${notice}</p></main>`;document.querySelector('#new').onclick=()=>start(true);document.querySelector('#continue').onclick=()=>start(false);return}
const owned=s.cards.filter(c=>['raw','graded'].includes(c.state));app.innerHTML=`<header><div><strong>◈ 口袋藏馆</strong><br><small>POCKET MUSEUM · v0.5.3 M6双卡包版</small></div><div><span class="muted">收藏资金 </span><b class="price">${money(s.balance)}</b> <button id="exit">存档退出</button></div></header><main><section class="hero"><div class="eyebrow">YOUR LITTLE COLLECTING RITUAL</div><h1>今天，会遇见谁？</h1><p>打开一包惊喜，收藏一份心动。</p><div class="row"><span>◷ 每日收入 ¥1,000 · 北京时间零点结算</span><span>藏馆已收录 ${owned.length} 张卡片</span></div></section><div class="notice">日版30周年 M6a 已接入001–165全编号卡图，每包6张全闪。第3位可出FUR/RGB，第4位可出SAR/AR/RR，第5位银边皮卡丘或金边复刻互斥，第6位固定能量卡。日版普卡统一基础卡池：第1、2位固定普卡，第3、4位未出特殊卡时也为普卡，不划分C/U/R。采用用户指定卡位及美版玩家统计：RGB 1/4063、FUR 1/99、SAR 1/19、金边 1/9.6、AR 1/5.2、RR 1/4；每包至多一个上述出货，不代表日版官方出率或盒箱保底。8种能量卡等概率抽取（游戏设定）。RGB已启用，三种颜色等概率。日版175张卡采用用户上传网页的美元静态报价，按1美元＝7.20元人民币换算（非实时汇率）；品相和评级另行折算。斗能量缺报价，暂保留0.5元游戏价；包价仍为游戏设定。简中保留原报价及存档。M6已加入113张卡图，每包5张：前4张普卡、末位R及以上；RR 1/4、AR 1/5.2、SR 6.2%、SAR 0.4%、MUR约0.0667%。SR以上按平均每30包2张模拟，无盒箱保底。M6包价及卡价来自上传网页，按7.20换算。评级有25%损毁风险。</div>${notice?`<p role="status">${notice}</p>`:''}<nav>${['卡包商店','我的图鉴','评级仓库','交易市场'].map(t=>`<button data-tab="${t}" class="${tab===t?'active':''}">${t}</button>`).join('')}</nav><section id="content"></section></main><footer>本地自动存档 · 建议定期导出备份 · 离线天数会结算收入与裸卡磨损<br><button id="export">导出存档</button></footer>`;
const area=document.querySelector('#content');if(tab==='卡包商店'){area.innerHTML=`<div class="row"><h2>挑一包，试试手气</h2><div class="language-switch" role="group" aria-label="卡包语言版本">${['简中','日版','美版'].map(lang=>`<button type="button" data-language="${lang}" aria-pressed="${packLanguage===lang}" class="${packLanguage===lang?'selected':''}">${lang}</button>`).join('')}</div><span class="muted">老卡包每日 20% 概率上架</span></div><div class="grid pack-grid">${packs.map((p,i)=>p.lang!==packLanguage||(p.old&&!s.old)?'':`<article class="panel pack-tile"><span class="tag">${p.lang} / ${p.count} CARDS</span>${p.set==='m6'?'<div class="pack-cover"><img src="assets/m6-jp/pack.jpg" alt="M6 Storm Emeralda 日版补充包包装" draggable="false"></div>':p.anniversary?'<div class="pack-cover"><img src="assets/30th-jp/pack.jpg" alt="日版30周年庆典补充包包装" draggable="false"></div>':p.lang==='简中'?'<div class="pack-cover"><img src="assets/30th/pack.png" alt="简中30周年庆典补充包包装" draggable="false"></div>':`<div class="pack ${p.color}"><b>${p.icon}</b><strong>${p.name}</strong></div>`}<h3>${p.name}</h3><p class="muted">${p.set==='m6'?'113张卡 · 每包5张<br>前4张普卡 · 末位R以上<br>美元报价×7.20 · 独立模拟出率':p.anniversary?'日版全编号卡图 · 6张全闪<br>沿用玩家规则 · 无盒箱保底<br>包价为游戏设定 · 卡价按美元网页报价折算':p.lang==='简中'?'6张全闪 · 末位银边/金边互斥<br>玩家统计近似概率 · 无盒箱保底<br>游戏售价 ¥25 · 官方建议零售 ¥18':'最后一张 20% 概率为闪卡（模拟）'}</p><div class="row"><span class="price">${money(p.price)}</span><button class="gold" data-pack="${i}">拆一包 ↗</button></div></article>`).join('')}</div>`}else if(tab==='交易市场'){area.innerHTML=`<h2>卡店老板的今日收藏</h2><div class="grid">${s.shop.map(c=>card(c,true)).join('')}</div><h2>我的市场挂单</h2><div class="grid">${s.cards.filter(c=>c.state==='listed').map(c=>card(c)).join('')||'<p>暂无挂单。挂单按锁定价格在 1–7 天后模拟成交。</p>'}</div>`}else{let cards=s.cards.filter(c=>tab==='我的图鉴'?c.state==='raw':['graded','grading'].includes(c.state));if(tab==='我的图鉴')cards=sortedCollection(cards,s.collectionSort);area.innerHTML=`<div class="row"><h2>${tab} <span class="muted">${cards.length} 张</span></h2>${tab==='我的图鉴'?collectionFilter():''}</div><div class="grid">${cards.map(c=>card(c)).join('')||'<p>这里还很安静，先拆一包试试吧。</p>'}</div><p class="muted">历史评级损毁：${s.cards.filter(c=>c.state==='lost').length} 张</p>`}
const filterToggle=document.querySelector('#collection-filter-toggle');
if(filterToggle){
 const options=document.querySelector('#collection-filter-options');
 filterToggle.onclick=()=>{options.hidden=!options.hidden;filterToggle.setAttribute('aria-expanded',String(!options.hidden));};
 options.onkeydown=e=>{if(e.key==='Escape'){options.hidden=true;filterToggle.setAttribute('aria-expanded','false');filterToggle.focus();}};
 document.querySelectorAll('[data-collection-sort]').forEach(b=>b.onclick=()=>{s.collectionSort=b.dataset.collectionSort;save();render();document.querySelector('#collection-filter-toggle')?.focus({preventScroll:true});});
}
document.querySelector('#exit').onclick=()=>{for(const c of opening)s.cards.push(c);opening=[];save();s=null;render()};document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(s)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pocket-museum.json';a.click();URL.revokeObjectURL(url)};
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{packLanguage=b.dataset.language;render()});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>{const p=packs[+b.dataset.pack];if(s.balance<p.price){notice='资金不足，明天再来看看吧。';render();return}s.balance-=p.price;opening=p.set==='m6'?openM6():p.anniversary?openAnniversary('日版'):p.lang==='简中'?openAnniversary():Array.from({length:p.count},(_,i)=>({...makeCard(i===p.count-1&&Math.random()<.2),lang:p.lang}));s.cards.push(...opening);save();s.cards.splice(-opening.length);notice='卡片已保存，刷新页面也不会丢失。';render()});
for(const action of ['sell','grade','list','buy'])document.querySelectorAll(`[data-${action}]`).forEach(b=>b.onclick=()=>{const c=(action==='buy'?s.shop:s.cards).find(c=>c.id===b.dataset[action]);if(!c)return;if(action==='buy'){if(s.balance<value(c)){notice='资金不足';render();return}s.balance-=value(c);s.shop=s.shop.filter(x=>x.id!==c.id);s.cards.push(c)}if(action==='sell'){s.balance+=value(c)*.8;c.state='sold'}if(action==='grade'){showGradingDialog(c.id);return}if(action==='list'){showListingDialog(c.id);return}save();render()})}
setInterval(()=>{if(s&&!opening.length&&!document.querySelector('#game-dialog')){refresh();render()}},60000);render();
