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

This app uses `better-sqlite3`, a native module that must be compiled for the OS/arch you're building for. `node-gyp` cannot cross-compile it for a different OS, so **each platform's build must be produced on that platform** (or in CI on a matching runner) — you cannot build a working Windows package from a Mac, or vice versa.

### macOS

```bash
npm install
npm run rebuild        # compiles better-sqlite3 for this Mac's arch
npm run package         # electron-builder, produces a dmg/zip in ./out
# or: npm run build-mac # electron-packager, produces an app bundle in ./build
```

### Windows

Run these on an actual Windows machine (or a `windows-latest` CI runner) — not via cross-compilation from macOS/Linux.

```bash
npm install
npm run rebuild         # compiles better-sqlite3 for Windows
npm run package:win     # electron-builder, produces an nsis installer in ./out
# or: npm run build     # electron-packager (win32/ia32), produces a folder in ./build
```

If `npm run rebuild` fails to find a prebuilt `better-sqlite3` binary for your Electron version, it will fall back to compiling from source, which requires the Windows build tools (`npm install --global windows-build-tools` or Visual Studio's "Desktop development with C++" workload).

