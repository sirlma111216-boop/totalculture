import universities from '../data/universities.json';
import cinemas from '../data/cinemas.json';
import research from '../data/research.json';
import type {Place,Category,Opportunity,Status} from './types';
const mapping:Record<string,Category>={art:'exhibition',science:'experience',cinema:'performance',nature:'sports'};
const curatedPlaces:Place[]=research.venues.map(v=>({...v,status:v.status as Status,category:mapping[v.category]||v.category as Category,email:v.email||'',description:v.notes,notes:'',tags:[v.category==='science'?'과학 교육':v.category==='cinema'?'영화 관람':'학교 밖 활동','단체 조건 확인'],coordinateNote:'개략 위치 · 출입구는 공식 안내 확인',sourceType:'curated',history:[]}));
export const opportunities:Opportunity[]=research.opportunities.map(o=>({...o,description:o.summary,type:o.kind,validity:o.status}));

export const initialPlaces:Place[]=[...curatedPlaces.filter(p=>!cinemas.places.some(c=>c.id===p.id)),...cinemas.places as Place[],...universities.places as Place[]];
