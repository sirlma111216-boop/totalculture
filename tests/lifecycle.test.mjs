import {test} from 'node:test';
import assert from 'node:assert/strict';
import {koreaToday,isExpired,lifecyclePlace} from '../src/lifecycle.mjs';
import {filterPlaces,filterDirectory,mergeCatalog,normalizeImport} from '../src/domain.mjs';
const p={id:'event',name:'행사',lat:37.57,lng:126.98,category:'performance',status:'inquiry',price:0,endDate:'2026-10-22',sourceType:'seoul',tags:[]};
test('expiry changes only after the end day in Korea',()=>{
 assert.equal(koreaToday(new Date('2026-10-22T14:59:59Z')),'2026-10-22');
 assert.equal(koreaToday(new Date('2026-10-22T15:00:00Z')),'2026-10-23');
 assert.equal(isExpired(p,'2026-10-22'),false);
 assert.equal(isExpired(p,'2026-10-23'),true);
 assert.equal(isExpired({...p,endDate:'2026-02-30'},'2026-10-23'),false);
 assert.equal(isExpired({...p,endDate:''},'2026-10-23'),false);
});
test('expired events hide in discovery and directory but remain saved even outside radius',()=>{
 const opts={school:{lat:37,lng:127},radius:1,today:'2026-10-23'};
 assert.equal(filterPlaces([p],opts).length,0);
 assert.equal(filterDirectory([p],opts).length,0);
 assert.equal(filterPlaces([p],{...opts,savedOnly:true,saved:['event']}).length,1);
 assert.equal(lifecyclePlace(p,opts.today).status,'expired');
 assert.equal(p.status,'inquiry');
});
test('closed sites become recheck only after deadline, never automatically available',()=>{
 const closed={...p,endDate:'',status:'closed',closureUntil:'2026-12-12'};
 assert.equal(lifecyclePlace(closed,'2026-12-12').status,'closed');
 assert.equal(lifecyclePlace(closed,'2026-12-13').status,'recheck');
 assert.equal(lifecyclePlace({...closed,closureUntil:''},'2027-01-01').status,'closed');
 assert.equal(normalizeImport({version:1,places:[closed]}).places[0].closureUntil,'2026-12-12');
});
test('full API refresh retains saved or planned records but can update their dates',()=>{
 const old=[p,{...p,id:'unretained'}];
 assert.deepEqual(mergeCatalog(old,[],false,'seoul',['event']).map(x=>x.id),['event']);
 const fresh={...p,endDate:'2026-11-30'};
 assert.equal(mergeCatalog(old,[fresh],false,'seoul',['event'])[0].endDate,'2026-11-30');
 assert.equal(lifecyclePlace(fresh,'2026-11-01').status,'inquiry');
});
