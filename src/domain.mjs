export const categories = [
 { id:'performance', label:'공연·영화', short:'공연', color:'#c87559', symbol:'♪', art:0 },
 { id:'exhibition', label:'미술·전시', short:'전시', color:'#806caa', symbol:'◈', art:1 },
 { id:'museum', label:'박물관·역사', short:'박물관', color:'#bd923e', symbol:'▥', art:2 },
 { id:'sports', label:'체육·야외', short:'체육', color:'#568a6c', symbol:'◉', art:3 },
 { id:'experience', label:'교육·체험', short:'체험', color:'#4b91a1', symbol:'✦', art:4 },
 { id:'space', label:'공간·대관', short:'대관', color:'#727f91', symbol:'▦', art:5 }
];
export const statuses = {unknown:'확인 필요', inquiry:'문의 후 이용', phone:'전화로만 문의', available:'예약 가능 · 직접 확인', closed:'현재 휴관', ended:'접수 종료'};
export function distance(a,b){ const rad=Math.PI/180; const dlat=(b.lat-a.lat)*rad, dlng=(b.lng-a.lng)*rad; const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlng/2)**2; return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)); }
export function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
/** @param {any[]} places @param {{school:any,radius:number,query?:string,cats?:string[],status?:string,free?:boolean,date?:string,savedOnly?:boolean,saved?:string[]}} options */
export function filterPlaces(places,{school,radius,query='',cats=[],status='',free=false,date='',savedOnly=false,saved=[]}){
 return places.map(p=>({...p,distance:distance(school,p)})).filter(p=>p.distance<=radius && (!cats.length||cats.includes(p.category)) && (!query||`${p.name} ${p.address} ${p.description} ${p.tags?.join(' ')||''}`.toLowerCase().includes(query.toLowerCase())) && (!status||p.status===status) && (!free||p.price===0) && (!savedOnly||saved.includes(p.id)) && (!date||(!p.startDate||p.startDate<=date)&&(!p.endDate||p.endDate>=date))).sort((a,b)=>a.distance-b.distance);
}
export function validatePlace(p){ return !!p && typeof p.id==='string' && typeof p.name==='string' && p.name.trim().length>0 && categories.some(c=>c.id===p.category) && Number.isFinite(p.lat)&&p.lat>=33&&p.lat<=39&&Number.isFinite(p.lng)&&p.lng>=124&&p.lng<=132 && Object.hasOwn(statuses,p.status) && (p.price===null||(Number.isFinite(p.price)&&p.price>=0)); }
export function normalizeImport(data){
 if(data?.version!==1||!Array.isArray(data.places)||data.places.length>10000||!data.places.every(validatePlace))throw new Error('지원하지 않는 백업 또는 잘못된 시설 정보입니다.');
 const ids=new Set();for(const p of data.places){if(ids.has(p.id))throw new Error('중복된 시설 ID가 있습니다.');ids.add(p.id);}
 const clean=data.places.map(p=>({id:p.id.slice(0,100),name:p.name.slice(0,180),category:p.category,lat:p.lat,lng:p.lng,status:p.status,price:p.price,description:String(p.description||'').slice(0,5000),address:String(p.address||'').slice(0,300),phone:String(p.phone||'').slice(0,80),email:String(p.email||'').slice(0,150),sourceUrl:safeUrl(p.sourceUrl),bookingUrl:safeUrl(p.bookingUrl),verifiedAt:String(p.verifiedAt||''),statusCheckedAt:String(p.statusCheckedAt||''),statusEvidence:String(p.statusEvidence||'').slice(0,1000),tags:Array.isArray(p.tags)?p.tags.map(String).slice(0,20):[],notes:String(p.notes||'').slice(0,5000),coordinateNote:String(p.coordinateNote||''),startDate:String(p.startDate||''),endDate:String(p.endDate||''),sourceType:String(p.sourceType||'manual'),history:Array.isArray(p.history)?p.history.filter(h=>h&&typeof h.at==='string'&&typeof h.text==='string').slice(0,100):[]}));
 return {...data,places:clean,saved:Array.isArray(data.saved)?data.saved.filter(x=>typeof x==='string'):[],plan:Array.isArray(data.plan)?data.plan.filter(x=>typeof x==='string'):[]};
}
export function computeBudget(stops,people,transport,meal){ const known=stops.reduce((sum,p)=>sum+(p.price??0),0);return {total:known*people+transport+meal*people,perPerson:known+meal+(people?transport/people:0),unknown:stops.filter(p=>p.price===null).length}; }
/** Preserve personal edits; partial refreshes must not delete records from a failed/truncated source. */
export function mergeCatalog(existing,incoming,partial=false){const protectedIds=new Set(existing.filter(p=>p.sourceType!=='seoul'||p.history?.length).map(p=>p.id));const merged=new Map(existing.filter(p=>partial||protectedIds.has(p.id)).map(p=>[p.id,p]));for(const p of incoming){if(!protectedIds.has(p.id))merged.set(p.id,p);}return [...merged.values()];}
export const districts=['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'];
export function placeDistrict(p){return [p.district,...(p.tags||[]),...(String(p.address||'').split(/[\s,>]+/))].find(v=>districts.includes(v))||'';}
/** @param {any[]} places @param {any} options */
export function filterDirectory(places,options){const rows=filterPlaces(places,{...options,radius:Infinity});return rows.filter(p=>(!options.district||placeDistrict(p)===options.district)&&(!options.source||p.sourceType===options.source)).sort((a,b)=>options.sort==='distance'?a.distance-b.distance:options.sort==='updated'?String(b.verifiedAt||'').localeCompare(String(a.verifiedAt||''))||a.name.localeCompare(b.name,'ko'):a.name.localeCompare(b.name,'ko'));}
