const { ipcMain } = require("electron");
const { LabDB, setGlobalSyncEnabled } = require("./db");
const log = require("electron-log");
const { API_URL } = require("../config/apiUrl");

// Parent-first order so pulled/pushed children always find their parents.
const TABLES = [
  { name: "doctors", fields: ["name", "gender", "email", "phone", "address", "type"] },
  { name: "patients", fields: ["name", "gender", "email", "phone", "birth"] },
  {
    name: "tests",
    fields: ["name", "price", "type", "groupTest", "normal", "options", "isSelecte"],
  },
  { name: "packages", fields: ["title", "customePrice"] },
  {
    name: "test_to_packages",
    fields: [],
    fks: { packageUuid: ["packages", "packageID"], testUuid: ["tests", "testID"] },
  },
  {
    name: "visits",
    fields: ["visitNumber", "status", "testType", "tests", "discount"],
    fks: { patientUuid: ["patients", "patientID"], doctorUuid: ["doctors", "doctorID"] },
  },
];

const BATCH = 500;
const BASE_INTERVAL_MS = 60 * 1000;
const MAX_BACKOFF_MS = 15 * 60 * 1000;
const KICK_DELAY_MS = 800; // debounce bursts of writes (e.g. add patient + first visit) into one cycle

// SQLite CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" in UTC.
function sqliteToIso(ts) {
  if (!ts) return null;
  if (ts.includes("T")) return new Date(ts).toISOString();
  return new Date(ts.replace(" ", "T") + "Z").toISOString();
}

function isoToSqlite(iso) {
  if (!iso) return null;
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19);
}

class SyncEngine {
  constructor() {
    this.labDB = null;
    this.enabled = false;
    this.token = null;
    this.apiUrl = API_URL;
    this.timer = null;
    this.running = false;
    this.failures = 0;
    this.pendingKick = false; // a write landed while a cycle was already running
    this.progress = null; // { done, total } for the push phase of the current cycle
    this.webContents = null; // for sync-status events to the renderer
    this.lastStatus = { state: "disabled", pending: 0 };
  }

  ensureDb() {
    if (!this.labDB) this.labDB = new LabDB();
    return this.labDB.db;
  }

  configure({ enabled, token, apiUrl }, webContents) {
    const nextEnabled = !!enabled && !!token;
    // Callers re-arm sync on things like every screen navigation, not just
    // real config changes. Rearming resets this.timer, so if nothing
    // actually changed, skip it — otherwise frequent redundant calls keep
    // the schedule perpetually restarted and a cycle never gets to run.
    const unchanged =
      this.webContents === (webContents || this.webContents) &&
      nextEnabled === this.enabled &&
      token === this.token &&
      (!apiUrl || apiUrl === this.apiUrl);
    if (webContents) this.webContents = webContents;
    if (unchanged) return;

    this.enabled = nextEnabled;
    this.token = token || null;
    if (apiUrl) this.apiUrl = apiUrl;
    setGlobalSyncEnabled(this.enabled);

    clearTimeout(this.timer);
    this.timer = null;
    if (this.enabled) {
      this.schedule(2000); // first cycle shortly after arming
    } else {
      this.emitStatus({ state: "disabled" });
    }
    log.info(`[SYNC] configured, enabled=${this.enabled}`);
  }

