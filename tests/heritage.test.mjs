import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeImport,mergeCatalog,mergeSeedCatalog,filterPlaces} from '../src/domain.mjs';
const places=JSON.parse(fs.readFileSync(new URL('../data/heritage-museums.json',import.meta.url))).places;
test('permanent institutions survive API replacement and future date filters',()=>{
 const merged=mergeCatalog(places,[],false,'seoul');
 const rows=filterPlaces(merged,{school:{lat:37.577,lng:126.978},radius:50,date:'2027-01-01'});
 for(const id of ['heritage-gyeongbok','museum-gogung','museum-much'])assert.ok(rows.some(p=>p.id===id));
 assert.equal(new Set(places.map(p=>p.id)).size,places.length);
});
test('visit conditions and evidence survive backup while unsafe links are removed',()=>{
 const g=places.find(p=>p.id==='heritage-gyeongbok');
 const result=normalizeImport({version:1,places:[{...g,visitInfo:{...g.visitInfo,sources:[...g.visitInfo.sources,{label:'bad',url:'javascript:alert(1)'}]}}]}).places[0];
 assert.equal(result.visitInfo.documents,g.visitInfo.documents);
 assert.deepEqual(result.visitInfo.sources,g.visitInfo.sources);
 assert.match(result.visitInfo.cautions,/특별관람/);
});
test('seed update preserves teacher edits and adds missing permanent institutions',()=>{
 const g=places[0];const edited={...g,notes:'답사 확인',history:[{at:'2026-10-18',text:'교사 수정'}]};
 const rows=mergeSeedCatalog([edited],places);
 assert.equal(rows.find(p=>p.id===g.id).notes,'답사 확인');
 assert.equal(rows.length,places.length);
});
test('critical student reservation thresholds and current closures remain explicit',()=>{
 const byId=Object.fromEntries(places.map(p=>[p.id,p]));
 assert.match(byId['museum-gogung'].visitInfo.students,/30명/);
 assert.match(byId['museum-much'].visitInfo.students,/20명/);
 assert.match(byId['heritage-gyeongbok'].visitInfo.documents,/교원/);
 for(const id of ['annex-gyeonggyo','annex-donuimun','museum-hangeul'])assert.equal(byId[id].status,'closed');
 for(const p of places){assert.ok(p.visitInfo.sources.length);assert.equal(p.status==='available',false);}
});
