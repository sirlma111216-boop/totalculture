const list=v=>Array.isArray(v)?v:v?[v]:[];
const number=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
export function normalizeTransit(data){
 if(data?.error)throw Error('경로 제공자가 요청을 처리하지 못했습니다. 키의 Web 도메인 설정과 호출 한도를 확인해 주세요.');
 if(!Array.isArray(data?.result?.path))throw Error('이 구간의 대중교통 경로를 찾지 못했습니다. 가까운 거리이거나 지원 범위 밖일 수 있습니다.');
 return data.result.path.filter(p=>p.info&&Array.isArray(p.subPath)&&p.subPath.length&&p.subPath.every(s=>[1,2,3].includes(s.trafficType))).map(p=>{
  const steps=p.subPath.map(s=>({type:s.trafficType,minutes:number(s.sectionTime),distance:number(s.distance),from:s.startName||'',to:s.endName||'',direction:s.way||'',stops:number(s.stationCount),lines:list(s.lane).map(l=>String(l.name||l.busNo||'')).filter(Boolean),stations:list(s.passStopList?.stations).map(s=>s.stationName).filter(Boolean)}));
  return {minutes:number(p.info.totalTime),fare:number(p.info.payment),walk:number(p.info.totalWalk),transfers:Math.max(0,steps.filter(s=>s.type!==3).length-1),steps};
 }).sort((a,b)=>(a.minutes??Infinity)-(b.minutes??Infinity));
}
export function transitQuery(from,to){
 if(![from,to].every(p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180))throw Error('출발지와 도착지 위치를 지정해 주세요.');
 return new URLSearchParams({SX:String(from.lng),SY:String(from.lat),EX:String(to.lng),EY:String(to.lat),SearchPathType:'0'});
}
