const PROMPT = `This is a screenshot of a Discord channel (voice member list, chat log, or reaction list). Identify every distinct person's visible username or display name.

Rules:
1. Skip any entry that is a bot or system indicator rather than a person, such as one starting with "[RECORDING]".
2. Names are formatted as "RANK.Name" (a rank abbreviation, a period, then the actual name) — return only the part AFTER the period. For example "SGT.Vega" should be returned as "Vega", and "CPL.Ironsight" as "Ironsight". If an entry has no period, return it as-is.
3. Some names have a clan/team tag appended in the format "=TAG=", e.g. "Weezey=US=" — strip that off too, so it becomes "Weezey".

Respond with ONLY a JSON array of the resulting names, nothing else, no markdown fences. Example: ["Vega","Ironsight"]`;

// This model's schema wants the image as a raw array of byte values (0-255), not a
// base64 string or data URI, so the base64 the browser sends has to be decoded first.
function base64ToByteArray(base64OrDataUri) {
  const commaIdx = base64OrDataUri.indexOf(',');
  const raw = commaIdx > -1 ? base64OrDataUri.slice(commaIdx + 1) : base64OrDataUri;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return Array.from(bytes);
}

export async function onRequestPost({ request, env }) {
  if (!env.AI) {
    return new Response(JSON.stringify({
      error: 'Workers AI binding (AI) is not configured on this Pages project. See README.md.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!body.image) {
    return new Response(JSON.stringify({ error: 'Missing image' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const imageBytes = base64ToByteArray(body.image);
    // This model expects "prompt" (not "messages") when an image is attached.
    const result = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      prompt: PROMPT,
      image: imageBytes
    });
    let text = result.response ?? result.description ?? '';
    if (typeof text !== 'string') {
      // The model occasionally returns something structured instead of plain text —
      // stringify it so the client always gets a string to work with, and can still
      // attempt to pull a JSON array out of it.
      text = JSON.stringify(text);
    }
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Workers AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
