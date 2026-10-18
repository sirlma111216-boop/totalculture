import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTransit,transitQuery} from '../src/transit.mjs';
import {onRequestGet} from '../functions/api/transit-config.js';
test('mixed route retains bus alternatives, stops and computes transfers excluding walks',()=>{
 const [r]=normalizeTransit({result:{path:[{info:{totalTime:42,totalWalk:430,payment:1550},subPath:[{trafficType:3,sectionTime:5,distance:300},{trafficType:1,lane:{name:'수도권 2호선'},startName:'당산',endName:'합정',sectionTime:9,passStopList:{stations:[{stationName:'당산'},{stationName:'합정'}]}},{trafficType:3,sectionTime:2,distance:130},{trafficType:2,lane:[{busNo:'271'},{busNo:'273'}],sectionTime:26}]}]}});
 assert.equal(r.transfers,1);assert.equal(r.minutes,42);assert.deepEqual(r.steps[3].lines,['271','273']);assert.deepEqual(r.steps[1].stations,['당산','합정']);
});
test('provider errors and missing routes never invent directions',()=>{assert.throws(()=>normalizeTransit({error:{code:500}}));assert.throws(()=>normalizeTransit({result:{}}));assert.deepEqual(normalizeTransit({result:{path:[]}}),[]);});
test('query preserves longitude latitude order and validates endpoints',()=>{const q=transitQuery({lat:37,lng:127},{lat:38,lng:128});assert.equal(q.get('SX'),'127');assert.equal(q.get('EY'),'38');assert.throws(()=>transitQuery({lat:NaN,lng:127},{}));});
test('public config exposes only explicitly configured Web key, never server secrets',async()=>{const r=onRequestGet({env:{ODSAY_API_KEY:'server-secret',SEOUL_API_KEY:'other-secret'}});assert.deepEqual(await r.json(),{webKey:null});assert.equal(r.headers.get('Cache-Control'),'no-store');});
