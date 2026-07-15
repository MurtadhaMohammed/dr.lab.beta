# Getting Started with Electron with Create React App

Creating Desktop applications has come a long way. With every passing day, developers come up with easy to use options for creating desktop applications. Electron is one of those solutions. It uses web technologies wrapped around Node.js to come up with web technologies. For a more detailed introduction to the whole Electron.Js ecosystem, you can read [this article](https://www.section.io/engineering-education/cross-platform-applications-electron/).

Electron uses HTML/CSS and JavaScript traditionally. You can use HTML, CSS and vanilla JavaScript to build Electron applications. Other options available include using React and other JavaScript frameworks. In this article, we will accomplish the following:

- Create a React.js app using [Create-React-App](https://reactjs.org/docs/create-a-new-react-app.html)
- Install Electron into the application
- Configure Electron in the React.js app
- Finally, create a demo desktop application using Electron and React.


### Where to find The article
Hey Stranger, You can read the whole article at [Section Engineering blog](https://www.section.io/engineering-education/desktop-application-with-react/): 

## Building

This app uses native modules (`better-sqlite3`, `sharp`) that must be compiled for the OS/arch you're building for. `node-gyp` cannot cross-compile them for a different OS, so **each platform's build must be produced on that platform** (or in CI on a matching runner) — you cannot build a working Windows package from a Mac, or vice versa.

`npm run build` / `npm run build-mac` go through `packager.js` (not a raw `electron-packager` CLI string). They also run `react-build` first (via the `prebuild`/`prebuild-mac` npm hooks), so `dist/` is always regenerated before packaging — you don't need to run it separately.

### Clean build (do this if a previous build misbehaved)

Stale `dist/`, a stale `.parcel-cache`, or a stray previous `out/`/`build/` directory getting bundled into the app are the most common causes of a white screen, a bloated app size, or a build that hangs. When in doubt, wipe everything and rebuild from scratch:

```bash
rm -rf .parcel-cache dist build out
npm run rebuild          # recompile native modules (better-sqlite3) for this machine
npm run build-mac        # or: npm run build   (Windows), npm run package / package:win
```

### macOS

```bash
npm install
npm run rebuild        # compiles better-sqlite3 for this Mac's arch
npm run build-mac       # packager.js → darwin/arm64 app bundle in ./build
# or: npm run package   # electron-builder, produces a dmg/zip in ./out
```

### Windows

Run these on an actual Windows machine (or a `windows-latest` CI runner) — not via cross-compilation from macOS/Linux.

```bash
npm install
npm run rebuild         # compiles better-sqlite3 for Windows
npm run build           # packager.js → win32/ia32 folder in ./build/Dr.Lab-win32-ia32
# or: npm run package:win # electron-builder, produces an nsis installer in ./out
```

If `npm run rebuild` fails to find a prebuilt `better-sqlite3` binary for your Electron version, it will fall back to compiling from source, which requires the Windows build tools (`npm install --global windows-build-tools` or Visual Studio's "Desktop development with C++" workload).

The Windows target is still **ia32** (32-bit). Building that from a typical **x64** Windows host does not install `@img/sharp-win32-ia32` automatically; `packager.js` detects when it's missing and runs `npm install --os=win32 --cpu=ia32 --force @img/sharp-win32-ia32@0.33.5` before packaging. Without that binary the packaged app crashes on launch with `Could not load the "sharp" module using the win32-ia32 runtime`.

### Notes / known gotchas

- `react-build` must run as `parcel build ...` (with the `build` subcommand). Without it, Parcel defaults to starting a persistent **dev server** instead of doing a one-shot production build — it never exits, which silently hangs the `prebuild`/`prebuild-mac` hook and blocks packaging entirely.
- Packaging uses `packager.js` with `asar.unpack: "**/*.{node,dylib,dll}"` so native binaries (`better-sqlite3`, `sharp`'s `.node`/DLLs) are unpacked from the asar — `dlopen` cannot load a native library from inside an asar archive, so without this the app crashes on launch with a "Could not load module" error.
- Ignore rules for root `build/` and `out/` live in `packager.js` as anchored regexes (`/^\/build(\/|$)/`, `/^\/out(\/|$)/`). Do **not** put `--ignore=^/build$` / `--ignore=^/out$` in an npm script on Windows: `cmd.exe` treats `^` as an escape character, the anchors are stripped, and every dependency folder named `build` or `out` is excluded from the asar (most visibly `electron-updater/out/main.js`, which then fails with "Please verify that the package.json has a valid main entry").
- Keep `@img/sharp-win32-ia32` listed under `optionalDependencies` so the ia32 sharp binary is part of the project's declared deps; `packager.js` still force-installs it when targeting `win32`/`ia32` from an x64 machine.

