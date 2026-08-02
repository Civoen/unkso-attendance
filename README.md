# UNKSO Attendance Tracker

## How it works

This mirrors the "How It Works" popup inside the site itself (click the button
above the version number in the sidebar):

1. **Pick your company.** Use the company switcher at the top of the sidebar
   (Bravo, Charlie, or Delta). Each has its own roster and event history.

2. **Keep the Roster current.** Add or remove members on the Roster page
   (removals can be undone for a few seconds via the toast that appears).
   Drag the grip handle to reorder, or use the search box to find someone
   quickly. Click a name to see their full attendance history. A member's bar
   turns orange if they've missed the last 3 events in a row.

3. **Log a new event.** On the New Event page, choose the event type and date,
   then drop in (or paste) a Discord screenshot of who attended.

4. **Read & review.** Click "Read names from screenshot",  it'll match
   detected names against your roster. Names at 55%+ confidence are included
   automatically; 30–54% needs your review. Use "+ Add member" for anyone it
   missed entirely.

5. **Log it.** Once the matches look right, click "Log this event's attendance."

6. **Review history.** Events are always listed most-recent-first, and you
   can search by name or date. Expand any event to see who was Present,
   Absent, or Excused. Check the box next to an absent name to mark them
   Excused. Edit or delete an event at any time (deletions can be undone for
   a few seconds via the toast that appears).

7. **Generate a report.** On Generate Report, set a From and To, tick which
   members and events to include, and add any Promotions or Awards. The date
   range and a Needs Attention list (anyone missing from the last 3 events)
   are worked out automatically. Then either copy the report as plain text,
   or use "Copy Image" to copy a site-styled image — attendance trend numbers
   and all — straight to your clipboard for pasting into Discord or elsewhere.

8. **Check the Statistics.** This page is read-only — it shows an attendance
   trend chart over time (a separate line per event type), overall and
   per-event-type average attendance, your most and least active member, and
   total excused instances, all computed automatically from Attendance History.

## That's it.

It's a simple, easy-to-use attendance tracker designed to cut down on admin times.

---
Deploying or redeploying this from scratch? See `SETUP.md` for the Cloudflare
Pages setup steps (KV namespace, Workers AI binding, etc.).
