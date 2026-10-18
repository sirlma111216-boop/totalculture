import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parkRelated,migrateParkCategories} from '../src/parks.mjs';
import {normalizeReservation} from '../src/catalog.mjs';
import {normalizeImport,filterPlaces} from '../src/domain.mjs';
test('park migration preserves edits and separates facilities from parks',()=>{
 const park={id:'park-dream',name:'북서울꿈의숲',category:'sports',sourceType:'curated'};
 const edited={...park,id:'childrenpark',history:[{text:'수정'}]};
 const court={id:'seoul-r-court',name:'서울숲 테니스장',category:'sports',sourceType:'seoul'};
 assert.deepEqual(migrateParkCategories([park,edited,court]).map(p=>p.category),['park','sports','sports']);
 const row={SVCID:'1',X:127,Y:37.5};
 assert.equal(normalizeReservation({...row,SVCNM:'서울숲 테니스장'},'2026-10-18').category,'sports');
 assert.equal(normalizeReservation({...row,SVCNM:'서울숲공원 생태 탐방'},'2026-10-18').category,'park');
});
test('park details link explicit facilities and named programs, never merely nearby venues',()=>{
 const park={id:'park-dream',name:'북서울꿈의숲',category:'park',relatedIds:['hall']};
 const rows=[park,{id:'hall',name:'아트센터'},{id:'program',name:'꿈의 숲 생태교실'},{id:'far',name:'다른 행사',description:'꿈의숲 근처'},{id:'reverse',name:'전망대',relatedIds:['park-dream']}];
 assert.deepEqual(parkRelated(park,rows).map(p=>p.id),['hall','program','reverse']);
 assert.equal(parkRelated(park,rows)[1].relationKind,'장소명 일치');
});
test('park category works in backups and map filtering',()=>{
 const p={id:'p',name:'공원',category:'park',lat:37.5,lng:127,status:'inquiry',price:null};
 assert.equal(normalizeImport({version:1,places:[p]}).places[0].category,'park');
 assert.equal(filterPlaces([p,{...p,id:'gym',category:'sports'}],{school:p,radius:10,cats:['park']}).length,1);
});
