import {useEffect} from 'react';
import {MapContainer,TileLayer,Marker,Popup,Circle,Polyline,useMap,useMapEvents} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import {categories} from './domain.mjs';
import type {Place,School} from './types';
function Controls({school,radius,picking,onPick,revision}:{school:School;radius:number;picking:boolean;onPick:(lat:number,lng:number)=>void;revision:number}){
 const map=useMap();
 useEffect(()=>{map.fitBounds(L.latLng(school.lat,school.lng).toBounds(radius*2000),{padding:[40,40],maxZoom:14});},[map,school.lat,school.lng,radius,revision]);
 useEffect(()=>{const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(map.getContainer());map.invalidateSize();return()=>observer.disconnect();},[map]);
 useMapEvents({click(e){if(picking)onPick(e.latlng.lat,e.latlng.lng);}});return null;
}
const schoolIcon=L.divIcon({className:'school-marker',html:'<span>⌂</span>',iconSize:[44,44],iconAnchor:[22,22]});
export default function MapView({places,school,radius,selected,onSelect,picking,onPick,revision=0,route=[]}:{places:Place[];school:School;radius:number;selected?:string;onSelect:(p:Place)=>void;picking:boolean;onPick:(lat:number,lng:number)=>void;revision?:number;route?:Place[]}){
return <MapContainer center={[school.lat,school.lng]} zoom={12} zoomControl={false} className={picking?'picking':''}>
 <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19}/>
 <Controls {...{school,radius,picking,onPick,revision}}/>
 <Circle center={[school.lat,school.lng]} radius={radius*1000} pathOptions={{color:'#456f57',weight:1.5,dashArray:'6 7',fillColor:'#92b16b',fillOpacity:.07}}/>
 <Marker position={[school.lat,school.lng]} icon={schoolIcon}><Popup><strong>{school.name}</strong><br/>검색 기준 위치</Popup></Marker>
 <ClusteredPlaces places={places} route={route} selected={selected} onSelect={onSelect}/>
 {route.length>0&&<Polyline positions={[[school.lat,school.lng],...route.map(p=>[p.lat,p.lng] as [number,number])]} pathOptions={{color:'#285d49',weight:3,dashArray:'8 7'}}/>}
 <Zoom/>
</MapContainer>;
}
function Zoom(){const map=useMap();return <div className="map-zoom"><button aria-label="지도 확대" onClick={e=>{e.stopPropagation();map.zoomIn();}}>+</button><button aria-label="지도 축소" onClick={e=>{e.stopPropagation();map.zoomOut();}}>−</button></div>;}
function ClusteredPlaces({places,route,selected,onSelect}:{places:Place[];route:Place[];selected?:string;onSelect:(p:Place)=>void}){const map=useMap();useEffect(()=>{const group=L.markerClusterGroup({maxClusterRadius:38,showCoverageOnHover:false,spiderfyOnMaxZoom:true,animate:false,iconCreateFunction:cluster=>L.divIcon({className:'atlas-cluster',html:`<span>${cluster.getChildCount()}</span>`,iconSize:[40,40]})});const markers=places.map(p=>{const c=categories.find(c=>c.id===p.category)!;const n=route.findIndex(x=>x.id===p.id);return L.marker([p.lat,p.lng],{title:p.name,icon:L.divIcon({className:`place-marker ${selected===p.id?'is-selected':''}`,html:`<span style="--pin:${c.color}">${n>=0?n+1:c.symbol}</span>`,iconSize:[36,42],iconAnchor:[18,38]})}).on('click',()=>onSelect(p));});group.addLayers(markers);map.addLayer(group);return()=>{map.removeLayer(group);};},[map,places,route,selected,onSelect]);return null;}
