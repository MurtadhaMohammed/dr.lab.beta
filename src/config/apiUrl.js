// Single source of truth for the Dr.Lab API base URL, read from .env
// (API_URL). Plain CommonJS so it can be required as-is from the Electron
// main process (src/control/sync.js, unbundled Node — index.js loads dotenv
// at startup) and imported from renderer code (src/libs/api.js, bundled by
// Parcel, which inlines process.env.* from .env at build time automatically).
// Falls back to dev if .env is missing (e.g. intentionally excluded from
// packaged builds). dev.drlab.app mirrors production data and additionally
// serves the sync endpoints, which aren't deployed to production yet.
const API_URL = process.env.API_URL || "https://app.drlab.app/api";

module.exports = { API_URL };
