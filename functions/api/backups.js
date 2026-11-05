// Lists / reads the automatic roster snapshots written by members.js.
const VALID_COMPANIES = new Set(['Bravo', 'Charlie', 'Delta']);

export async function onRequestGet({ request, env }) {
  if (!env.ATTENDANCE_KV) {
    return new Response(JSON.stringify({ error: 'KV binding (ATTENDANCE_KV) is not configured.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
  const url = new URL(request.url);
  const company = VALID_COMPANIES.has(url.searchParams.get('company')) ? url.searchParams.get('company') : 'Bravo';
  const prefix = 'bak:members:' + company + ':';
  const key = url.searchParams.get('key');

  if (key) {
    if (!key.startsWith(prefix)) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    const value = await env.ATTENDANCE_KV.get(key);
    return new Response(value || '[]', { headers: { 'Content-Type': 'application/json' } });
  }

  const listed = await env.ATTENDANCE_KV.list({ prefix, limit: 1000 });
  const items = listed.keys
    .map(k => ({
      key: k.name,
      when: k.name.slice(prefix.length),
      count: k.metadata && typeof k.metadata.count === 'number' ? k.metadata.count : null
    }))
    .sort((a, b) => (a.when < b.when ? 1 : -1));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}
