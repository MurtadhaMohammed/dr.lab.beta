/**
 * Dev-only signing fix.
 *
 * We don't have an Apple Developer ID cert, so electron-builder's own
 * ad-hoc signature ends up broken (spctl: "code has no resources but
 * signature indicates they must be present") once later build steps touch
 * the .app bundle after it's initially signed. Gatekeeper then reports the
 * app as "damaged" for anyone who downloads it (not just locally, since
 * local runs never go through the quarantine/Gatekeeper check).
 *
 * Re-signing ad-hoc here, after packaging is fully done, reseals the
 * bundle so the signature matches its actual contents. This still isn't a
 * Developer ID signature, so recipients get the normal "unidentified
 * developer" prompt (right-click > Open, or Settings > Privacy & Security >
 * Open Anyway) instead of the unrecoverable "damaged" dialog.
 *
 * Once this ships to real users, replace this with proper Developer ID
 * signing + notarization (afterSign hook using @electron/notarize).
 */
const { execFileSync } = require("child_process");

exports.default = async function afterSign(context) {
  if (context.electronPlatformName !== "darwin") return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${context.appOutDir}/${appName}.app`;

  console.log(`Re-signing ${appPath} ad-hoc (dev build, no Developer ID cert)...`);
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", appPath], {
    stdio: "inherit",
  });
};
