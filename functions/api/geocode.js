let lastRequest=0;
export async function onRequestGet({request,env,waitUntil}){
 const q=new URL(request.url).searchParams.get('q')?.trim();
 if(!q||q.length<2||q.length>160)return Response.json({message:'검색어는 2~160자로 입력하세요.'},{status:400});
 const cache= caches.default;const key=new Request(new URL('/api/geocode?q='+encodeURIComponent(q),request.url));const cached=await cache.match(key);if(cached)return cached;
 if(Date.now()-lastRequest<1200)return Response.json({message:'잠시 후 다시 검색하세요.'},{status:429});lastRequest=Date.now();
 try{
  // Explicit user searches only. No autocomplete or bulk geocoding.
  let results=[];
  if(env.KAKAO_REST_API_KEY){const url='https://dapi.kakao.com/v2/local/search/keyword.json?size=6&query='+encodeURIComponent(q);const r=await fetch(url,{headers:{Authorization:'KakaoAK '+env.KAKAO_REST_API_KEY},signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('provider');const d=await r.json();results=d.documents.map(p=>({name:p.place_name,address:p.road_address_name||p.address_name,lat:Number(p.y),lng:Number(p.x)}));}
  else {const url='https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=kr&limit=6&accept-language=ko&q='+encodeURIComponent(q);const r=await fetch(url,{headers:{'User-Agent':'SchoolOutsideAtlas/1.0 (https://github.com/sirlma111216-boop/totalculture)','Accept':'application/json'},signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('provider');const d=await r.json();results=d.map(p=>({name:p.name||p.display_name.split(',')[0],address:p.display_name,lat:Number(p.lat),lng:Number(p.lon)}));}
  const res=Response.json({results,provider:env.KAKAO_REST_API_KEY?'Kakao':'OpenStreetMap Nominatim'},{headers:{'Cache-Control':'public, max-age=86400'}});waitUntil(cache.put(key,res.clone()));return res;
 }catch{return Response.json({message:'위치 검색 제공자에 연결하지 못했습니다. 지도에 직접 위치를 지정해 주세요.'},{status:502});}
}
