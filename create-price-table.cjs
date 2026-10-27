// Generate an editable price worksheet; never substitute simulated values for quotes.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'anniversary-data.js'), 'utf8');
const cards = JSON.parse(source.replace(/^const anniversaryCards\s*=\s*/, '').replace(/;\s*$/, ''));
const headers = ['卡牌唯一标识','语言','系列','卡牌编号','卡名','版本','品相','评级状态','币种','市场参考价','报价类型','价格日期','来源平台','来源链接或截图文件','核实状态','卡图路径','备注'];
const rows = cards.map(card => [card.key,'简中','30周年庆典',`${card.number}/103`,card.name,
  card.pikachu ? '30种纪念皮卡丘闪卡' : '周年闪卡（以卡图为准）',
  '近全新','未评级','CNY','','','','','','待核实',card.image,
  '价格空白表示尚未核实，不代表0元；不得填入游戏随机估值。']);
const escape = value => '"' + String(value).replaceAll('"','""') + '"';
const csv = '\uFEFF' + [headers,...rows].map(row => row.map(escape).join(',')).join('\r\n') + '\r\n';
fs.mkdirSync(path.join(__dirname,'prices'),{recursive:true});
const output = path.join(__dirname,'prices','30周年庆典-简中价格待核实表.csv');
fs.writeFileSync(output,csv);
console.log(`Created ${rows.length} unique card rows: ${output}`);
