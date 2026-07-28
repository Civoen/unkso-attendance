const VALID_COMPANIES = new Set(['Bravo', 'Charlie', 'Delta']);

function companyFrom(request) {
  const url = new URL(request.url);
  const company = url.searchParams.get('company') || 'Bravo';
  return VALID_COMPANIES.has(company) ? company : 'Bravo';
}

export async function onRequestGet({ request, env }) {
  const company = companyFrom(request);
  const value = await env.ATTENDANCE_KV.get('members:' + company);
  // null means "nothing has ever been saved for this company" — distinct from an
  // explicitly-saved empty roster ("[]") — so the client can seed a default only once.
  return new Response(value === null ? 'null' : value, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
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
  await env.ATTENDANCE_KV.put('members:' + company, JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
