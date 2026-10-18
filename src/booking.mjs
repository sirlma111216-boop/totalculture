// Only build navigation links; never probe external reservation pages automatically.
export function bookingHome(place) {
 for (const value of [place.bookingUrl, place.sourceUrl]) {
  try {
   const url = new URL(value);
   if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
   return url.origin + '/';
  } catch { /* A source link may be absent. */ }
 }
 return '';
}

export function phoneHref(value = '') {
 // Keep separate numbers separate; do not concatenate a department or extension.
 const number = value.match(/(?:\+82[-\s]?(?:\(0\))?\d{1,2}|0\d{1,2})[-.\s)]*\d{3,4}[-.\s]*\d{4}|1[568]\d{2}[-.\s]*\d{4}/)?.[0];
 return number ? 'tel:' + number.replace(/[^+\d]/g, '') : '';
}
