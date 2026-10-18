import {useEffect,useState,useCallback} from 'react';
import {MapContainer,TileLayer,Marker,Popup,Circle,Polyline,useMap,useMapEvents} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import {categories,statuses} from './domain.mjs';
import type {Place,School} from './types';
function Controls({school,radius,picking,onPick,revision}:{school:School;radius:number;picking:boolean;onPick:(lat:number,lng:number)=>void;revision:number}){
 const map=useMap();
 useEffect(()=>{map.fitBounds(L.latLng(school.lat,school.lng).toBounds(radius*2000),{padding:[40,40],maxZoom:14});},[map,school.lat,school.lng,radius,revision]);
 useEffect(()=>{const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(map.getContainer());map.invalidateSize();return()=>observer.disconnect();},[map]);
 useMapEvents({click(e){if(picking)onPick(e.latlng.lat,e.latlng.lng);}});return null;
}
const EMPTY_ROUTE:Place[]=[];
const schoolIcon=L.divIcon({className:'school-marker',html:'<span>⌖</span>',iconSize:[44,44],iconAnchor:[22,22]});
export default function MapView({places,school,radius,selected,onSelect,picking,onPick,revision=0,route=EMPTY_ROUTE}:{places:Place[];school:School;radius:number;selected?:string;onSelect:(p:Place)=>void;picking:boolean;onPick:(lat:number,lng:number)=>void;revision?:number;route?:Place[]}){
 const [clusterPlaces,setClusterPlaces]=useState<Place[]|null>(null);const [query,setQuery]=useState('');
 useEffect(()=>{setClusterPlaces(null);setQuery('');},[places,picking]);
 const openCluster=useCallback((items:Place[])=>{setClusterPlaces(items);setQuery('');},[]);
 const rows=clusterPlaces?.filter(p=>`${p.name} ${p.tags.join(' ')} ${categories.find(c=>c.id===p.category)?.label}`.toLowerCase().includes(query.toLowerCase()))||[];
 return <><MapContainer center={[school.lat,school.lng]} zoom={12} zoomControl={false} className={picking?'picking':''}>
 <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19}/>
 <Controls {...{school,radius,picking,onPick,revision}}/>
 <Circle center={[school.lat,school.lng]} radius={radius*1000} pathOptions={{color:'#456f57',weight:1.5,dashArray:'6 7',fillColor:'#92b16b',fillOpacity:.07}}/>
 <Marker position={[school.lat,school.lng]} icon={schoolIcon}><Popup><strong>{school.name}</strong><br/>검색 기준 위치</Popup></Marker>
 <ClusteredPlaces places={places} route={route} selected={selected} onSelect={onSelect} onCluster={openCluster} picking={picking}/>
 {route.length>0&&<Polyline positions={[[school.lat,school.lng],...route.map(p=>[p.lat,p.lng] as [number,number])]} pathOptions={{color:'#285d49',weight:3,dashArray:'8 7'}}/>}
 <Zoom/>
 </MapContainer>{clusterPlaces&&<section className="cluster-list" aria-label="선택한 지도 묶음의 목록"><header><div><small>선택한 지도 묶음</small><h3>장소·프로그램 {clusterPlaces.length}건</h3></div><button aria-label="묶음 목록 닫기" onClick={()=>{setClusterPlaces(null);setQuery('');}}>×</button></header><input aria-label="묶음 안에서 검색" placeholder="이 목록에서 이름·분류 검색" value={query} onChange={e=>setQuery(e.target.value)}/><div className="cluster-list-scroll">{rows.map(p=><button className="cluster-list-item" key={p.id} onClick={()=>onSelect(p)}><span style={{color:categories.find(c=>c.id===p.category)?.color}}>{categories.find(c=>c.id===p.category)?.label} · {p.sourceType==='curated'?'시설·이용 안내':'행사·프로그램'}</span><strong>{p.name}</strong><small>{p.address}</small><small>{statuses[p.status]}　{p.price===0?'일반 관람 무료':p.price===null?'비용 확인 필요':p.price.toLocaleString()+'원'}</small></button>)}{rows.length===0&&<p>이 묶음에 일치하는 항목이 없습니다.</p>}</div></section>}</>;
}
function Zoom(){const map=useMap();return <div className="map-zoom"><button aria-label="지도 확대" onClick={e=>{e.stopPropagation();map.zoomIn();}}>+</button><button aria-label="지도 축소" onClick={e=>{e.stopPropagation();map.zoomOut();}}>−</button></div>;}
function ClusteredPlaces({places,route,selected,onSelect,onCluster,picking}:{places:Place[];route:Place[];selected?:string;onSelect:(p:Place)=>void;onCluster:(p:Place[])=>void;picking:boolean}){
 const map=useMap();useEffect(()=>{
 const group=L.markerClusterGroup({maxClusterRadius:38,showCoverageOnHover:false,spiderfyOnMaxZoom:false,zoomToBoundsOnClick:false,animate:false,iconCreateFunction:cluster=>L.divIcon({className:'atlas-cluster',html:`<span>${cluster.getChildCount()}</span>`,iconSize:[40,40]})});
 const byMarker=new Map<L.Marker,Place>();
 const markers=places.map(p=>{const c=categories.find(c=>c.id===p.category)!;const n=route.findIndex(x=>x.id===p.id);const marker=L.marker([p.lat,p.lng],{title:p.name,icon:L.divIcon({className:`place-marker ${selected===p.id?'is-selected':''}`,html:`<span style="--pin:${c.color}">${n>=0?n+1:c.symbol}</span>`,iconSize:[36,42],iconAnchor:[18,38]})}).on('click',()=>{if(!picking)onSelect(p);});byMarker.set(marker,p);return marker;});
 group.on('clusterclick',(event:L.LeafletEvent)=>{if(picking)return;const cluster=(event as L.LeafletEvent & {layer:L.MarkerCluster}).layer;onCluster(cluster.getAllChildMarkers().map((m:L.Marker)=>byMarker.get(m)!).filter(Boolean).sort((a:Place,b:Place)=>Number(b.sourceType==='curated')-Number(a.sourceType==='curated')||a.name.localeCompare(b.name,'ko')));});
 group.addLayers(markers);map.addLayer(group);return()=>{map.removeLayer(group);};},[map,places,route,selected,onSelect,onCluster,picking]);return null;
}
