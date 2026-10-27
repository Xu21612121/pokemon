const fs=require('node:fs'),path=require('node:path');
const rows=require('./quotes.cjs');
const root=path.join(__dirname,'..');
const cards=JSON.parse(fs.readFileSync(path.join(root,'anniversary-data.js'),'utf8').replace(/^const anniversaryCards\s*=\s*/,'').replace(/;\s*$/,''));
const extraNames={124:'呆火鳄ex',125:'甲贺忍蛙ex',126:'皮卡丘ex',127:'皮卡丘ex',128:'超梦ex',129:'梦幻ex',130:'仙子伊布ex',131:'耿鬼ex',132:'基拉祈ex',133:'暴飞龙ex','R/RGB':'梦幻（红）','B/RGB':'梦幻（蓝）','G/RGB':'梦幻（绿）'};
const unique=new Set();
for(const r of rows){if(unique.has(r.number)||!Number.isFinite(r.price)||r.price<0)throw Error('Invalid quote');unique.add(r.number);}
for(const c of cards)if(!unique.has(c.number))throw Error('Missing quote '+c.number);
const lookup=Object.fromEntries(rows.map(r=>['30th-cn-'+r.number,{cny:r.price,source:r.source}]));
fs.writeFileSync(path.join(root,'price-data.js'),'const cardPriceQuotes = '+JSON.stringify(lookup,null,2)+';\n');
const output=[['编号','卡名','语言','系列','页面起售价_CNY','报价类型','品相','来源','截图文件','整理日期','游戏卡图状态','备注']];
for(const r of rows.sort((a,b)=>a.number.localeCompare(b.number))){const c=cards.find(c=>c.number===r.number);output.push([r.number,c?.name||extraNames[r.number],'简中','30周年庆典',r.price,'页面显示的起售价（非成交价）','截图未说明','集换社（用户截图）',r.source,'2026-10-27',c?'已导入':'待补图','日期为整理日期；未在线核验。077的价格结合153与154号连续截图读取。']);}
fs.writeFileSync(path.join(__dirname,'30周年庆典-集换社静态价格.csv'),'\uFEFF'+output.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'));
console.log(`${rows.length} quotes; ${cards.length} imported cards covered`);
