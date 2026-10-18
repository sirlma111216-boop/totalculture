import fs from 'node:fs';
const rows=['research','learning-spaces','universities'].flatMap(n=>{const d=JSON.parse(fs.readFileSync(`data/${n}.json`));return d.places||d.venues;});
const out=[];
for(let i=0;i<rows.length;i+=6)await Promise.all(rows.slice(i,i+6).map(async p=>{try{const r=await fetch(p.sourceUrl,{signal:AbortSignal.timeout(10000)});const html=await r.text();fs.writeFileSync(`artifacts/images/${p.id}.html`,html);const imgs=[...html.matchAll(/<img\b[^>]*>/gi)].map(m=>{const tag=m[0];const src=tag.match(/\bsrc=["']([^"']+)/i)?.[1];return {url:src?new URL(src.replaceAll('&amp;','&'),r.url).href:'',alt:tag.match(/\balt=["']([^"']*)/i)?.[1]||''};}).filter(x=>x.url&&!/logo|icon|btn_|banner|sns|kogl|blank|facebook|twitter|loading|arrow|noimg|nuri/i.test(x.url));out.push({id:p.id,source:r.url,imgs});}catch{}}));
fs.writeFileSync('artifacts/images/elements.json',JSON.stringify(out,null,2));console.log(out.map(p=>({id:p.id,count:p.imgs.length})));
