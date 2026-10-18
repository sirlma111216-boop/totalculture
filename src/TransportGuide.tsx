import {useState,useEffect} from 'react';
import {Route,ArrowUpRight,ArrowRight} from 'lucide-react';
import {transportLinks} from './transport.mjs';
import {normalizeTransit,transitQuery} from './transit.mjs';
import type {Place,School} from './types';
type TransitRoute=ReturnType<typeof normalizeTransit>[number];
export default function TransportGuide({school,place}:{school:School;place:Place}){
 const [open,setOpen]=useState(false),[returning,setReturning]=useState(false);
 const [routes,setRoutes]=useState<TransitRoute[]>([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
 const links=transportLinks(school,place,returning);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();let active=true;
  setRoutes([]);setBusy(true);setMessage('');
  (async()=>{try{
   const config=await fetch('/api/transit-config',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('교통 설정을 불러오지 못했습니다.');return r.json();});
   if(!active)return;
   if(!config.webKey){setMessage('앱 내 교통안내 연결 준비 중입니다. 운영자가 ODsay Web 키를 등록하면 실제 경로가 표시됩니다.');return;}
   const query=transitQuery(returning?place:school,returning?school:place);query.set('apiKey',config.webKey);
   const r=await fetch('https://api.odsay.com/v1/api/searchPubTransPathT?'+query,{signal:controller.signal});
   if(!r.ok)throw Error('교통 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
   const result=normalizeTransit(await r.json());
   if(active){setRoutes(result);if(!result.length)setMessage('지원되는 시내 대중교통 경로가 없습니다. 외부 지도에서도 확인해 주세요.');}
  }catch(e){if(active)setMessage(e instanceof Error?e.message:'교통 연결 실패');}finally{if(active)setBusy(false);}})();
  const timeout=setTimeout(()=>controller.abort(),20000);
  return()=>{active=false;clearTimeout(timeout);controller.abort();};
 },[open,returning,school.lat,school.lng,place.lat,place.lng,retry]);
 return <section className="transport-guide">
  <button className="outline transport-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><Route size={18}/> 기준 위치에서 교통안내 <span>{open?'접기':'펼치기'}</span></button>
  {open&&<div className="transport-content"><h3>지하철·버스 교통안내</h3>
   <div className="button-row"><button className={`chip ${!returning?'active':''}`} aria-pressed={!returning} onClick={()=>setReturning(false)}>기준 위치에서 출발</button><button className={`chip ${returning?'active':''}`} aria-pressed={returning} onClick={()=>setReturning(true)}>기준 위치로 돌아오기</button></div>
   {links?<><div className="transport-endpoints"><div><small>출발</small><strong>{links.from}</strong></div><ArrowRight size={19}/><div><small>도착</small><strong>{links.to}</strong></div></div>
    <div role="status">{busy?'대중교통 경로를 찾고 있습니다…':message}</div>
    {!busy&&message&&<button className="outline" onClick={()=>setRetry(n=>n+1)}>다시 불러오기</button>}
    <div className="transit-routes">{routes.map((r,index)=><details className="transit-route" key={index} open={index===0}>
     <summary><strong>경로 {index+1} · {r.minutes??'—'}분</strong><span>환승 {r.transfers}회 · 도보 {r.walk??'—'}m</span></summary>
     <ol className="transit-timeline">{r.steps.map((s:{type:number;minutes:number|null;distance:number|null;from:string;to:string;direction:string;stops:number|null;lines:string[];stations:string[]},i:number)=><li key={i} className={'transit-step mode-'+s.type}>
      <strong>{s.type===3?'도보':(s.type===1?'지하철 ':'버스 ')+s.lines.join(' / ')}</strong><span className="transit-time">{s.minutes??'—'}분</span>
      {s.type===3?<p>{s.distance??'—'}m 이동</p>:<><p><b>{s.from}</b> 승차 → <b>{s.to}</b> 하차</p><p>{s.direction&&s.direction+' 방면 · '}{s.stops??'—'}개 정거장</p>{s.stations.length>0&&<details><summary>지나는 역·정류장 보기</summary><p>{s.stations.join(' → ')}</p></details>}</>}
     </li>)}</ol>
     {r.fare!==null&&<p className="micro">일반 기준 예상 요금 {r.fare.toLocaleString('ko-KR')}원 · 학생·단체 요금은 별도 확인</p>}
    </details>)}</div>
    {routes.length>0&&<p className="micro">경로 정보: ODsay · 위 그림은 이동 순서도입니다. 소요시간은 예상치이며 실시간 도착정보나 특정 날짜의 운행을 보장하지 않습니다. 학생 집결·승하차 시간을 추가로 확보하세요.</p>}
    <div className="button-row"><a className="outline" href={links.google} target="_blank" rel="noreferrer">Google 지도에서도 확인 <ArrowUpRight size={16}/></a><a className="outline" href={links.kakao} target="_blank" rel="noreferrer">카카오맵 <ArrowUpRight size={16}/></a></div>
   </>:<p>기준 위치와 시설 위치를 먼저 지정해 주세요.</p>}
  </div>}
 </section>;
}
