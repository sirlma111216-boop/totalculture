import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookingHome,phoneHref} from '../src/booking.mjs';

test('booking fallback strips detail paths and query values without changing the host',()=>{
 assert.equal(bookingHome({bookingUrl:'https://yeyak.seoul.go.kr/web/reservation/selectReservView.do?rsv_svc_id=example'}),'https://yeyak.seoul.go.kr/');
 assert.equal(bookingHome({bookingUrl:'javascript:alert(1)',sourceUrl:'https://example.org/visit'}),'https://example.org/');
 assert.equal(bookingHome({bookingUrl:'https://user:password@example.org/'}),'');
 assert.equal(bookingHome({}),'');
});
test('phone links never combine several phone numbers into an invalid dial string',()=>{
 assert.equal(phoneHref('02-1234-5678 / 02-9876-5432'),'tel:0212345678');
 assert.equal(phoneHref('(02) 6233-6729'),'tel:0262336729');
 assert.equal(phoneHref('1544-7744 (내선 2)'),'tel:15447744');
 assert.equal(phoneHref('문의 필요'),'');
});
