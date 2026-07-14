// Run: node find-broken-main.js app.asar.unpacked-check
// Walks every package.json under node_modules and reports any whose "main"
// entry (or default index.js) doesn't actually exist on disk — the exact
// condition that produces Electron's "Cannot find module ... main.js" crash.
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "app.asar.unpacked-check";
const nodeModules = path.join(root, "node_modules");

function resolveMain(pkgDir, pkgJson) {
  let main = pkgJson.main || "index.js";
  if (!main.endsWith(".js") && !main.endsWith(".json") && !main.endsWith(".node")) {
    // could be a directory or extensionless file; try common resolutions
    const candidates = [main, `${main}.js`, path.join(main, "index.js")];
    for (const c of candidates) {
      if (fs.existsSync(path.join(pkgDir, c))) return path.join(pkgDir, c);
    }
    return path.join(pkgDir, main); // fall through to report as missing
  }
  return path.join(pkgDir, main);
}

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("@")) {
      walk(full); // scoped packages dir
      continue;
    }
    const pkgJsonPath = path.join(full, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
        const mainPath = resolveMain(full, pkgJson);
        if (!fs.existsSync(mainPath)) {
          console.log(`BROKEN: ${pkgJsonPath}`);
          console.log(`  main: "${pkgJson.main}" -> ${mainPath} (missing)`);
        }
      } catch (e) {
        console.log(`UNREADABLE package.json: ${pkgJsonPath} (${e.message})`);
      }
    }
    // recurse into nested node_modules too
    const nested = path.join(full, "node_modules");
    if (fs.existsSync(nested)) walk(nested);
  }
}

if (!fs.existsSync(nodeModules)) {
  console.error(`No node_modules found at ${nodeModules}`);
  process.exit(1);
}

console.log(`Scanning ${nodeModules} ...`);
walk(nodeModules);
console.log("Done.");
