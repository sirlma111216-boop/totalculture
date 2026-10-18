import {safeUrl} from './domain.mjs';
import {imageFields} from './images.mjs';
const clean=v=>String(v??'').replace(/<[^>]*>/g,' ').trim();
export function normalizeEshare(r,today){
 const lat=Number(r.lat),lng=Number(r.lot),id=clean(r.rsrcNo),name=clean(r.rsrcNm);
 if(!id||!name||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<33||lat>39||lng<124||lng>132)return null;
 return {...imageFields(r.imgFileUrlAddr,r.instUrlAddr,'공유누리 제공 시설 이미지'),id:'eshare-'+id,name,category:'sports',lat,lng,address:[clean(r.addr),clean(r.daddr)].filter(Boolean).join(' '),phone:'',email:'',sourceUrl:'https://www.eshare.go.kr/',bookingUrl:safeUrl(r.instUrlAddr),description:'공유누리 체육시설 목록에 등록된 자원입니다. 단체 이용 자격·요금·수용 인원·전화번호는 연결된 운영기관 예약 안내에서 확인하세요. 강좌나 잔여석을 실시간 조회한 정보가 아닙니다.',price:null,status:'inquiry',verifiedAt:today,tags:['공유누리','공공시설','체육시설'],notes:'',coordinateNote:'공유누리 원자료 제공 좌표',sourceType:'eshare',history:[]};
}
// Reject unexpected/error payloads; never interpret them as an empty successful sync.
export function eshareRows(data){
 if(data?.error||data?.errors?.length||data?.success===false)throw Error('공유누리 오류 응답');
 const candidates=[data,data?.data,data?.data?.list,data?.list,data?.resultList,data?.response?.body?.items?.item,data?.response?.body?.items];
 const rows=candidates.find(Array.isArray);
 if(!rows||rows.some(r=>!r||typeof r!=='object'||!('rsrcNo' in r)))throw Error('공유누리 응답 형식 확인이 필요합니다. 기존 자료를 유지합니다.');
 return rows;
}
