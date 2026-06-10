# Deploy Sunday Soccer Manager

This MVP is ready to deploy as a free Render Web Service from GitHub.

## 1. Push to GitHub

If GitHub CLI is available:

```powershell
cd C:\Users\user\Documents\Codex\2026-06-09\build-me-a-simple-web-app\outputs\sunday-soccer-mvp
git init
git add .
git commit -m "Initial Sunday soccer manager MVP"
gh repo create sunday-soccer-manager --public --source . --remote origin --push
```

If using the GitHub website:

1. Create a new GitHub repo named `sunday-soccer-manager`.
2. Push this folder to the repo.

```powershell
cd C:\Users\user\Documents\Codex\2026-06-09\build-me-a-simple-web-app\outputs\sunday-soccer-mvp
git remote add origin https://github.com/YOUR_USERNAME/sunday-soccer-manager.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Render

Render can deploy from the included `render.yaml` blueprint.

1. Go to <https://dashboard.render.com/>.
2. Choose **New** > **Blueprint**.
3. Connect the GitHub repo.
4. Render should detect `render.yaml`.
5. Apply the blueprint.

The service will run `node server.js` and give you an `onrender.com` URL.

## Current MVP note

This no-cost version stores shared data in a JSON file on the free Render web service. That is useful for testing shared RSVP and player logins, but it is less durable than Postgres and can reset after redeploys or service restarts.

Before using it as the real team system, the next upgrade should add:

- Real database storage, likely Postgres on Render.
- Admin login.
- Admin-only create/edit team controls.
- Optional read-only teammate access.
