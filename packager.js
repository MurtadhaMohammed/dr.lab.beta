/**
 * Cross-platform electron-packager entry.
 * Avoids putting ^-anchored --ignore regexes in npm scripts: on Windows,
 * cmd.exe treats ^ as an escape char, so `--ignore=^/out$` becomes `/out$`
 * and strips every dependency's `out/` (and `build/`) folder from the asar —
 * which breaks electron-updater (`out/main.js`) at startup.
 */
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawnSync } = require("child_process");
const packager = require("electron-packager");

const platform = process.argv[2] || "win32";
const arch = process.argv[3] || "ia32";

// Host (usually win32-x64) won't install arch-specific optional deps unless
// we force them. Without @img/sharp-win32-ia32 the packaged ia32 app crashes
// on require("sharp") at startup.
function ensureSharpForTarget() {
  if (platform !== "win32" || arch !== "ia32") return;
  const pkg = path.join(
    __dirname,
    "node_modules",
    "@img",
    "sharp-win32-ia32",
    "lib",
    "sharp-win32-ia32.node"
  );
  if (fs.existsSync(pkg)) {
    console.log("sharp win32-ia32 binary present");
    return;
  }
  console.log("Installing @img/sharp-win32-ia32 for packaging...");
  const r = spawnSync(
    "npm",
    [
      "install",
      "@img/sharp-win32-ia32@0.33.5",
      "--os=win32",
      "--cpu=ia32",
      "--force",
      "--no-save",
    ],
    { stdio: "inherit", shell: true, cwd: __dirname }
  );
  if (r.status !== 0 || !fs.existsSync(pkg)) {
    throw new Error(
      "Failed to install @img/sharp-win32-ia32 — required for win32-ia32 builds"
    );
  }
}

// better-sqlite3 fetches a prebuilt native binary matching whatever machine
// runs `npm install` (via prebuild-install) — unlike sharp, it's a single
// package with one binary path (no separate @img/sharp-win32-ia32-style
// per-platform package), so packaging for Windows from this Mac bundles the
// Mac binary as-is. The packaged app then fails at runtime with
// "... is not a valid Win32 application". Because there's nowhere else to
// put the swapped-in binary, this temporarily overwrites the same
// node_modules/better-sqlite3 this machine's own `npm start` uses — so we
// must restore the host's own binary again once packaging finishes (see
// restoreBetterSqlite3ForHost below), or local dev breaks after a build.
const betterSqlite3Version = require("./node_modules/better-sqlite3/package.json").version;
const crossCompilingSqlite3 = os.platform() !== platform || os.arch() !== arch;

function ensureBetterSqlite3ForTarget() {
  if (!crossCompilingSqlite3) return;
  console.log(`Swapping in better-sqlite3@${betterSqlite3Version} for ${platform}-${arch}...`);
  const r = spawnSync(
    "npm",
    [
      "install",
      `better-sqlite3@${betterSqlite3Version}`,
      `--os=${platform}`,
      `--cpu=${arch}`,
      "--force",
      "--no-save",
    ],
    { stdio: "inherit", shell: true, cwd: __dirname }
  );
  if (r.status !== 0) {
    throw new Error(
      `Failed to install better-sqlite3 for ${platform}-${arch} — required for the packaged app's database to work`
    );
  }
}

function restoreBetterSqlite3ForHost() {
  if (!crossCompilingSqlite3) return;
  console.log("Restoring better-sqlite3 native binary for local development...");
  const r = spawnSync(
    "npm",
    ["install", `better-sqlite3@${betterSqlite3Version}`, "--force", "--no-save"],
    { stdio: "inherit", shell: true, cwd: __dirname }
  );
  if (r.status !== 0) {
    console.error(
      "Failed to restore better-sqlite3 for local development — run `npm install better-sqlite3 --force` manually."
    );
  }
}

ensureSharpForTarget();
ensureBetterSqlite3ForTarget();

const opts = {
  dir: path.resolve(__dirname),
  name: "Dr.Lab",
  overwrite: true,
  asar: { unpack: "**/*.{node,dylib,dll}" },
  platform,
  arch,
  prune: false,
  out: path.resolve(__dirname, "build"),
  // Paths are app-root-relative with a leading `/` and forward slashes.
  ignore: [
    /\.parcel-cache/,
    /^\/build(\/|$)/,
    /^\/out(\/|$)/,
    /^\/\.env$/,
    // Local packaging helpers / diagnostics — not needed in the app
    /^\/packager\.js$/,
    /^\/find-broken-main\.js$/,
    /^\/scan-asar-broken.*\.js$/,
    /^\/probe-asar-requires\.js$/,
  ],
};

packager(opts)
  .then((paths) => {
    console.log("Built:", paths.join("\n"));
    restoreBetterSqlite3ForHost();
  })
  .catch((err) => {
    console.error(err);
    restoreBetterSqlite3ForHost();
    process.exit(1);
  });
