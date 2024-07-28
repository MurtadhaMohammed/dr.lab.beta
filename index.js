const path = require("path");

const { app, BrowserWindow, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");

const isDev = require("electron-is-dev");
const log = require("electron-log");

log.transports.file.level = "info";

require("./src/control/main");

let win;
let splash;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      // devTools: isDev,
      allowRendererProcessReuse: false,
    },
    autoHideMenuBar: true,
    width: 1300,
    height: 800,
    // minWidth: 1040,
    // minHeight: 670,
    show: false,
  });
  splash = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
      allowRendererProcessReuse: false,
      nativeWindowOpen: true,
    },
    autoHideMenuBar: true,
    width: 500,
    height: 500,
    minWidth: 500,
    minHeight: 500,
    show: true,
    frame: false,
  });

  //win.loadFile(`./dist/index.html`);
  //win.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
  // splash.loadFile("./src/splash.html");

  if (isDev) {
    win.loadURL("http://localhost:1234");
    splash.loadFile("./splash.html");
  } else {
    win.loadFile("./dist/index.html");
    splash.loadFile("./dist/splash.html");
  }

  // win.loadFile("./dist/index.html");
  // splash.loadFile("./dist/splash.html");

  // win.loadURL(
  //   isDev
  //     ? `http://localhost:1234/`
  //     : `file://${path.join(__dirname, "../dist/index.html")}`
  // );

  // splash.loadURL(
  //   isDev
  //     ? `file://${path.join(__dirname, "./splash.html")}`
  //     : `file://${path.join(__dirname, "../dist/splash.html")}`
  // );

  win.once("ready-to-show", () => {
    splash.close();
    win.show();
    win.webContents.send("hello");

    if (!isDev) {
      // Configure the feed URL for GitHub Releases
      autoUpdater.setFeedURL({
        provider: "generic",
        // url: "http://192.168.0.102:8080",
        url: "https://github.com/MurtadhaMohammed/dr.lab.beta/releases/latest",
        provider: "github",
        repo: "dr.lab.beta",
        owner: "MurtadhaMohammed",
        //token: "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", // Optional: Add only if needed
      });
      autoUpdater.checkForUpdates();
    }

    autoUpdater.on("update-available", () => {
      log.info("Update available.");
      win.webContents.send("update-available");
    });

    autoUpdater.on("update-downloaded", () => {
      log.info("Update downloaded");
      win.webContents.send("update-downloaded");
      const options = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Update Available",
        message:
          "A new version has been downloaded. Restart now to apply the update?",
      };
      dialog.showMessageBox(null, options).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        } else {
          log.info("User chose to update later.");
        }
      });
    });

    autoUpdater.on("error", (err) => {
      log.error("Update error:", err);
      win.webContents.send("update-err", err);
    });
  });

  win.on("closed", function () {
    win = null;
    app.quit();
  });
}
//test
app.on("ready", createWindow);
app.on("window-all-closed", function () {
  app.quit();
});

app.on("activate", function () {
  if (win === null) {
    createWindow();
  }
});

app.whenReady(() => {
  app.allowRendererProcessReuse = false;
});