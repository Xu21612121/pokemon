const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${read('style.css').replace(/^\s*@import\s+url\([^\r\n]*\);\s*$/gm, '')}</style>`)
  .replace('<script src="compat.js"></script>', () => `<script>${read('compat.js')}</script>`)
  .replace('<script src="swipe.js"></script>', () => `<script>${read('swipe.js')}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>${read('app.js')}</script>`);
fs.writeFileSync(path.join(__dirname, '口袋藏馆.html'), html);
fs.writeFileSync(path.join(__dirname, '口袋藏馆-v0.3.2.html'), html);
console.log('Created standalone 口袋藏馆.html');
