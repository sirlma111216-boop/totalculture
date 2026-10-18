import {eshareRows,normalizeEshare} from '../../src/eshare.mjs';
export async function onRequestGet({request,env,waitUntil}){
 if(!env.ESHARE_API_KEY)return Response.json({configured:false,places:[],message:'공유누리 체육시설 인증키가 필요합니다. Production 비밀값 ESHARE_API_KEY 등록 후 재배포하세요. 현재는 추가 연동 전입니다.'});
 const page=Number(new URL(request.url).searchParams.get('page')||1);
 if(!Number.isInteger(page)||page<1||page>100)return Response.json({message:'잘못된 페이지입니다.'},{status:400});
 const cache=caches.default,key=new Request(new URL('/api/shared-facilities?v=1&page='+page,request.url));
 const cached=await cache.match(key);if(cached)return cached;
 try{
  const url=new URL('https://www.eshare.go.kr/eshare-openapi/rsrc/list/010500/'+encodeURIComponent(env.ESHARE_API_KEY));
  url.search=new URLSearchParams({pageNo:String(page),numOfRows:'100',ctpvCd:'11'}).toString();
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('upstream');
  const rows=eshareRows(await response.json());const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
  const places=rows.map(r=>normalizeEshare(r,today)).filter(Boolean);
  const res=Response.json({configured:true,places,hasMore:rows.length===100,partial:places.length!==rows.length,readRows:rows.length},{headers:{'Cache-Control':'public, max-age=3600'}});
  waitUntil(cache.put(key,res.clone()));return res;
 }catch{return Response.json({message:'공유누리 인증·서비스 응답을 확인해 주세요. 기존 자료는 유지합니다.'},{status:502});}
}
