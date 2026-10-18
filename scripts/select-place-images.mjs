import fs from 'node:fs';
const elements=JSON.parse(fs.readFileSync('artifacts/images/elements.json'));
const records=['research','learning-spaces','universities'].flatMap(n=>{const d=JSON.parse(fs.readFileSync(`data/${n}.json`));return d.places||d.venues;});
const out={};
function use(id,sourceId,index){const page=elements.find(p=>p.id===sourceId),img=page?.imgs[index];if(!img)throw Error(id);out[id]={imageUrl:img.url,imageSourceUrl:page.source,imageCredit:`기관 공식 안내 · ${img.alt||'시설 소개 이미지'}`};}
// Exact park names in the Seoul Parks directory identify the corresponding photograph.
const directory=elements.find(p=>p.id==='park-worldcup');
for(const p of records){const name=p.id==='childrenpark'?'어린이대공원':p.name;const i=directory.imgs.findIndex(img=>img.alt===name);if(i>=0)use(p.id,directory.id,i);}
for(const [id,source,index] of [
 ['hangang-play','hangang-play',2],['seoul-battleship','seoul-battleship',2],
 ['dreamart','park-dream',34],['ddp','ddp',1],['mmca-seoul','mmca-seoul',2],['mmca-deoksu','mmca-deoksu',4],
 ['kofa-museum','kofa-museum',0],['baekje-museum','baekje-museum',3],
 ['samsung-gangnam','samsung-gangnam',6],['univ-khu-peace','univ-khu-peace',4],
 ['hyehwa-exhibit','hyehwa-exhibit',3]
])use(id,source,index);
// Store only observed image URLs and their source pages, never logos shared by unrelated branches.
fs.writeFileSync('data/place-images.json',JSON.stringify(out,null,2)+'\n');
console.log(Object.entries(out).map(([id,p])=>({id,caption:p.imageCredit})));
