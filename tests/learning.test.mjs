import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validatePlace,placeDistrict,filterDirectory,mergeCatalog,normalizeImport} from '../src/domain.mjs';
import {normalizeReservation,normalizeCulture} from '../src/catalog.mjs';
const learning=JSON.parse(fs.readFileSync(new URL('../data/learning-spaces.json',import.meta.url))).places;
test('learning catalog preserves valid records, provenance and resolvable park links',()=>{
 const seeds=['research','universities','cinemas'].flatMap(name=>{const d=JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));return d.places||d.venues;});
 const ids=new Set([...learning,...seeds].map(p=>p.id));
 assert.equal(new Set(learning.map(p=>p.id)).size,learning.length);
 for(const p of learning){assert.ok(validatePlace(p),p.name);assert.ok(p.sourceUrl.startsWith('https://'));assert.ok(p.verifiedAt);assert.notEqual(p.status,'available');for(const id of p.relatedIds||[])assert.ok(ids.has(id),id);}
 const restored=normalizeImport({version:1,places:learning}).places;
 assert.deepEqual(restored.find(p=>p.id==='hangang-play').relatedIds,['park-ttukseom']);
 assert.equal(learning.find(p=>p.id==='skt-tum').bookingUrl,'');
});
test('outside Seoul facilities never become Seoul Jung-gu matches',()=>{
 const outside={...learning.find(p=>p.id==='hikr-station'),address:'인천 중구 공항로 271'};
 assert.equal(placeDistrict(outside),'서울 밖');
 assert.equal(filterDirectory([outside],{school:{lat:37.57,lng:126.99},district:'중구'}).length,0);
 assert.equal(filterDirectory([outside],{school:{lat:37.57,lng:126.99},district:'서울 밖'}).length,1);
});
test('API classification uses science keywords in event names',()=>{
 assert.equal(normalizeCulture({TITLE:'로봇 체험',CODENAME:'전시',LAT:37.57,LOT:126.99},'2026-10-18').category,'science');
 assert.equal(normalizeReservation({SVCID:'r',SVCNM:'천문 관측',MAXCLASSNM:'교육강좌',X:127,Y:37.5},'2026-10-18').category,'science');
});
test('refresh of a single Seoul API cannot remove the other API data',()=>{
 const old=[{id:'seoul-c-old',sourceType:'seoul'},{id:'seoul-r-keep',sourceType:'seoul'},{id:'manual',sourceType:'manual'}];
 const result=mergeCatalog(old,[],false,'seoul-culture');
 assert.deepEqual(result.map(p=>p.id),['seoul-r-keep','manual']);
});
