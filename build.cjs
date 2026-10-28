const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
let html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${read('style.css').replace(/^\s*@import\s+url\([^\r\n]*\);\s*$/gm, '')}</style>`)
  .replace('<script src="compat.js"></script>', () => `<script>${read('compat.js')}</script>`)
  .replace('<script src="anniversary-data.js"></script>', () => `<script>${read('anniversary-data.js')}</script>`)
  .replace('<script src="anniversary-jp-data.js"></script>', () => `<script>${read('anniversary-jp-data.js')}</script>`)
  .replace('<script src="price-data.js"></script>', () => `<script>${read('price-data.js')}</script>`)
  .replace('<script src="jp-price-data.js"></script>', () => `<script>${read('jp-price-data.js')}</script>`)
  .replace('<script src="m6-data.js"></script>', () => `<script>${read('m6-data.js')}</script>`)
  .replace('<script src="m6.js"></script>', () => `<script>${read('m6.js')}</script>`)
  .replace('<script src="slot-rules.js"></script>', () => `<script>${read('slot-rules.js')}</script>`)
  .replace('<script src="anniversary.js"></script>', () => `<script>${read('anniversary.js')}</script>`)
  .replace('<script src="swipe.js"></script>', () => `<script>${read('swipe.js')}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>${read('app.js')}</script>`);
html = html.replace(/assets\/(?:30th(?:-jp)?|m6-jp)\/[\w.-]+\.(?:webp|png|jpg)/g, file => 'data:image/'+(file.endsWith('.jpg')?'jpeg':file.endsWith('.png')?'png':'webp')+';base64,'+fs.readFileSync(path.join(__dirname,file)).toString('base64'));
fs.writeFileSync(path.join(__dirname, '口袋藏馆.html'), html);
fs.writeFileSync(path.join(__dirname, '口袋藏馆-v0.5.3-M6双卡包版.html'), html);
console.log('Created standalone 口袋藏馆.html');
