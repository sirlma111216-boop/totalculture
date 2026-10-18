export function transportLinks(school, place, returning = false) {
 const [from, to] = returning ? [place, school] : [school, place];
 const valid = p => p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat)<=90 && Math.abs(p.lng)<=180;
 if (!valid(from) || !valid(to)) return null;
 const point = p => `${p.lat},${p.lng}`;
 const named = p => `${encodeURIComponent(p.name)},${point(p)}`;
 const query = new URLSearchParams({api:'1',origin:point(from),destination:point(to),travelmode:'transit'});
 return {from:from.name,to:to.name,google:`https://www.google.com/maps/dir/?${query}`,kakao:`https://map.kakao.com/link/from/${named(from)}/to/${named(to)}`};
}
