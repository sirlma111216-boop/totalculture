import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {safeUrl} from './domain.mjs';
const parser=new XMLParser({parseTagValue:false,trimValues:true,processEntities:true});
export function readKopis(xml){
 if(/<!DOCTYPE|<!ENTITY/i.test(xml)||XMLValidator.validate(xml)!==true)throw Error('Invalid XML');
 const doc=parser.parse(xml);if(!Object.hasOwn(doc,'dbs'))throw Error('KOPIS response error');
 const rows=doc.dbs?.db;return !rows?[]:Array.isArray(rows)?rows:[rows];
}
const t=v=>typeof v==='string'?v.trim():'';
const day=v=>t(v).replaceAll('.','-');
export function kopisWindow(today,offset){const d=new Date(today+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset*30);const start=d.toISOString().slice(0,10);d.setUTCDate(d.getUTCDate()+29);return {start,end:d.toISOString().slice(0,10)};}
export function normalizeKopis(p,f,today){
 const lat=Number(f.la),lng=Number(f.lo);if(!t(p.mt20id)||!t(p.prfnm)||!Number.isFinite(lat)||lat<37||lat>38||!Number.isFinite(lng)||lng<126||lng>128)return null;
 const sourceUrl='https://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00020&mt20Id='+encodeURIComponent(p.mt20id);
 const rel=p.relates?.relate;const links=(Array.isArray(rel)?rel:rel?[rel]:[]).map(r=>({label:t(r.relatenm),url:safeUrl(r.relateurl)})).filter(r=>r.url);
 const description=[`공연장: ${t(p.fcltynm)||t(f.fcltynm)}`,t(p.prfage)&&`관람 연령: ${t(p.prfage)}`,t(p.prfruntime)&&`공연 시간: ${t(p.prfruntime)}`,t(p.dtguidance)&&`회차 안내: ${t(p.dtguidance)}`,t(p.pcseguidance)&&`공시 가격: ${t(p.pcseguidance)}`,'단체 할인·학생 할인·잔여석은 예매처 또는 주최 측 확인이 필요합니다.'].filter(Boolean).join('\n');
 return {id:'kopis-'+p.mt20id,name:t(p.prfnm),category:'performance',lat,lng,address:t(f.adres),phone:t(f.telno),email:'',description,price:null,status:day(p.prfpdto)<today?'ended':'inquiry',sourceUrl,bookingUrl:links[0]?.url||sourceUrl,verifiedAt:today,tags:[t(p.genrenm),'KOPIS',...(p.daehakro==='Y'?['대학로']:[]),...(p.child==='Y'?['아동공연']:[])],notes:'',coordinateNote:'KOPIS 공연시설 제공 좌표 · 같은 시설의 공연은 묶어서 표시',sourceType:'kopis',startDate:day(p.prfpdfrom),endDate:day(p.prfpdto),rawStatus:t(p.prfstate),history:[],performance:{venue:t(p.fcltynm)||t(f.fcltynm),age:t(p.prfage),runtime:t(p.prfruntime),schedule:t(p.dtguidance),priceText:t(p.pcseguidance),links}};
}
