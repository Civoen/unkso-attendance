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
  const value = await env.ATTENDANCE_KV.get('events:' + company);
  return new Response(value || '[]', {
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
    return new Response(JSON.stringify({ error: 'Expected an array of event records' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  await env.ATTENDANCE_KV.put('events:' + company, JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
