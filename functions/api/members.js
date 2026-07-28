export async function onRequestGet({ env }) {
  const value = await env.ATTENDANCE_KV.get('members');
  return new Response(value || '[]', {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
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
  await env.ATTENDANCE_KV.put('members', JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
