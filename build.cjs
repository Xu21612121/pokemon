const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
let html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${read('style.css').replace(/^\s*@import\s+url\([^\r\n]*\);\s*$/gm, '')}</style>`)
  .replace('<script src="compat.js"></script>', () => `<script>${read('compat.js')}</script>`)
  .replace('<script src="anniversary-data.js"></script>', () => `<script>${read('anniversary-data.js')}</script>`)
  .replace('<script src="anniversary.js"></script>', () => `<script>${read('anniversary.js')}</script>`)
  .replace('<script src="swipe.js"></script>', () => `<script>${read('swipe.js')}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>${read('app.js')}</script>`);
html = html.replace(/assets\/30th\/[\w.-]+\.(?:webp|png)/g, file => 'data:image/'+(file.endsWith('.png')?'png':'webp')+';base64,'+fs.readFileSync(path.join(__dirname,file)).toString('base64'));
fs.writeFileSync(path.join(__dirname, '口袋藏馆.html'), html);
fs.writeFileSync(path.join(__dirname, '口袋藏馆-v0.4.1.html'), html);
console.log('Created standalone 口袋藏馆.html');
