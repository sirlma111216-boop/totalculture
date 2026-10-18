export function koreaToday(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function validDay(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function isExpired(p,day=koreaToday()){return validDay(p.endDate)&&p.endDate<day;}
export function lifecyclePlace(p,day=koreaToday()){
 if(isExpired(p,day))return {...p,status:'expired'};
 if(p.status==='closed'&&validDay(p.closureUntil)&&p.closureUntil<day)return {...p,status:'recheck'};
 return p;
}
