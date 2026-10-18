import {readKopis,normalizeKopis,kopisWindow} from '../../src/kopis.mjs';
export async function onRequestGet({request,env,waitUntil}){
 if(!env.KOPIS_API_KEY)return Response.json({configured:false,message:'KOPIS 인증키가 배포에 연결되지 않았습니다. Production 비밀값 KOPIS_API_KEY 등록 후 재배포해 주세요.'});
 const params=new URL(request.url).searchParams;const page=Number(params.get('page')||1),window=Number(params.get('window')||0),genre=params.get('genre')||'AAAA';
 if(!Number.isInteger(page)||page<1||page>999||!Number.isInteger(window)||window<0||window>2||!['AAAA','GGGA'].includes(genre))return Response.json({message:'잘못된 조회 조건입니다.'},{status:400});
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'}),range=kopisWindow(today,window),origin=new URL(request.url).origin,cache=caches.default;
 const key=new Request(`${origin}/api/performances?v=3&day=${today}&window=${window}&genre=${genre}&page=${page}`);const hit=await cache.match(key);if(hit&&params.get('refresh')!=='1')return hit;
 async function load(path,query={}){const u=new URL('https://www.kopis.or.kr/openApi/restful/'+path);Object.entries({...query,service:env.KOPIS_API_KEY}).forEach(([k,v])=>u.searchParams.set(k,v));for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(u,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('KOPIS unavailable');return readKopis(await r.text());}catch(e){if(attempt===2)throw e;await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));}}}

 try{
 const rows=await load('pblprfr',{stdate:range.start.replaceAll('-',''),eddate:range.end.replaceAll('-',''),cpage:String(page),rows:'5',signgucode:'11',shcate:genre});
 const facilities=new Map();let failures=0,unmapped=0;const failureTypes={};const places=[];
 // Five records, sequential reads and bounded retries fit the free-plan subrequest budget.
 for(let i=0;i<rows.length;i+=1){await Promise.all(rows.slice(i,i+1).map(async row=>{try{
 if(!/^PF\d+$/.test(row.mt20id))throw Error('Invalid id');
 const [p]=await load('pblprfr/'+row.mt20id);if(!p||!/^FC\d+$/.test(p.mt10id))throw Error('No facility');
 if(!facilities.has(p.mt10id))facilities.set(p.mt10id,(async()=>{const fk=new Request(`${origin}/api/kopis-facility-cache/${p.mt10id}`);const old=await cache.match(fk);if(old)return old.json();const [f]=await load('prfplc/'+p.mt10id);if(!f)throw Error('No facility');waitUntil(cache.put(fk,Response.json(f,{headers:{'Cache-Control':'public, max-age=86400'}})));return f;})());
 const f=await facilities.get(p.mt10id),place=normalizeKopis(p,f,today);if(place)places.push(place);else unmapped++;
 }catch(e){failures++;const reason=['Invalid XML','KOPIS response error','KOPIS unavailable','No facility'].includes(e?.message)?e.message:'network or timeout';failureTypes[reason]=(failureTypes[reason]||0)+1;}}));}
 const result=Response.json({configured:true,places,range,page,genre,hasMore:rows.length===5,read:rows.length,failures,unmapped,failureTypes,partial:failures>0||unmapped>0,updatedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=3600'}});
 if(!failures)waitUntil(cache.put(key,result.clone()));return result;
 }catch(error){const reason=['Invalid XML','KOPIS response error','KOPIS unavailable'].includes(error?.message)?error.message:'upstream timeout or network';return Response.json({configured:true,reason,message:'KOPIS 조회에 실패했습니다. 인증키 승인 또는 서비스 상태를 확인해 주세요.'},{status:502});}
}