  schedule(delayMs) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.syncNow().catch((e) => log.error("[SYNC] cycle error:", e.message));
    }, delayMs);
  }

  // Called after any local write (see db.js markDirty/softDelete). Collapses
  // the wait for the next cycle down to KICK_DELAY_MS instead of the full
  // 60s idle interval, so an online user's edit reaches the server almost
  // immediately. Bursts of writes coalesce into a single cycle because each
  // call just resets the same timer.
  kick() {
    if (!this.enabled) return;
    if (this.running) {
      // A cycle already grabbed its snapshot of dirty rows before this write
      // landed, so it won't include it. Flag a fast follow-up instead of
      // falling back to the 60s interval once this cycle finishes.
      this.pendingKick = true;
      return;
    }
    this.schedule(KICK_DELAY_MS);
  }

  emitStatus(status) {
    const full = {
      ...status,
      pending: this.enabled ? this.countDirty() : 0,
      at: new Date().toISOString(),
    };
    this.lastStatus = full;
    try {
      if (this.webContents && !this.webContents.isDestroyed()) {
        this.webContents.send("sync-status", full);
      }
    } catch (_) {}
  }

  // Snapshot for windows/components that mount after the last emitStatus
  // call (e.g. a settings screen opened well after the last sync tick) and
  // would otherwise never learn the current state since emitStatus only
  // pushes to whatever webContents was registered at the time.
  getStatus() {
    return this.lastStatus || { state: "disabled", pending: 0 };
  }

  countDirty() {
    try {
      const db = this.ensureDb();
      if (!db) return 0;
      let total = 0;
      for (const t of TABLES) {
        total += db.prepare(`SELECT COUNT(*) c FROM ${t.name} WHERE dirty = 1`).get().c;
      }
      return total;
    } catch (_) {
      return 0;
    }
  }

  // Delegates the actual HTTP request to the renderer (see
  // control/renderer.js's "sync-fetch-request" listener) so it shows up in
  // that window's DevTools Network tab like any other API call — a fetch()
  // made here in the main process would be invisible there.
  rendererFetch(url, options) {
    return new Promise((resolve, reject) => {
      if (!this.webContents || this.webContents.isDestroyed()) {
        reject(new Error("No renderer window available to perform sync request"));
        return;
      }
      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const replyChannel = `sync-fetch-reply-${requestId}`;
      const timeout = setTimeout(() => {
        ipcMain.removeAllListeners(replyChannel);
        reject(new Error("sync fetch timed out"));
      }, 30000);
      ipcMain.once(replyChannel, (_event, result) => {
        clearTimeout(timeout);
        if (result.error) reject(new Error(result.error));
        else resolve(result);
      });
      this.webContents.send("sync-fetch-request", { requestId, url, options });
    });
  }

  async api(pathname, options = {}) {
    const url = `${this.apiUrl}${pathname}`;
    const result = await this.rendererFetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...(options.headers || {}),
      },
    });
    let body;
    try {
      body = JSON.parse(result.body || "{}");
    } catch (_) {
      body = {};
    }
    if (result.status === 401) {
      // Device revoked or token invalid — stop syncing, tell the renderer.
      this.configure({ enabled: false });
      this.emitStatus({ state: "unauthorized", error: body.error });
      throw new Error(`sync unauthorized: ${body.error || result.status}`);
    }
    if (!result.ok)
      throw new Error(`sync ${pathname} failed: ${result.status} ${body.error || ""}`);
    return body;
  }

  async syncNow() {
    if (!this.enabled || this.running) return;
    const db = this.ensureDb();
    if (!db) {
      log.error("[SYNC] database not ready yet, retrying in 5s");
      this.schedule(5000);
      return;
    }

    this.running = true;
    this.pendingKick = false;
    const pushTotal = this.countDirty();
    this.progress = pushTotal > 0 ? { done: 0, total: pushTotal } : null;
    this.emitStatus({ state: "syncing", progress: this.progress });
    try {
      for (const table of TABLES) await this.pushTable(db, table, pushTotal);
      this.progress = null;
      for (const table of TABLES) await this.pullTable(db, table);
      this.failures = 0;
      this.emitStatus({ state: "idle", progress: null });
      // A write landed mid-cycle and was missed by this cycle's snapshot —
      // catch up quickly instead of waiting out the full idle interval.
      this.schedule(this.pendingKick ? KICK_DELAY_MS : BASE_INTERVAL_MS);
    } catch (error) {
      this.progress = null;
      this.failures += 1;
      const backoff = Math.min(BASE_INTERVAL_MS * 2 ** this.failures, MAX_BACKOFF_MS);
      log.error(`[SYNC] failed (attempt ${this.failures}), retry in ${backoff / 1000}s:`, error.message);
      this.emitStatus({ state: "error", error: error.message, progress: null });
      if (this.enabled) this.schedule(backoff);
    } finally {
      this.running = false;
    }
  }

  uuidFor(db, table, localId) {
    if (localId == null) return null;
    return db.prepare(`SELECT uuid FROM ${table} WHERE id = ?`).get(localId)?.uuid ?? null;
  }

  localIdFor(db, table, uuid) {
    if (!uuid) return null;
    return db.prepare(`SELECT id FROM ${table} WHERE uuid = ?`).get(uuid)?.id ?? null;
  }

  async pushTable(db, table, pushTotal = 0) {
    for (;;) {
      const rows = db
        .prepare(
          `SELECT * FROM ${table.name} WHERE dirty = 1 AND uuid IS NOT NULL LIMIT ${BATCH}`
        )
        .all();
      if (rows.length === 0) return;

      const payload = rows.map((row) => {
        const out = {
          uuid: row.uuid,
          updatedAt: sqliteToIso(row.updatedAt) || new Date().toISOString(),
          deletedAt: sqliteToIso(row.deletedAt),
        };
        for (const f of table.fields) out[f] = row[f] ?? null;
        for (const [fkField, [parentTable, localCol]] of Object.entries(table.fks || {})) {
          out[fkField] = this.uuidFor(db, parentTable, row[localCol]);
        }
        return out;
      });

      const result = await this.api("/sync/push", {
        method: "POST",
        body: JSON.stringify({ table: table.name, rows: payload }),
      });

      // Clear dirty only if the row wasn't edited again mid-flight.
      const clear = db.prepare(
        `UPDATE ${table.name} SET dirty = 0, syncedAt = datetime('now')
         WHERE uuid = ? AND updatedAt <= ?`
      );
      const done = new Set([...(result.applied || []), ...(result.skipped || [])]);
      const clearTx = db.transaction(() => {
        for (const row of rows) {
          if (done.has(row.uuid)) clear.run(row.uuid, row.updatedAt);
        }
      });
      clearTx();

      if (pushTotal > 0 && this.progress) {
        // Clamp: new dirty rows can land mid-cycle (see kick()) and would
        // otherwise push this below 0 or above the original total.
        this.progress.done = Math.max(0, Math.min(pushTotal, pushTotal - this.countDirty()));
        this.emitStatus({ state: "syncing", progress: this.progress });
      }

      if (rows.length < BATCH) return;
    }
  }

  async pullTable(db, table) {
    const getCursor = db.prepare(`SELECT serverCursor FROM sync_state WHERE tableName = ?`);
    const setCursor = db.prepare(
      `INSERT INTO sync_state (tableName, serverCursor) VALUES (?, ?)
       ON CONFLICT(tableName) DO UPDATE SET serverCursor = excluded.serverCursor`
    );

    for (;;) {
      const since = getCursor.get(table.name)?.serverCursor || "";
      const result = await this.api(
        `/sync/pull?table=${table.name}&since=${encodeURIComponent(since)}&limit=${BATCH}`
      );
      const rows = result.rows || [];
      if (rows.length === 0) return;

      const applyPage = db.transaction(() => {
        for (const row of rows) this.applyPulledRow(db, table, row);
        if (result.nextCursor) setCursor.run(table.name, result.nextCursor);
      });
      applyPage();

      if (!result.hasMore) return;
    }
  }

  applyPulledRow(db, table, row) {
    const local = db
      .prepare(`SELECT id, updatedAt, dirty FROM ${table.name} WHERE uuid = ?`)
      .get(row.uuid);

    const incomingUpdatedAt = isoToSqlite(row.updatedAt);
    const values = {
      updatedAt: incomingUpdatedAt,
      deletedAt: isoToSqlite(row.deletedAt),
    };
    for (const f of table.fields) values[f] = row[f] ?? null;
    for (const [fkField, [parentTable, localCol]] of Object.entries(table.fks || {})) {
      const parentId = this.localIdFor(db, parentTable, row[fkField]);
      // Parent not local yet (rare — parents pull first). Skip; the row will
      // be re-sent because our cursor only advances after the full page, and
      // if not, the next full pull cycle from this cursor picks it up.
      if (row[fkField] && parentId == null) {
        log.warn(`[SYNC] skipped ${table.name} ${row.uuid}: missing parent in ${parentTable}`);
        return;
      }
      values[localCol] = parentId;
    }

    if (!local) {
      if (row.deletedAt) return; // never resurrect a tombstone as a new row
      const cols = Object.keys(values);
      db.prepare(
        `INSERT INTO ${table.name} (uuid, dirty, syncedAt, ${cols.join(", ")})
         VALUES (?, 0, datetime('now'), ${cols.map(() => "?").join(", ")})`
      ).run(row.uuid, ...cols.map((c) => values[c]));
      return;
    }

    // Last-write-wins: local row keeps priority on tie or when newer; if it
    // is still dirty it will push and win server-side by the same rule.
    if (local.updatedAt >= incomingUpdatedAt) return;

    const cols = Object.keys(values);
    db.prepare(
      `UPDATE ${table.name}
       SET ${cols.map((c) => `${c} = ?`).join(", ")}, dirty = 0, syncedAt = datetime('now')
       WHERE id = ?`
    ).run(...cols.map((c) => values[c]), local.id);
  }
}

module.exports = { syncEngine: new SyncEngine() };
