# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Dr.Lab** (`lab-beta`) — an Electron + React desktop app for medical lab management (patients, doctors, visits, tests, packages, PDF reports/barcodes, WhatsApp notifications). Local-first: SQLite (`better-sqlite3`) is the source of truth on each PC; a companion server repo (`dr.lab-apiV2`, sibling directory) provides auth/licensing/plan data and an optional multi-PC sync relay. There is no test suite or linter configured in this repo.

## Commands

```bash
npm start                # dev: parcel dev server (port 3001) + electron, concurrently
npm run rebuild           # recompile native modules (better-sqlite3) for the current machine/arch — run after npm install or a node/electron version change
npm run build-mac         # packager.js → darwin/arm64 app bundle in ./build (macOS only)
npm run build              # packager.js → win32/ia32 in ./build (must run on Windows/CI, not cross-compiled)
npm run package            # electron-builder → dmg/zip in ./out
npm run package:win        # electron-builder → nsis installer in ./out
```

No test or lint scripts exist — don't assume `npm test`/`npm run lint` work.

### Clean build (white screen, bloated app, or hanging build)

```bash
rm -rf .parcel-cache dist build out
npm run rebuild
npm run build-mac   # or npm run build / npm run package / npm run package:win
```

### Build gotchas (see [README.md](README.md) for full detail)

- `better-sqlite3` and `sharp` are native modules — each platform's package must be built **on that platform** (no cross-compiling Windows from Mac).
- `react-build` (the `prebuild`/`prebuild-mac` hook) must run as `parcel build`, not `parcel` — the latter starts a dev server that never exits and silently hangs packaging.
- Windows target is ia32; `packager.js` force-installs `@img/sharp-win32-ia32` when needed since a normal x64 Windows host won't pull it in automatically.
- Don't put `--ignore=^/build$`-style anchors in an npm script for Windows — `cmd.exe` strips the `^` and excludes real dependency folders (e.g. `electron-updater/out`). Ignore rules live as regexes inside `packager.js` instead.
- Native binaries are unpacked from the asar (`asar.unpack` in `packager.js`) — required for `dlopen` to load `.node`/`.dylib`/`.dll` files at runtime.

## Architecture

### Process split (Electron)

- **Main process** entry: [index.js](index.js) → requires [src/control/main.js](src/control/main.js), which owns the single `ipcMain.on("asynchronous-message", ...)` handler — a large `switch (query)` dispatching every DB read/write, PDF/print/barcode job, and sync action. There is no per-feature IPC channel; everything funnels through this one switch keyed by a `query` string.
- **Renderer process**: React app under [src/](src/), bundled by Parcel from [index.html](index.html)/[src/index.js](src/index.js).
- **Bridge**: [src/control/renderer.js](src/control/renderer.js) exposes `send(doc)` (promise-based, resolves on the matching `asynchronous-reply[-queryName]` channel) and `fireAndForget(doc)` (for replies that never come, e.g. `syncNow`) — nearly all data access from React goes through one of these instead of direct `ipcRenderer` calls. Screens/hooks call `send({ query: "...", ...})` and match the query name that main.js's switch handles.
- `nodeIntegration: true` / `contextIsolation: false` — the renderer can `window.require("electron")` directly (see the top of renderer.js/App.js); there's no preload/contextBridge layer.

### Data layer

- [src/control/db.js](src/control/db.js) — `LabDB` class wrapping `better-sqlite3`. A **new `LabDB` instance is constructed per IPC message** in main.js, so anything that must persist across calls (e.g. `syncEnabled`) is held at module level, not on `this`.
- Schema evolves via additive `checkAndAdd*` migration methods run from `initializeDatabase()` (e.g. `checkAndAddVisitNumberColumn`, `checkAndAddSyncColumns`) — never destructive/rewriting migrations. Follow this pattern for new columns.
- `SYNCED_TABLES` in db.js lists tables mirrored by multi-PC sync (`patients`, `doctors`, `visits`, `tests`, `packages`, `test_to_packages`, `visit_v2`, `visit_item_v2`). Note `visits`/`visit_v2`: `visit_v2`/`visit_item_v2` are what the current UI actually writes; `visits` is legacy, kept only for already-synced installs' history.
- `await labDB.ready` before touching `labDB.db` — the constructor kicks off async init but does not block on it.

