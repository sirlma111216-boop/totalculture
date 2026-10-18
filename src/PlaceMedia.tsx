import {cinemaMedia} from './cinema-media';
import {useState} from 'react';
import {categories,safeUrl} from './domain.mjs';
import {imageUrl} from './images.mjs';
import type {Place} from './types';
export default function PlaceMedia({place,detail=false}:{place:Place;detail?:boolean}){
 const [failed,setFailed]=useState<string[]>([]);
 const brand=place.cinema?.brand;const logo=brand?cinemaMedia[brand]:undefined;
 const photo=imageUrl(place.imageUrl);const useLogo=!!logo&&(!photo||failed.includes(photo));
 const url=useLogo?logo!.url:photo;const visible=!!url&&!failed.includes(url);
 const credit=useLogo?brand+' 공식 브랜드 로고 · 지점 사진 아님':place.imageCredit||'공식 제공 이미지';
 const source=useLogo?logo!.source:place.imageSourceUrl||place.sourceUrl;
 const category=categories.find(c=>c.id===place.category)||categories[0];
 return <figure className={`place-media ${detail?'detail-media':''} ${useLogo?'has-logo':visible?'has-photo':'has-illustration'}`}>
  <div className="media-frame">{visible?<img src={url} alt={`${place.name} · ${credit}`} loading={detail?'eager':'lazy'} decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(items=>[...items,url])}/>:logo?<div className="cinema-wordmark" role="img" aria-label={brand+' 영화관'}>{brand}</div>:<div className={`category-art art-${category.art}`} role="img" aria-label={`${category.label} 콘셉트 일러스트 · 실제 시설 사진 아님`}/>}</div>
  {detail&&<figcaption>{visible?<>{credit}{safeUrl(source)&&<> · <a href={safeUrl(source)} target="_blank" rel="noreferrer">이미지 출처 ↗</a></>}</>:<>{logo?'영화관 브랜드 표시 · 로고를 불러오지 못했습니다.':'분야별 콘셉트 일러스트 · 실제 시설 사진 아님'}{failed.includes(url)&&url?' · 제공 이미지를 불러오지 못했습니다.':''}</>}</figcaption>}
 </figure>;
}

