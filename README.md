# UNKSO Attendance Tracker

## How it works

This mirrors the "How It Works" popup inside the site itself (click the button
above the version number in the sidebar):

1. **Log in.** The site is password protected — enter the password once and this
   browser will remember it.

2. **Pick your company.** Use the company switcher at the top of the sidebar
   (Bravo, Charlie, or Delta). Each has its own roster and event history.

3. **Keep the Roster current.** Add or remove members on the Roster page
   (removals can be undone for a few seconds via the toast that appears).
   Drag the grip handle to reorder, or use the search box to find someone
   quickly. Click a name to see their full attendance history, or the pencil to
   rename someone (their history follows the new name; renaming to an
   existing member offers to merge the two). Removing a member never
   changes past events — they stay in the history marked "(left)". A member's bar
   turns orange if they've missed the last 3 events in a row. If someone is
   removed by mistake, use **Restore** to bring names back from Attendance
   History or an automatic backup.

4. **Log a new event.** On the New Event page, choose the event type and date (it starts as today),
   then drop in (or paste) a Discord screenshot of who attended. If the list
   doesn't fit in one screenshot, add as many as you need.

5. **Read & review.** Click "Read names from screenshot",  it'll match
   detected names against your roster. Names at 55%+ confidence are included
   automatically; 30–54% needs your review. Use "+ Add member" for anyone it
   missed entirely. Each name it read is boxed on the screenshot in the colour
   of its match (green 55%+, orange 30–54%); a red dashed box marks a name it
   couldn't match, so missed members stand out. Click a screenshot to enlarge it.

6. **Log it.** Once the matches look right, click "Log this event's attendance."

7. **Review history.** Events are always listed most-recent-first, and you
   can search by name or date. Expand any event to see who was Present,
   Absent, or Excused. Check the box next to an absent name to mark them
   Excused. To add someone to Present after the event was logged, click
   "Present" next to their name, or type any name into the "Add someone to
   Present" box at the top of the event (a name that isn't on the roster yet
   is added to it too). Edit an event at any time (including its date), or
   delete it (deletions can be undone for a few seconds via the toast that
   appears).

8. **Generate a report.** On Generate Report, set a From and To, tick which
   members and events to include, and add any Promotions or Awards. The date
   range and a Needs Attention list (anyone missing from the last 3 events)
   are worked out automatically. Then either copy the report as plain text,
   or use "Copy Image" to copy a site-styled image — trend chart and all —
   straight to your clipboard for pasting into Discord or elsewhere.

9. **Check the Statistics.** This page is read-only — it shows an attendance
   trend chart over time (a separate line per event type), overall and
   per-event-type average attendance, your most and least active member, and
   total excused instances, all computed automatically from Attendance History.

## That's it.

It's a simple, easy-to-use attendance tracker designed to cut down on admin times.

---
Deploying or redeploying this from scratch? See `SETUP.md` for the Cloudflare
Pages setup steps (KV namespace, Workers AI binding, etc.).

The site password is `boost` unless you set a `SITE_PASSWORD` environment
variable on the Pages project (Settings > Variables and Secrets) to change it.
