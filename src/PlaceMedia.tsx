import {useState} from 'react';
import {categories,safeUrl} from './domain.mjs';
import {imageUrl} from './images.mjs';
import type {Place} from './types';
export default function PlaceMedia({place,detail=false}:{place:Place;detail?:boolean}){
 const [failed,setFailed]=useState('');
 const url=imageUrl(place.imageUrl);const visible=!!url&&failed!==url;
 const category=categories.find(c=>c.id===place.category)||categories[0];
 return <figure className={`place-media ${detail?'detail-media':''} ${visible?'has-photo':'has-illustration'}`}>
  <div className="media-frame">{visible?<img src={url} alt={`${place.name} · ${place.imageCredit||'공식 제공 이미지'}`} loading={detail?'eager':'lazy'} decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(url)}/>:<div className={`category-art art-${category.art}`} role="img" aria-label={`${category.label} 콘셉트 일러스트 · 실제 시설 사진 아님`}/>}</div>
  {detail&&<figcaption>{visible?<>{place.imageCredit||'공식 제공 이미지'}{safeUrl(place.imageSourceUrl||place.sourceUrl)&&<> · <a href={safeUrl(place.imageSourceUrl||place.sourceUrl)} target="_blank" rel="noreferrer">이미지 출처 ↗</a></>}</>:<>분야별 콘셉트 일러스트 · 실제 시설 사진 아님{failed===url&&url?' · 제공 이미지를 불러오지 못했습니다.':''}</>}</figcaption>}
 </figure>;
}
