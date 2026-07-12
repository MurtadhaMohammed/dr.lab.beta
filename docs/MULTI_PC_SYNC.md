# Multi-PC / Multi-Location Sync

Lets a lab account run Dr.Lab on more than one PC, including different physical
locations, with data kept in sync through the licensing server.

**Governing constraint:** backward compatibility. Every change is additive and
gated by a per-account `syncEnabled` flag (default `false`). Existing
single-PC offline users see zero behavior change. Local SQLite remains the
source of truth on every PC; the server is a relay, not the source of truth.

## How it works

1. Every write to `patients`, `doctors`, `visits`, `tests`, `packages`,
   `test_to_packages` stamps the row with a `uuid` and marks it `dirty = 1`.
2. A background `SyncEngine` (desktop, main process) periodically:
   - **pushes** dirty rows to the server, parent tables first (doctors →
     patients → tests → packages → test_to_packages → visits) so foreign
     keys always resolve on the other side,
   - **pulls** rows changed on the server since a per-table cursor, and
     applies them locally.
3. Conflicts are resolved by **last-write-wins** on `updatedAt` — both push
   and pull compare timestamps and the newer edit survives. Deletes are
   **soft deletes** (`deletedAt` tombstone) so they propagate instead of
   silently vanishing on other PCs.
4. Non-sync accounts never touch any of this: `syncEnabled = false` keeps
   deletes hard, keeps the local DB untouched beyond a one-time additive
   schema migration, and the SyncEngine never schedules a cycle.

```
PC A (Electron)                     Server (Express/Prisma/PG)              PC B
┌──────────────────┐   push/pull   ┌───────────────────────────┐   push/pull
│ React renderer    │  HTTPS JSON  │ /api/sync/push, /pull      │ ◄──────────►
│  ↕ IPC (main.js)  │ ◄──────────► │ clientAuth + deviceAuth    │
│ LabDB (SQLite)    │              │ Mirrored tables, scoped    │
│  + sync columns   │              │ by clientId, keyed by uuid │
│ SyncEngine        │              │ (relay, not source of truth)
└──────────────────┘              └───────────────────────────┘
```

## What changed, by file

### Desktop app (`dr.lab.beta`)

| File | Change |
|---|---|
| [`src/control/db.js`](../src/control/db.js) | `checkAndAddSyncColumns()` — additive migration (follows the existing `checkAndAdd*` pattern) adding `uuid`, `dirty`, `syncedAt`, `deletedAt` to every synced table, backfilling uuids on existing rows (marking them dirty = first sync becomes the initial upload), creating a one-time `drlab.pre-sync-backup.db` safety copy, and a `sync_state` cursor table. All `add*`/`update*` methods now call `markDirty()`; all `delete*` methods soft-delete **only when `syncEnabled` is true**; all reads filter `deletedAt IS NULL` (harmless no-op for non-sync accounts). |
| [`src/control/sync.js`](../src/control/sync.js) | New `SyncEngine` — push/pull cycle, integer-ID ↔ uuid FK translation, LWW conflict application, exponential backoff (1m → 15m cap), stops itself on `401` (revoked device / expired session), emits `sync-status` events to the renderer. |
| [`src/control/main.js`](../src/control/main.js) | New IPC cases: `setSyncConfig` (arm/disarm the engine with token + server URL) and `syncNow` (manual trigger). |
| [`src/control/renderer.js`](../src/control/renderer.js) | `fireAndForget()` for reply-less IPC calls, `onSyncStatus()` subscription (with cleanup) for the UI. |
| [`src/hooks/usePlan.jsx`](../src/hooks/usePlan.jsx) | Arms sync from the server's `syncEnabled` flag on every login/route change; re-syncs on network reconnect. |
| [`src/helper/signOut.js`](../src/helper/signOut.js) | Disarms sync locally on logout. |
| [`src/hooks/useSyncStatus.jsx`](../src/hooks/useSyncStatus.jsx), [`src/components/SyncStatus/index.jsx`](../src/components/SyncStatus/index.jsx) | UI: a small cloud icon (spinning while syncing, green check when clean, warning on error/revoked) wired into the sidebar in [`src/components/ContainerV2/index.jsx`](../src/components/ContainerV2/index.jsx) — the layout shell the app actually renders. Click it to force a sync cycle immediately. Renders nothing for non-sync accounts. |

### Server (`dr.lab-apiV2`)

