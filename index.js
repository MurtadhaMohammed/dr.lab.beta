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
      devTools: true,
      allowRendererProcessReuse: false,
    },
    autoHideMenuBar: true,
    width: 1400,
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
    win.maximize(); 
    win.show();
    win.webContents.send("hello");

    if (!isDev) {
      // Configure the feed URL for GitHub Releases
      const isMac = os.platform() === "darwin";
      
      // Configure autoUpdater settings
      autoUpdater.autoDownload = false; // Don't auto-download, let user confirm first
      autoUpdater.autoInstallOnAppQuit = true;
      
      autoUpdater.setFeedURL({
        provider: "generic",
        url: `https://drlab.us-east-1.linodeobjects.com/release/${isMac ? "mac" : "win"}`,
      });
      
      log.info(`Current app version: ${app.getVersion()}`);
      log.info(`Checking for updates at: https://drlab.us-east-1.linodeobjects.com/release/${isMac ? "mac" : "win"}`);
      
      autoUpdater.checkForUpdates();
    }

    autoUpdater.on("checking-for-update", () => {
      log.info("Checking for update...");
      win.webContents.send("checking-for-update");
    });

    autoUpdater.on("update-available", (info) => {
      log.info("Update available:", info);
      log.info(`New version: ${info.version}, Current version: ${app.getVersion()}`);
      win.webContents.send("update-available", info);
      
      // Ask user if they want to download
      const options = {
        type: "info",
        buttons: ["Download", "Later"],
        title: "Update Available",
        message: `A new version (${info.version}) is available. Current version: ${app.getVersion()}. Do you want to download it now?`,
      };
      
      dialog.showMessageBox(null, options).then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on("update-not-available", (info) => {
      log.info("Update not available:", info);
      log.info(`Current version ${app.getVersion()} is up to date`);
      win.webContents.send("update-not-available", info);
    });

    autoUpdater.on("download-progress", (progressObj) => {
      let logMessage = "Download speed: " + progressObj.bytesPerSecond;
      logMessage = logMessage + " - Downloaded " + progressObj.percent + "%";
      logMessage = logMessage + " (" + progressObj.transferred + "/" + progressObj.total + ")";
      log.info(logMessage);
      win.webContents.send("download-progress", progressObj);
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
