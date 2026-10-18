import fs from 'node:fs';
const rows=['research','learning-spaces','universities','cinemas'].flatMap(n=>{const d=JSON.parse(fs.readFileSync(`data/${n}.json`));return d.places||d.venues;});
const results=[];
for(let i=0;i<rows.length;i+=6){await Promise.all(rows.slice(i,i+6).map(async p=>{
 try {const r=await fetch(p.sourceUrl,{signal:AbortSignal.timeout(10000)});const html=await r.text();
 const meta=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);
 const tag=meta.find(m=>/(?:property|name)=["']og:image["']/i.test(m));
 const raw=tag?.match(/content=["']([^"']+)/i)?.[1];
 results.push({id:p.id,name:p.name,url:r.url,image:raw?new URL(raw.replaceAll('&amp;','&'),r.url).href:'',title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(),ok:r.ok});
 }catch{results.push({id:p.id,name:p.name,image:'',error:true});}
 }));}
fs.mkdirSync('artifacts/images',{recursive:true});fs.writeFileSync('artifacts/images/candidates.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.filter(p=>p.image),null,2));
