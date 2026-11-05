const VALID_COMPANIES = new Set(['Bravo', 'Charlie', 'Delta']);

function companyFrom(request) {
  const url = new URL(request.url);
  const company = url.searchParams.get('company') || 'Bravo';
  return VALID_COMPANIES.has(company) ? company : 'Bravo';
}

function missingBindingResponse() {
  return new Response(JSON.stringify({
    error: 'KV binding (ATTENDANCE_KV) is not configured on this Pages project/environment. See README.md.'
  }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestGet({ request, env }) {
  if (!env.ATTENDANCE_KV) return missingBindingResponse();
  const company = companyFrom(request);
  const value = await env.ATTENDANCE_KV.get('members:' + company);
  // null means "nothing has ever been saved for this company" — distinct from an
  // explicitly-saved empty roster ("[]") — so the client can seed a default only once.
  return new Response(value === null ? 'null' : value, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.ATTENDANCE_KV) return missingBindingResponse();
  const company = companyFrom(request);
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!Array.isArray(body)) {
    return new Response(JSON.stringify({ error: 'Expected an array of member names' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Safety net: if this save removes anyone who was on the roster, keep a snapshot of the
  // roster as it was just before (30 days) so it can be restored from the Roster page.
  try {
    const prevRaw = await env.ATTENDANCE_KV.get('members:' + company);
    const prev = prevRaw ? JSON.parse(prevRaw) : [];
    if (Array.isArray(prev) && prev.length && prev.some(n => !body.includes(n))) {
      await env.ATTENDANCE_KV.put(
        'bak:members:' + company + ':' + new Date().toISOString(),
        JSON.stringify(prev),
        { expirationTtl: 60 * 60 * 24 * 30, metadata: { count: prev.length } }
      );
    }
  } catch (e) { /* a failed snapshot must never block the save */ }
  await env.ATTENDANCE_KV.put('members:' + company, JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