| File | Change |
|---|---|
| [`prisma/schema.prisma`](../../dr.lab-apiV2/prisma/schema.prisma) | New `Device` (one row per PC, revocable), `User` (operator, minimal — role/pin reserved for future use), `Client.syncEnabled` / `maxDevices`. New mirror tables `SyncPatient`/`SyncDoctor`/`SyncVisit`/`SyncTest`/`SyncPackage`/`SyncTestToPackage`, each scoped `@@unique([clientId, uuid])`. Legacy `Client.device` column untouched. |
| [`prisma/migrations/20260702000001_add_device_user_sync/`](../../dr.lab-apiV2/prisma/migrations/20260702000001_add_device_user_sync/) | The additive migration. See [`prisma/MIGRATION_NOTES.md`](../../dr.lab-apiV2/prisma/MIGRATION_NOTES.md) for the one-time baseline procedure this repo needed (it had no prior migration history). |
| [`routers/app.js`](../../dr.lab-apiV2/routers/app.js) | `/verify-otp` registers/updates a `Device` row for sync-enabled accounts instead of the single-device lock; `/login`'s "already logged in elsewhere" check is skipped for sync-enabled accounts (device-count limit is enforced at `verify-otp` instead); `/logout` clears the session only — it does **not** revoke the device (revocation is a deliberate act, see below); new `GET /app/devices`, `POST /app/devices/:id/revoke`, `POST /app/devices/:id/rename`. |
| [`middleware/deviceAuth.js`](../../dr.lab-apiV2/middleware/deviceAuth.js) | Per-request device-revocation check for sync routes only — never applied to legacy endpoints, whose tokens don't carry a `deviceId`. |
| [`routers/sync.js`](../../dr.lab-apiV2/routers/sync.js) | `POST /api/sync/push`, `GET /api/sync/pull` — LWW upserts scoped by `(clientId from JWT, uuid)`, timestamp clamping against clock skew, field whitelisting, rate limiting. |
| [`helper/generateToken.js`](../../dr.lab-apiV2/helper/generateToken.js) | JWT gains an optional `deviceId` claim for sync-enabled logins; legacy payload shape unchanged. |
| [`index.js`](../../dr.lab-apiV2/index.js) | Mounts `/api/sync`, raises the JSON body limit to 2mb for sync batches. |

## Enabling sync for an account

```sql
UPDATE "Client" SET "syncEnabled" = true, "maxDevices" = 2 WHERE phone = '<phone>';
```

Then log out and back in on each PC (registers that machine as a `Device`).
The desktop app picks up `syncEnabled` from `/app/user/v2` on login/route
change and arms the `SyncEngine` automatically — no separate app setting.

## Operational notes

- **Revoking a device** (lost/stolen laptop, offboarding): `POST
  /app/devices/:id/revoke`. That device's next sync call gets `401`, the
  `SyncEngine` disarms itself, and the desktop app forces a re-login.
- **Deploying server changes**: this repo had no Prisma migration history
  before this feature — read [`prisma/MIGRATION_NOTES.md`](../../dr.lab-apiV2/prisma/MIGRATION_NOTES.md)
  before running `prisma migrate deploy` against prod. Always `pg_dump`
  first. After deploying code, the running process must be **restarted**
  (routes are loaded at boot) — deploying the migration alone does nothing
  for the live server.
- **Testing against a local server**: the desktop app's `apiUrl` for sync
  comes from `src/libs/api.js`'s exported `URL` (passed through by
  `usePlan.jsx`), so pointing that at `http://localhost:<port>/api` is
  enough — no separate config for sync specifically.
- **Simulating a fresh/second PC**: delete `drlab.db` (+ `-wal`/`-shm`) from
  the Electron `userData` directory and relaunch; the app rebuilds an empty
  schema and, once logged in with sync enabled, pulls everything down from
  the server. `drlab.pre-sync-backup.db` (written once, before the first
  sync migration ever ran on that machine) is left alone as a recovery
  point.

## Known v1 limitations

- `visits.tests` (JSON) is whole-row LWW — two PCs editing the same visit's
  tests concurrently will have one edit lose, not merge.
- A second PC that already has local, pre-existing data (rather than a fresh
  install) will union rather than de-duplicate matching patients; no
  fuzzy-merge tooling exists yet.
- Client clocks are untrusted but not authoritative — the server clamps
  incoming timestamps to `serverNow + 5min` and logs violations; it does not
  correct for sustained clock drift beyond that.
