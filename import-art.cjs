// Import user-supplied, already extracted artwork. Never execute archive scripts.
const fs=require('node:fs'),path=require('node:path');
const dirs=process.argv.slice(2);if(dirs.length!==2)throw Error('Pass the two extracted image directories');
const out=path.join(__dirname,'assets/30th');fs.mkdirSync(out,{recursive:true});
const files=new Map();
for(const dir of dirs)for(const f of fs.readdirSync(dir)){const m=f.match(/30th_(\d+)_/);if(m&&!files.has(+m[1]))files.set(+m[1],path.join(dir,f));}
files.set(135,path.join(dirs[1],'hero-03.webp'));
const names={4:'甜甜萤',5:'彩粉蝶',6:'火焰鸟',7:'凤王',8:'莱希拉姆',9:'呆火鳄ex',10:'呆呆兽',11:'拉普拉斯',12:'急冻鸟',13:'盖欧卡',14:'帕路奇亚',47:'皮卡丘ex',48:'皮卡丘ex',49:'闪电鸟',50:'捷克罗姆',51:'颤弦蝾螈',52:'莫鲁贝可',53:'密勒顿',57:'梦幻ex',58:'太阳伊布',59:'仙子伊布ex',61:'飘飘球',77:'月亮伊布',88:'暴飞龙ex',104:'阿罗椰椰树',105:'火焰鸟',106:'拉普拉斯',107:'急冻鸟',108:'闪电鸟',110:'莫鲁贝可',111:'飘飘球',114:'尼多娜',121:'百变怪',123:'一对鼠',134:'超梦ex',135:'梦幻ex',136:'皮卡丘',137:'喷火龙',138:'小霞',139:'莉佳的胖丁',140:'勾魂眼',141:'闪耀时拉比',142:'洛奇亚',143:'优雅猫',144:'邪恶班基拉斯',145:'巨钳螳螂ex',146:'巨金怪',147:'帕路奇亚',148:'由克希',150:'耿鬼',151:'捷克罗姆',152:'克雷色利亚',153:'N',154:'烈空坐EX',155:'盖诺赛克特EX',156:'M沙奈朵EX',157:'阿罗拉椰蛋树',158:'索尔迦雷欧GX',159:'爆肌蚊GX',160:'卡比兽&伊布GX',161:'苍响V',162:'雷公',163:'梦幻VMAX',164:'阿尔宙斯VSTAR',165:'鲤鱼王'};
const cards=[...files].sort((a,b)=>a[0]-b[0]).map(([n,file])=>{const id=String(n).padStart(3,'0');fs.copyFileSync(file,path.join(out,id+'.webp'));return {key:'30th-cn-'+id,number:id,name:n>=17&&n<=46?'皮卡丘':names[n]||'30周年卡牌 '+id,image:'assets/30th/'+id+'.webp',pikachu:n>=17&&n<=46};});
fs.copyFileSync(path.join(dirs[1],'30th-celebration-logo.png'),path.join(out,'logo.png'));
fs.writeFileSync(path.join(__dirname,'anniversary-data.js'),'const anniversaryCards = '+JSON.stringify(cards,null,2)+';\n');
console.log('Imported',cards.length,'cards; Pikachu:',cards.filter(c=>c.pikachu).length);
