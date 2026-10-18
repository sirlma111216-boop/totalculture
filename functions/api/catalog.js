import {normalizeCulture,normalizeReservation} from '../../src/catalog.mjs';
export async function onRequestGet({request,env,waitUntil}){
 if(!env.SEOUL_API_KEY)return Response.json({configured:false,message:'서울시 인증키가 아직 연결되지 않았습니다. Cloudflare의 SEOUL_API_KEY 비밀값을 등록하고 재배포한 뒤 다시 시도해 주세요.',places:[]});
 const serviceName=new URL(request.url).searchParams.get('service')||'all';if(!['all','culture','reservation'].includes(serviceName))return Response.json({message:'잘못된 자료원입니다.'},{status:400});
 const cache=caches.default;const key=new Request(new URL('/api/catalog?v=4&service='+serviceName,request.url));const cached=await cache.match(key);if(cached&&new URL(request.url).searchParams.get('refresh')!=='1')return cached;
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});const services=[['culturalEventInfo',normalizeCulture],['tvYeyakCOllect',normalizeReservation]].filter(([name])=>serviceName==='all'||(serviceName==='culture'?name==='culturalEventInfo':name==='tvYeyakCOllect'));
 let places=[],failures=[],totals=0,read=0,partial=false;
 for(const [service,normalize] of services){try{let total=1;for(let start=1;start<=total&&start<=5000;start+=1000){const end=start+999;const endpoint=`http://openapi.seoul.go.kr:8088/${encodeURIComponent(env.SEOUL_API_KEY)}/json/${service}/${start}/${end}/`;const r=await fetch(endpoint,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('upstream');const d=await r.json();const body=d[service];if(!body?.row){if(d.RESULT?.CODE==='INFO-200'||body?.RESULT?.CODE==='INFO-200')break;throw new Error('data');}total=Number(body.list_total_count)||0;if(start===1)totals+=total;read+=body.row.length;places.push(...body.row.map(x=>normalize(x,today)).filter(Boolean));if(total>5000)partial=true;}}catch{failures.push(service);}}
 if(failures.length===services.length)return Response.json({message:'서울시 자료를 읽지 못했습니다. 인증키 승인·서비스 상태를 확인하세요.'},{status:502});
 const unique=[...new Map(places.map(p=>[p.id,p])).values()];
 const message=`공공자료 ${read.toLocaleString()}건 중 위치가 있는 유효기간 후보 ${unique.length.toLocaleString()}건을 가져왔습니다.${partial?' 자료가 많아 서비스별 최대 5,000건만 읽었습니다.':''}${failures.length?' 일부 자료원 연결에 실패했습니다.':''} 잔여석과 단체 수용은 기관 확인이 필요합니다.`;
 const res=Response.json({configured:true,places:unique,totalSourceRows:totals,readRows:read,partial:partial||!!failures.length,failedSources:failures,updatedAt:new Date().toISOString(),message},{headers:{'Cache-Control':'public, max-age=1800'}});if(!failures.length)waitUntil(cache.put(key,res.clone()));return res;
}

