# WhatsApp Bulk Electron (source) - UPDATED

This archive contains the source for the Electron-packaged WhatsApp Bulk app.

## What's new in this build
- Electron now sets `WHATSAPP_SESSION_DIR` to `app.getPath('userData')/sessions`, so session files persist in an OS-appropriate user data directory when packaged.
- Added a `/api/logs` endpoint (protected by auth) and frontend views for Contacts, Campaigns, and Logs.
- Expanded frontend to allow selecting contacts for campaigns and configuring retry settings.

## Build steps (on Windows recommended)
1. Install Node.js (20+), Git, and optionally PostgreSQL (or run via Docker).
2. Extract this repo.
3. Edit `.env.example` -> `.env` and set values.
4. `npm install` (root) and `cd frontend && npm install` for frontend deps.
5. `npm run build` to build frontend.
6. `npm run dist` to build Windows installer (run on Windows or via GitHub Actions).

## CI
A GitHub Actions workflow can build the installer on Windows; include it in `.github/workflows/` (not included in this zip).

## Warning
Automating WhatsApp with Puppeteer/whatsapp-web.js may violate WhatsApp Terms. Use for testing/personal only.
