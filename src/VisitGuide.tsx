import type {Place,VisitInfo} from './types';
export const visitFields:[keyof Omit<VisitInfo,'checkedAt'|'sources'>,string][]=[['admission','일반 관람료'],['students','학생 무료입장·대상'],['teachers','인솔교사 입장 조건'],['booking','단체 예약 절차'],['documents','당일 준비할 증빙'],['cautions','휴관·별도 요금·유의사항']];
export default function VisitGuide({place}:{place:Place}){
 const v=place.visitInfo;if(!v)return null;
 return <section className="visit-guide" aria-label="학교 단체 관람 안내"><span className="eyebrow">SCHOOL GROUP VISIT</span><h2>단체 관람과 무료입장 안내</h2><p className="visit-intro">일반 관람 · 해설 예약 · 특별 프로그램의 조건을 구분해 확인하세요.</p><dl>{visitFields.map(([key,label])=>v[key]&&<div key={key} className={'visit-'+key}><dt>{label}</dt><dd>{v[key]}</dd></div>)}</dl><small>공식 안내 확인일: {v.checkedAt||'미기록'} · 실제 방문일의 변경 공지도 확인하세요.</small><div className="button-row">{v.sources.map((s,i)=><a className="outline" key={i} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>)}</div></section>;
}
