/**
 * Cross-platform electron-packager entry.
 * Avoids putting ^-anchored --ignore regexes in npm scripts: on Windows,
 * cmd.exe treats ^ as an escape char, so `--ignore=^/out$` becomes `/out$`
 * and strips every dependency's `out/` (and `build/`) folder from the asar —
 * which breaks electron-updater (`out/main.js`) at startup.
 */
const path = require("path");
const fs = require("fs");
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

ensureSharpForTarget();

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
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
