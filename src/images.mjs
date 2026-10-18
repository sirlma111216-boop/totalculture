import {safeUrl} from './domain.mjs';
export function imageUrl(value){const url=safeUrl(value);if(!url)return '';const u=new URL(url);if(u.username||u.password)return '';if(u.protocol==='http:')u.protocol='https:';return u.href;}
export function imageFields(url,source,credit){return {imageUrl:imageUrl(url),imageSourceUrl:safeUrl(source),imageCredit:String(credit||'').slice(0,200)};}
