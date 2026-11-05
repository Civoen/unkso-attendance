// The middleware has already checked the password by the time this runs, so
// reaching it means the password was correct. The login screen uses it to verify.
export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
