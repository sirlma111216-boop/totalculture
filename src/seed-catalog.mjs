import heritage from '../data/heritage-museums.json' with {type:'json'};
import publicInstitutions from '../data/public-institutions.json' with {type:'json'};
import themeParks from '../data/theme-parks.json' with {type:'json'};
import {migrateParkCategories} from './parks.mjs';
import placeImages from '../data/place-images.json' with {type:'json'};
import privateMuseums from '../data/private-museums.json' with {type:'json'};
import learning from '../data/learning-spaces.json' with {type:'json'};
import universities from '../data/universities.json' with {type:'json'};
import cinemas from '../data/cinemas.json' with {type:'json'};
import research from '../data/research.json' with {type:'json'};
const mapping={art:'exhibition',science:'science',cinema:'performance',nature:'sports'};
const curatedPlaces=research.venues.map(v=>({...v,status:v.status,category:mapping[v.category]||v.category,email:v.email||'',description:v.notes,notes:'',tags:[v.category==='science'?'과학 교육':v.category==='cinema'?'영화 관람':'학교 밖 활동','단체 조건 확인'],coordinateNote:'개략 위치 · 출입구는 공식 안내 확인',sourceType:'curated',history:[]}));
for(const p of curatedPlaces){
 if(['history','craft','science','national-museum','cheonggye','citywall','life'].includes(p.id))p.tags.push('상설전시');
 if(['childrenpark','botanic'].includes(p.id))p.tags.push('공원','소풍','생태환경');
 if(p.id==='dreamart'){p.tags.push('공원 속 체험','북서울꿈의숲');p.relatedIds=['park-dream'];}
}
export const opportunities=research.opportunities.map(o=>({...o,description:o.summary,type:o.kind,validity:o.status}));

export const initialPlaces=migrateParkCategories([...curatedPlaces.filter(p=>!cinemas.places.some(c=>c.id===p.id)),...cinemas.places,...universities.places,...learning.places,...privateMuseums.places,...themeParks.places,...heritage.places,...publicInstitutions.places]).map((p)=>({...p,...placeImages[p.id]}));

