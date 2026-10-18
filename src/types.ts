export type Category='performance'|'exhibition'|'museum'|'sports'|'experience'|'space';
export type Status='unknown'|'inquiry'|'phone'|'available'|'closed'|'ended';
export interface Place {id:string;name:string;category:Category;lat:number;lng:number;address:string;phone:string;email:string;description:string;price:number|null;status:Status;sourceUrl:string;bookingUrl:string;verifiedAt:string;statusCheckedAt?:string;statusEvidence?:string;tags:string[];notes:string;coordinateNote?:string;sourceType?:string;startDate?:string;endDate?:string;history?:{at:string;text:string}[];distance?:number;rawStatus?:string;}
export interface School {name:string;lat:number;lng:number;}
export interface Opportunity {id:string;title:string;description:string;sourceUrl:string;phone?:string;type?:string;validity?:string;verifiedAt?:string;}
