const path = require("path");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const express = require("express");
const Cors = require("cors");
const os = require("os");
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
      devTools: isDev,
      allowRendererProcessReuse: false,
    },
    autoHideMenuBar: true,
    width: 1300,
    height: 800,
    minWidth: 1024,  
    minHeight: 750,  
    maxWidth: 1920,  
    maxHeight: 1080, 
    show: false,
    frame: false,
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

  if (isDev) {
    win.loadURL("http://localhost:3001");
    splash.loadFile("./splash.html");
  } else {
    win.loadFile("./dist/index.html");
    splash.loadFile("./dist/splash.html");
  }

  const server = express();
  server.use(Cors());
  server.use(express.static(path.join(app.getPath("userData"))));
  server.listen(3009); // Different port for serving static files

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

  ipcMain.on("minimize-window", () => {
    if (win) win.minimize();
  });

  ipcMain.on("maximize-window", () => {
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on("close-window", () => {
    if (win) win.close();
  });

  win.once("ready-to-show", () => {
    splash.close();
    win.show();
    win.webContents.send("hello");

    if (!isDev) {
      // Configure the feed URL for GitHub Releases
      const isMac = os.platform() === "darwin";
      autoUpdater.setFeedURL({
        provider: "generic",
        url: `https://drlab.us-east-1.linodeobjects.com/release/${isMac ? "mac" : "win"
          }`,
        // url: "https://github.com/MurtadhaMohammed/dr.lab.beta/releases/latest",
        // provider: "github",
        // repo: "dr.lab.beta",
        // owner: "MurtadhaMohammed",
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
