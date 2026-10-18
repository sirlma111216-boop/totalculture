// Associations use named venues, never distance alone: a nearby venue is not inside a park.
export const parkNames = {
 'park-dream':['북서울꿈의숲','꿈의숲'], 'park-seoulforest':['서울숲'],
 'park-ttukseom':['뚝섬한강공원','뚝섬자벌레','한강플플'],
 'park-worldcup':['월드컵공원','하늘공원','평화의공원','난지천공원','노을공원'],
 'park-seonyudo':['선유도공원'], 'park-boramae':['보라매공원'],
 'park-yongsan':['용산가족공원'], 'park-westlake':['서서울호수공원'],
 'park-maeheon':['매헌시민의숲','양재시민의숲'], 'park-gildong':['길동생태공원'],
 'childrenpark':['서울어린이대공원','어린이대공원'], 'botanic':['서울식물원'],
 'eco-gangseo':['강서습지생태공원'], 'eco-nanji':['난지생태습지원','난지수변학습센터'],
 'eco-saetgang':['여의도샛강','샛강생태공원'], 'eco-amsa':['암사생태공원'],
 'eco-godeok':['고덕수변생태공원']
};
export const sportFacility = /체육|축구|풋살|테니스|야구|농구|배구|배드민턴|골프|운동장|수영장/;
export function parkRelated(park,places){
 const compact=s=>String(s||'').replace(/\s/g,'');
 const names=park.category==='park'?(parkNames[park.id]||[park.name]):[];
 return places.filter(p=>p.status!=='expired'&&p.id!==park.id&&(park.relatedIds?.includes(p.id)||p.relatedIds?.includes(park.id)||names.some(n=>compact(p.name+' '+p.address+' '+(p.performance?.venue||'')).includes(compact(n)))))
 .map(p=>({...p,relationKind:park.relatedIds?.includes(p.id)||p.relatedIds?.includes(park.id)?'직접 연결':'장소명 일치'}));
}
export function migrateParkCategories(places){return places.map(p=>{
 if(p.history?.length||p.sourceType==='manual')return p;
 if(Object.hasOwn(parkNames,p.id))return {...p,category:'park'};
 if(p.sourceType==='seoul'&&p.category==='sports'&&!sportFacility.test(p.name+' '+p.tags?.join(' '))&&/공원|소풍|숲길|생태탐방/.test(p.name))return {...p,category:'park'};
 return p;
});}
