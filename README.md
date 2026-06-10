# Sunday Soccer Manager MVP

A simple web app for managing Sunday pickup soccer games. The deployed version runs on a small Node server so players can log in and mark shared Sunday availability.

## Run locally

Option 1: open `index.html` directly in a browser.

Option 2: serve the folder locally:

```powershell
cd C:\Users\user\Documents\Codex\2026-06-09\build-me-a-simple-web-app\outputs\sunday-soccer-mvp
node server.js
```

Then open:

```text
http://localhost:4173
```

## Deploy

This folder includes `render.yaml` so it can be deployed as a Render Static Site from GitHub.

See `DEPLOY.md` for the GitHub and Render steps.

## Included

- Seed/sample players
- Add, edit, delete, activate, and deactivate players
- Player ratings from 1 to 100
- FIFA-style player attributes: speed, shooting, defending, and passing
- Weak Foot player attribute
- Overall rating can be set manually or from the attribute average
- Simple access modes:
  - Admin passcode: `sunday-admin`
  - Viewer passcode: `soccer-viewer`
- Admin data export/import tools for temporarily turning local edits into shared seed data
- Shared Sunday availability/RSVP board
- Player email/password logins created by admin
- Balanced team creation with goalkeeper separation
- 11v11 full-field team creation defaults
- Drag-and-drop team edits after teams are created
- Game day score sheet with goals, assists, saves, clean sheets, cards, notes, and rating adjustments
- Game history
- Player stats and rating history

## Next upgrade path

When you are ready to make this a true shared team app, the same screens can move to React or Next.js with API routes and Postgres on Render. The data objects in `app.js` are intentionally shaped like database records to make that migration straightforward.

Recommended next backend/auth milestone:

- Postgres database on Render
- Admin login for you
- Admin-only player edits, team creation, and score entry
- Read-only teammate views for rosters, history, and stats

No-cost deployment note: this version uses the free Render web service with file-based storage. It lets multiple people share data through the same link, but it is not as durable as paid Postgres. A Render redeploy/restart can reset server-side changes, so export important roster data before big updates.
