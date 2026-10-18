import {test} from 'node:test';
import assert from 'node:assert/strict';
import {transportLinks} from '../src/transport.mjs';
test('directions use the selected school and invert both endpoints for the return journey',()=>{
 const school={name:'학교 / A, B',lat:37.59,lng:127.05};
 const place={name:'시설',lat:37.51,lng:127.1};
 const outgoing=transportLinks(school,place);
 const back=transportLinks(school,place,true);
 const q=new URL(outgoing.google).searchParams;
 assert.equal(q.get('origin'),'37.59,127.05');assert.equal(q.get('destination'),'37.51,127.1');assert.equal(q.get('travelmode'),'transit');
 assert.equal(new URL(back.google).searchParams.get('origin'),q.get('destination'));
 assert.ok(outgoing.kakao.includes(encodeURIComponent(school.name)));
 assert.notEqual(transportLinks({...school,lat:37.6},place).google,outgoing.google);
 assert.equal(transportLinks({...school,lat:NaN},place),null);
});
