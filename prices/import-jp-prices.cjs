// Read saved HTML as data only. Never execute scripts from the page.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),input=process.argv[2],fx=Number(process.argv[3]||7.2);
if(!input||!Number.isFinite(fx)||fx<=0)throw Error('Usage: node prices/import-jp-prices.cjs <saved HTML> [CNY per USD]');
const html=fs.readFileSync(input,'utf8');
const table=html.match(/Full Japanese 30th Celebration card list[^]*?<tbody>([^]*?)<\/tbody>/)?.[1];
if(!table)throw Error('Full card table missing');
const clean=s=>s.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").trim();
const quotes={};
for(const row of table.matchAll(/<tr\b[^>]*>([^]*?)<\/tr>/g)){
 const cells=[...row[1].matchAll(/<td\b[^>]*>([^]*?)<\/td>/g)].map(m=>m[1]);
 if(cells.length!==3)throw Error('Unexpected table row');
 const num=clean(cells[0]),name=clean(cells[1]);
 const url=cells[1].match(/href="([^"]+)"/)?.[1];
 const slug=url?.split('/').pop();
 const suffix=/^\d+$/.test(num)?num.padStart(3,'0'):slug?.startsWith('basic-')?'energy-'+slug.slice(6).replace(/-energy$/,''):/^mew-[rgb]rgb$/.test(slug)?'rgb-'+slug[4]:null;
 const usdText=clean(cells[2]);
 if(!suffix||!/^\$[\d,]+\.\d{2}$/.test(usdText))throw Error('Unmapped quote: '+row[1]);
 const usd=Number(usdText.replace(/[$,]/g,'')),key='30th-jp-'+suffix;
 if(quotes[key])throw Error('Duplicate quote '+key);
 quotes[key]={usd,cny:Math.round(usd*fx*100)/100,name,source:url};
}
if(Object.keys(quotes).length!==175)throw Error('Expected 175 quoted cards');
const cards=JSON.parse(fs.readFileSync(path.join(root,'anniversary-jp-data.js'),'utf8').replace(/^const anniversaryJpCards = /,'').replace(/;\s*$/,''));
const missing=cards.filter(c=>!quotes[c.key]).map(c=>c.key);
if(missing.join(',')!=='30th-jp-energy-fighting')throw Error('Unexpected missing quotes '+missing);
const meta={source:'用户上传的 PokeInvest 日版30周年 HTML 静态报价，未在线核验',organizedAt:'2026-10-27',usdToCny:fx,fxNote:'固定游戏换算汇率，非实时汇率',sha256:crypto.createHash('sha256').update(html).digest('hex'),missing};
fs.writeFileSync(path.join(root,'jp-price-data.js'),'const japanesePriceMeta = '+JSON.stringify(meta,null,2)+';\nconst japanesePriceQuotes = '+JSON.stringify(quotes,null,2)+';\nObject.assign(cardPriceQuotes, japanesePriceQuotes);\n');
const rows=[['卡号','卡名','美元网页报价','固定汇率','人民币基础报价','来源','备注'],...cards.map(c=>{const q=quotes[c.key];return [c.number,q?.name||c.name,q?.usd??'',fx,q?.cny??'',q?.source??'','品相和评级另行折算'+(q?'；非实时行情':'；网页缺报价，保留0.5元游戏占位价')];})];
fs.writeFileSync(path.join(__dirname,'日版30周年-美元人民币价格表.csv'),'\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'));
console.log('Imported 175 prices; missing fighting energy; USD/CNY =',fx);
for(const n of ['134','135','137'])console.log(n,quotes['30th-jp-'+n]);
