import {universityMedia} from './university-media';
import {cinemaMedia} from './cinema-media';
import institutionMedia from './institution-media.json';
import {useState} from 'react';
import {categories,safeUrl} from './domain.mjs';
import {imageUrl} from './images.mjs';
import type {Place} from './types';
export default function PlaceMedia({place,detail=false}:{place:Place;detail?:boolean}){
 const [failed,setFailed]=useState<string[]>([]);
 const university=place.id.startsWith('univ-')?universityMedia[place.id.split('-')[1]]:undefined;
 let institution:{name:string;url:string;source:string}|undefined;
 const marks=institutionMedia as Record<string,{name:string;url:string;source:string}>;
 try{institution=marks[place.id]||marks[new URL(place.sourceUrl).hostname];}catch{/* An absent source must not imply an official logo. */}
 const brand=place.cinema?.brand||university?.name||institution?.name;const logo=university||(place.cinema?.brand?cinemaMedia[place.cinema.brand]:undefined)||institution;
 const photo=imageUrl(place.imageUrl);const useLogo=!!logo&&(!photo||failed.includes(photo));
 const url=useLogo?logo!.url:photo;const visible=!!url&&!failed.includes(url);
 const credit=useLogo?brand+' 공식 로고 · 기관/운영기관 표시':place.imageCredit||'공식 제공 이미지';
 const source=useLogo?logo!.source:place.imageSourceUrl||place.sourceUrl;
 const category=categories.find(c=>c.id===place.category)||categories[0];
 return <figure className={`place-media ${detail?'detail-media':''} ${visible?(useLogo?'has-logo':'has-photo'):'has-name'}`}>
  <div className="media-frame" style={visible&&useLogo&&['서울대학교','이화여자대학교','서강대학교','서울공예박물관','리움미술관','호암미술관'].includes(brand||'')?{background:'#253f4a'}:undefined}>{visible?<img src={url} alt={`${place.name} · ${credit}`} loading={detail?'eager':'lazy'} decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(items=>[...items,url])}/>:<div className="institution-name-card"><span>{category.label}</span><strong>{place.name}</strong><small>공식 이미지 확인 중</small></div>}</div>
  {detail&&<figcaption>{visible?<>{credit}{safeUrl(source)&&<> · <a href={safeUrl(source)} target="_blank" rel="noreferrer">이미지 출처 ↗</a></>}</>:<>기관명 안내 카드 · 실제 사진이나 공식 로고가 아닙니다.{url?' · 제공 이미지를 불러오지 못했습니다.':''}</>}</figcaption>}
 </figure>;
}


