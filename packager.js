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

// better-sqlite3 is a native Electron module. `npm install --cpu=ia32` is not
// enough to replace an already-installed x64 binary, and it targets Node's
// ABI rather than Electron's ABI. Rebuild it explicitly for the Electron
// version and architecture that electron-packager is about to bundle.
//
// This temporarily overwrites the same node_modules/better-sqlite3 binary
// used by local development, so restore an Electron build for the host after
// packaging finishes.
const betterSqlite3Version = require("./node_modules/better-sqlite3/package.json").version;
const electronVersion = require("./node_modules/electron/package.json").version;
const crossCompilingSqlite3 = os.platform() !== platform || os.arch() !== arch;

function rebuildBetterSqlite3(targetPlatform, targetArch, label) {
  console.log(
    `Rebuilding better-sqlite3@${betterSqlite3Version} for Electron ${electronVersion} (${label})...`
  );
  const r = spawnSync(
    "npx",
    [
      "electron-rebuild",
      "--force",
      "--which-module=better-sqlite3",
      `--version=${electronVersion}`,
      `--platform=${targetPlatform}`,
      `--arch=${targetArch}`,
    ],
    { stdio: "inherit", shell: true, cwd: __dirname }
  );
  if (r.status !== 0) {
    throw new Error(
      `Failed to rebuild better-sqlite3 for Electron ${electronVersion} ${targetPlatform}-${targetArch}`
    );
  }
}

function ensureBetterSqlite3ForTarget() {
  rebuildBetterSqlite3(platform, arch, `${platform}-${arch} package`);
}

function restoreBetterSqlite3ForHost() {
  if (!crossCompilingSqlite3) return;
  console.log("Restoring better-sqlite3 native binary for local development...");
  try {
    rebuildBetterSqlite3(os.platform(), os.arch(), `${os.platform()}-${os.arch()} host`);
  } catch (error) {
    console.error(
      "Failed to restore better-sqlite3 for local development:",
      error.message
    );
  }
}

ensureSharpForTarget();
ensureBetterSqlite3ForTarget();

// A running Dr.Lab.exe from a previous build locks files under
// build/Dr.Lab-win32-ia32 and makes electron-packager's overwrite fail with
// EBUSY/rmdir. Quit those processes and remove the output folder first.
function unlockPreviousOutput() {
  if (platform !== "win32") return;
  const outDir = path.join(__dirname, "build", `Dr.Lab-${platform}-${arch}`);
  if (!fs.existsSync(outDir)) return;

  console.log("Stopping any running Dr.Lab processes that lock the build folder...");
  spawnSync("taskkill", ["/F", "/IM", "Dr.Lab.exe", "/T"], {
    stdio: "ignore",
    shell: true,
  });
  // Brief pause so Windows releases file handles.
  spawnSync("powershell", ["-NoProfile", "-Command", "Start-Sleep -Seconds 2"], {
    stdio: "ignore",
    shell: true,
  });

  try {
    fs.rmSync(outDir, { recursive: true, force: true });
    console.log("Cleared previous output:", outDir);
  } catch (err) {
    if (err && (err.code === "EBUSY" || err.code === "EPERM")) {
      throw new Error(
        `Cannot overwrite ${outDir} (still locked).\n` +
          `Close Dr.Lab.exe (check Task Manager) and retry: npm run build`
      );
    }
    throw err;
  }
}

unlockPreviousOutput();

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
