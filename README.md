# UNKSO Attendance — Cloudflare Pages setup

This site is static HTML plus two small Pages Functions (`/functions/api/members.js`
and `/functions/api/events.js`) that read and write a Cloudflare KV namespace. That
KV namespace is what makes the roster and attendance history shared: everyone who
visits the deployed URL sees and edits the same data.

## 1. Push this to GitHub

Commit `index.html`, the `functions/` folder, and this README to a repo, keeping
the folder structure exactly as-is — Cloudflare Pages auto-detects `/functions`.

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

## 5. Add your Anthropic API key

Screenshot reading (`/functions/api/read-screenshot.js`) calls Anthropic's API
on the server, using your own key — the browser never sees it.

1. Get a key from https://console.anthropic.com (Settings > API keys). This is
   a separate account/billing setup from a claude.ai subscription — API usage
   is billed per token, not covered by a Pro/Max plan.
2. In the Pages project: **Settings > Environment variables > Add variable**.
   - Variable name: `ANTHROPIC_API_KEY`
   - Value: your key
   - Type: **Secret** (encrypted, not visible again after saving)
   - Add it for both Production and Preview, then redeploy.

## 6. That's it

Once deployed, the site's `load()`/`persist()` calls hit `/api/members` and
`/api/events` automatically, backed by that KV namespace, and screenshot
reads go through `/api/read-screenshot`. No further config needed.

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
- **Screenshot reading calls Anthropic's API from a server-side function**,
  using the `ANTHROPIC_API_KEY` secret from step 5 — this costs a small amount
  per screenshot read (Claude API is pay-per-token). It's separate from the
  in-chat preview version, which only worked because Anthropic's own sandbox
  proxied that call for you; a deployed site has to bring its own key.
