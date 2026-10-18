// Intentionally public, domain-restricted Web key. Never use a Server API key here.
export function onRequestGet({env}) {
 return Response.json({webKey:env.ODSAY_WEB_API_KEY||null},{headers:{'Cache-Control':'no-store'}});
}
