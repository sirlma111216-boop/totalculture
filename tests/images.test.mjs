import {test} from 'node:test';
import assert from 'node:assert/strict';
import {imageUrl} from '../src/images.mjs';
import {normalizeCulture,normalizeReservation} from '../src/catalog.mjs';
import {normalizeKopis} from '../src/kopis.mjs';
import {normalizeImport} from '../src/domain.mjs';
test('image URLs reject active content and credentials and upgrade mixed content',()=>{
 assert.equal(imageUrl('javascript:alert(1)'),'');assert.equal(imageUrl('https://user:secret@example.com/img.jpg'),'');
 assert.equal(imageUrl('http://example.com/a.jpg'),'https://example.com/a.jpg');
});
test('API images preserve source attribution and backup metadata',()=>{
 const rows=[normalizeCulture({TITLE:'전시',LAT:37.5,LOT:127,MAIN_IMG:'https://example.com/c.jpg',HMPG_ADDR:'https://example.com/c'},'2026-10-18'),normalizeReservation({SVCID:'r',SVCNM:'공원',X:127,Y:37.5,IMGURL:'https://example.com/r.jpg',SVCURL:'https://example.com/r'},'2026-10-18'),normalizeKopis({mt20id:'PF123',prfnm:'공연',poster:'http://www.kopis.or.kr/p.jpg'},{la:37.5,lo:127},'2026-10-18')];
 for(const p of rows){assert.ok(p.imageUrl.startsWith('https://'));assert.ok(p.imageSourceUrl);assert.ok(p.imageCredit);}
 assert.equal(normalizeImport({version:1,places:rows}).places[0].imageUrl,rows[0].imageUrl);
});
