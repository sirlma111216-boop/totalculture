import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initialPlaces} from '../src/seed-catalog.mjs';
import {filterDirectory,mergeSeedCatalog,mergeCatalog,validatePlace} from '../src/domain.mjs';
import {eshareRows,normalizeEshare} from '../src/eshare.mjs';
import {onRequestGet} from '../functions/api/shared-facilities.js';
test('every researched facility catalogue is included in the actual application seed',()=>{
 const ids=new Set(initialPlaces.map(p=>p.id));
 assert.equal(ids.size,initialPlaces.length);
 for(const file of fs.readdirSync(new URL('../data/',import.meta.url)).filter(f=>f.endsWith('.json'))){
  const data=JSON.parse(fs.readFileSync(new URL('../data/'+file,import.meta.url)));
  if(Array.isArray(data.places))for(const p of data.places)assert.ok(ids.has(p.id),`${file}: ${p.name} is not connected to the app`);
 }
 for(const p of initialPlaces)assert.ok(validatePlace(p),p.name);
});
test('previously omitted requests appear after upgrading an existing workspace and API refresh',()=>{
 const rows=mergeCatalog(mergeSeedCatalog([],initialPlaces),[],false,'seoul');
 const options={school:{lat:37.593,lng:127.055},today:'2026-10-18'};
 for(const query of ['글로벌지식협력단지','홍릉숲','국립경찰박물관','KOICA','국립중앙도서관','한국잡월드'])assert.ok(filterDirectory(rows,{...options,query}).length,query);
 assert.equal(filterDirectory(rows,{...options,query:'글로벌지식협력단지'}).length,3);
 assert.ok(rows.find(p=>p.id==='eco-hongneung-guide').visitInfo.documents.includes('공문'));
});
test('shared facility data has no inferred price, contacts or real-time availability',()=>{
 const row={rsrcNo:'123',rsrcNm:'구민체육센터',lat:'37.5',lot:'127',addr:'서울 강남구',instUrlAddr:'javascript:alert(1)'};
 const p=normalizeEshare(row,'2026-10-18');assert.equal(p.price,null);assert.equal(p.phone,'');assert.equal(p.status,'inquiry');assert.equal(p.bookingUrl,'');
 assert.equal(normalizeEshare({...row,lat:''},'2026-10-18'),null);
 assert.throws(()=>eshareRows({error:'invalid key'}));assert.deepEqual(eshareRows({data:[row]}),[row]);
});
test('unapproved shared-facility key is explicitly unconfigured without accessing upstream',async()=>{
 const response=await onRequestGet({request:new Request('https://example.org/api/shared-facilities'),env:{},waitUntil:()=>{throw Error('must not cache unconfigured result');}});
 assert.equal((await response.json()).configured,false);
});