### Multi-PC sync (optional, per-account feature)

Full design doc: [docs/MULTI_PC_SYNC.md](docs/MULTI_PC_SYNC.md). Key points:
- Gated by a per-account `syncEnabled` flag (default off) — when off, every code path behaves exactly as it did before sync existed (hard deletes, no network calls). Treat this flag as load-bearing for backward compatibility in any change touching db.js writes/deletes.
- [src/control/sync.js](src/control/sync.js) — `SyncEngine`: push/pull cycle against the server, LWW conflict resolution on `updatedAt`, soft deletes via `deletedAt` tombstones (only when sync is enabled), exponential backoff, self-disarms on `401`.
- The sync engine's HTTP calls are proxied through the renderer (`sync-fetch-request`/`sync-fetch-reply-*` IPC round-trip in renderer.js) so they're visible in DevTools Network — main-process `fetch` calls aren't.
- Server counterpart lives in the sibling `dr.lab-apiV2` repo (`routers/sync.js`, `middleware/deviceAuth.js`, `prisma/schema.prisma`'s `Device`/`User`/`Sync*` mirror tables).

### Auth / tenancy model (spans this repo and `dr.lab-apiV2`)

- `Client` (server-side Prisma model) = the lab/tenant: billing, plan, `syncEnabled`, `maxDevices`.
- `User` (server-side) = the actual login identity (phone/OTP/password/device), scoped to a `clientId`, with `role` (default `"owner"`) and `pin` fields present but not yet built out in the UI — the schema already anticipates multiple operators per lab. `homeClientId` lets a support-driven client reassignment be reverted independently of a self-service "Leave This Lab" flow.
- Desktop side: [src/hooks/usePlan.jsx](src/hooks/usePlan.jsx) fetches plan/sync state on login and route change; [src/helper/leaveLab.js](src/helper/leaveLab.js) + [src/screens/SettingScreen](src/screens/SettingScreen) implement self-service lab-leave (revokes the device server-side, then wipes local SQLite via `LabDB.requestDataWipe()`/`handlePendingWipe()` in db.js on next cold start — the open DB handle can't be deleted out from under itself, especially on Windows).

### PDF / print / barcode

[initPDF.js](initPDF.js) (report PDFs) and [src/control/pdf/](src/control/pdf/) (`createPDFForVisit.js`, `header.js`, `footer.js`, `watermark.js`, `templates/`) build visit/report PDFs with `pdfkit`/`jspdf`; `bwip-js` generates barcodes; `sharp`/`jimp`/`node-html-to-image` handle image work. All of this is invoked from main.js's IPC switch (`print`, `printReport`, `printParcode`, etc.), not from the renderer directly. Extensive structured logging (`[PRINT_INFO]`/`[PRINT_ERROR]`/`[PDF_INFO]`/`[PDF_ERROR]` via `electron-log`) exists specifically to debug production print issues — see [PRINT_LOGGING_README.md](PRINT_LOGGING_README.md) for log locations per OS and the log-viewer script usage. Preserve/extend this logging style when touching print/PDF code rather than reverting to bare `console.log`.

### Frontend structure

- [src/App.js](src/App.js) — top-level routing (`react-router-dom`) and Ant Design `ConfigProvider` (theme/RTL). Screens live in `src/screens/*Screen`, shared UI in `src/components/`.
- State: Zustand stores in [src/libs/appStore.js](src/libs/appStore.js) (login/user, print counts, WhatsApp counts, home-screen UI flags) plus feature-local stores in some hooks (e.g. `usePlan.jsx`).
- `src/components/ContainerV2` is the current layout shell actually rendered by the app (there's an older `Container` component — prefer `ContainerV2` for new UI hooks like status indicators).
- i18n via `i18next`/`react-i18next`; dictionaries in [src/dictionaries/](src/dictionaries/) (`ar.json`, `eng.json`, `ku.json`); RTL is driven off `i18n.language` in App.js.
- API base URL: single source of truth is [src/config/apiUrl.js](src/config/apiUrl.js) (`API_URL` env var, falls back to the dev server) — used both from renderer code (Parcel inlines `process.env.*` at build time) and from the main process (`index.js` loads `.env` via `dotenv` before anything else requires it).
