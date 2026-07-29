# UNKSO Attendance — Cloudflare Pages setup

This site is static HTML plus two small Pages Functions (`/functions/api/members.js`
and `/functions/api/events.js`) that read and write a Cloudflare KV namespace. That
KV namespace is what makes the roster and attendance history shared: everyone who
visits the deployed URL sees and edits the same data.

Headers and sub-headers use two local Gilroy font files (`fonts/Gilroy-ExtraBold.otf`
and `fonts/Gilroy-Light.otf`) referenced by relative path from `index.html` — make
sure the `fonts/` folder is committed and deployed alongside `index.html`, or those
elements will fall back to the browser's default font.

The favicon (`icons/`) works the same way — it's a set of local image files
referenced by relative path, so that folder needs to be committed too.

## How it works

This mirrors the "How It Works" popup inside the site itself (click the button
above the version number in the sidebar):

1. **Pick your company.** Use the company switcher at the top of the sidebar
   (Bravo, Charlie, or Delta). Each has its own roster and event history.
2. **Keep the Roster current.** Add or remove members on the Roster page. Drag
   the grip handle to reorder.
3. **Log a new event.** On the New Event page, choose the event type and date,
   then drop in (or paste) a Discord screenshot of who attended.
4. **Read & review.** Click "Read names from screenshot" — it'll match
   detected names against your roster. Names at 55%+ confidence are included
   automatically; 30–54% needs your review. Use "+ Add member" for anyone it
   missed entirely.
5. **Log it.** Once the matches look right, click "Log this event's attendance."
6. **Review history.** On Attendance History, expand any event to see who was
   Present, Absent, or Excused. Check the box next to an absent name to mark
   them Excused. Edit or delete an event, or drag to reorder, at any time.
7. **Generate a report.** On Generate Report, set a From and To, tick which
   members and events to include, and add any Promotions or Awards. Then
   either copy the report as plain text, or use "Copy Image" to copy a
   site-styled image straight to your clipboard for pasting into Discord or
   elsewhere.
8. **Check the Statistics.** This page is read-only — it shows overall and
   per-event-type average attendance, your most and least active member, and
   total excused instances, all computed automatically from Attendance History.

## 1. Push this to GitHub

Commit `index.html`, the `functions/` folder, the `fonts/` folder, the `icons/`
folder, and this README to a repo, keeping the folder structure exactly as-is —
Cloudflare Pages auto-detects `/functions`.

## 2. Create a KV namespace

In the Cloudflare dashboard: **Workers & Pages > KV**, create a namespace (e.g.
`unkso-attendance`). Note its name — you'll bind it in step 4.

## 3. Connect the repo to Cloudflare Pages

**Workers & Pages > Create > Pages > Connect to Git**, pick the repo. Build
settings: no build command needed, output directory is the repo root (`/`).

## 4. Bind the KV namespace

In your new Pages project: **Settings > Functions > KV namespace bindings > Add
binding**.
- Variable name: `ATTENDANCE_KV` (must match exactly — the functions reference
  `env.ATTENDANCE_KV`)
- KV namespace: the one you created in step 2

Add this binding for both the **Production** and **Preview** environments, then
redeploy (bindings only take effect on the next deploy).

## 5. Add the free Workers AI binding (for screenshot reading)

Screenshot reading (`/functions/api/read-screenshot.js`) uses **Cloudflare
Workers AI** — a vision model that runs on Cloudflare's own infrastructure.
This is free (10,000 "neurons" per day, no credit card) and needs no external
account or API key, unlike Anthropic's API.

1. In the Pages project: **Settings > Functions > AI bindings > Add binding**.
   - Variable name: `AI` (must match exactly — the function references `env.AI`)
   - Add it for both Production and Preview, then redeploy.
2. **One-time model license acceptance:** the first time this model is called,
   Cloudflare requires your account to explicitly agree to Meta's license by
   sending the model a one-off message. Easiest way — no terminal needed:
   - Cloudflare dashboard **> Workers & Pages > AI > Playground**
   - Select model `llama-3.2-11b-vision-instruct`
   - Send the message `agree`

   That registers your account's acceptance and unblocks all future calls.
   (Alternative via curl if you prefer:
   `curl https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run/@cf/meta/llama-3.2-11b-vision-instruct -X POST -H "Authorization: Bearer YOUR_API_TOKEN" -d '{ "prompt": "agree" }'`
   — account ID is on the dashboard sidebar, API token comes from
   My Profile > API Tokens with "Workers AI" edit permission.)

## 6. That's it

Once deployed, the site's `load()`/`persist()` calls hit `/api/members` and
`/api/events` automatically, backed by that KV namespace, and screenshot
reads go through `/api/read-screenshot` using Workers AI. No further config
needed, and no billing to set up.

## Things worth knowing

- **Three companies, three separate datasets.** Bravo, Charlie, and Delta each
  get their own roster and event history in KV (stored as `members:Bravo`,
  `events:Bravo`, `members:Charlie`, etc.). Switching company in the site's
  top-right dropdown just changes which of those three datasets you're
  reading/writing — nothing is shared across companies.
- **The company selector itself is local, not shared.** It's stored in each
  visitor's own browser (`localStorage`), so one person choosing Charlie has
  no effect on what company anyone else sees when they load the site.
- **No login, no permissions within a company.** Anyone with the URL who picks
  a given company can view, add, or edit that company's roster and every
  event's attendance. If you want to lock that down later, Cloudflare Access
  (free for personal use) can sit in front of the whole site — see the Pages
  project's Settings > Access policies.
- **Last write wins.** If two people save changes to the same event at the same
  moment, whichever request reaches KV last overwrites the other. Fine for a
  small group editing occasionally; could lose an edit under heavy concurrent
  use.
- **CSV export was removed** when the header's Export button was replaced with
  the company switcher. Let me know if you'd like it back somewhere else (e.g.
  a small button on the Attendance History page).
- **Screenshot reading is free**, running on Cloudflare Workers AI's daily
  neuron allowance rather than a paid API. 10,000 neurons/day resets every day
  at 00:00 UTC and comfortably covers casual, occasional screenshot reads for
  a small group. If you ever outgrow it, Workers AI's paid rate is far cheaper
  per call than Anthropic's API, so it's a good fallback rather than a wall.
- **Accuracy trade-off:** Llama 3.2 Vision is a solid, well-supported free
  model, but it's a smaller/lighter model than Claude's vision — expect it to
  need a bit more review in the 30–54% match section, especially on cluttered
  or low-contrast screenshots. If it's consistently underperforming on your
  screenshots, Workers AI also offers `@cf/meta/llama-3.2-90b-vision-instruct`
  (larger, more accurate, costs more neurons per call) as a drop-in swap in
  `read-screenshot.js`.
