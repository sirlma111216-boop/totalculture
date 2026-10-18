import {useState} from 'react';
import {Route,ArrowUpRight,ArrowRight} from 'lucide-react';
import {transportLinks} from './transport.mjs';
import type {Place,School} from './types';

export default function TransportGuide({school,place}:{school:School;place:Place}){
 const [open,setOpen]=useState(false);
 const [returning,setReturning]=useState(false);
 const links=transportLinks(school,place,returning);
 return <section className="transport-guide">
  <button className="outline transport-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><Route size={18}/> 우리 학교에서 교통안내 <span>{open?'접기':'펼치기'}</span></button>
  {open&&<div className="transport-content"><h3>지하철·버스로 이동하기</h3>
   <div className="button-row"><button className={`chip ${!returning?'active':''}`} aria-pressed={!returning} onClick={()=>setReturning(false)}>학교에서 출발</button><button className={`chip ${returning?'active':''}`} aria-pressed={returning} onClick={()=>setReturning(true)}>학교로 돌아오기</button></div>
   {links?<><div className="transport-endpoints"><div><small>출발</small><strong>{links.from}</strong></div><ArrowRight size={19}/><div><small>도착</small><strong>{links.to}</strong></div></div>
    <div className="button-row"><a className="primary" href={links.google} target="_blank" rel="noreferrer">대중교통 경로 보기 · Google 지도 <ArrowUpRight size={16}/></a><a className="outline" href={links.kakao} target="_blank" rel="noreferrer">카카오맵 길찾기 <ArrowUpRight size={16}/></a></div>
    <p>지도 서비스에서 지하철 노선·버스 번호·환승·도보 구간과 예상 시간을 확인하세요. 카카오맵에서는 ‘대중교통’ 탭을 선택하세요.</p>
    <p className="micro">등록한 학교와 시설 좌표로 연결합니다. 학교가 바뀌면 경로도 바뀝니다. 길찾기 화면에서 실제 출입구와 출발 날짜·시간을 확인하고, 학생 단체의 집결·승하차 시간을 여유 있게 잡으세요.</p></>:<p>학교와 시설 위치를 먼저 지정해 주세요.</p>}
  </div>}
 </section>;
}
