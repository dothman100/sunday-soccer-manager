# Sunday Soccer Manager MVP

A simple local web app for managing Sunday pickup soccer games. It runs as static files and stores data in your browser with `localStorage`, so there is no login, package install, or database setup yet.

## Run locally

Option 1: open `index.html` directly in a browser.

Option 2: serve the folder locally:

```powershell
cd C:\Users\user\Documents\Codex\2026-06-09\build-me-a-simple-web-app\outputs\sunday-soccer-mvp
python -m http.server 4173
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

Important: the current login is a front-end-only access gate for the static MVP. It is useful for testing admin/viewer workflows, but real security requires the planned backend database and server-side authentication.
