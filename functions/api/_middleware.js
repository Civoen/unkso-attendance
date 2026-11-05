// Runs before every /api/* route. Requests must carry the site password in the
// X-Site-Password header. The password comes from the SITE_PASSWORD environment
// variable on Cloudflare Pages; if that isn't set it falls back to "boost".
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequest({ request, env, next }) {
  const expected = env.SITE_PASSWORD || 'boost';
  const given = request.headers.get('X-Site-Password') || '';
  if (!safeEqual(given, expected)) {
    return new Response(JSON.stringify({ error: 'Password required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return next();
}
