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

## 5. That's it

Once deployed, the site's `load()`/`persist()` calls hit `/api/members` and
`/api/events` automatically, backed by that KV namespace. No further config
needed.

## Things worth knowing

- **No login, no permissions.** Anyone with the URL can view, add, or edit the
  roster and every event's attendance. There's nothing gatekeeping writes. If
  you want to lock that down later, Cloudflare Access (free for personal use)
  can sit in front of the whole site — see the Pages project's Settings >
  Access policies.
- **Last write wins.** If two people save changes to the same event at the same
  moment, whichever request reaches KV last overwrites the other. Fine for a
  small group editing occasionally; could lose an edit under heavy concurrent
  use.
- **Screenshot reading still calls Anthropic's API directly from the browser**,
  same as before — no server-side change needed for that part.
