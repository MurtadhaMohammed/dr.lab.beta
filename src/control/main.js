const { dialog, BrowserWindow, ipcMain, app } = require("electron");
var { createPDF, printReport } = require("../../initPDF");
const { machineIdSync } = require("node-machine-id");
const { LabDB } = require("./db");
const fs = require("fs");
const path = require("path");
const image = path.join(__dirname, "../../defaultHeader.jpg");
const bwipjs = require("bwip-js");
const sharp = require("sharp");
const isDev = require("electron-is-dev");

function findDatabaseFileInUserData() {
  const dbFileName = isDev
    ? "database.db"
    : process.platform === "win32"
    ? "Electrondatabase.db"
    : "lab-betadatabase.db";

  const dbPath = isDev
    ? path.join(app.getPath("userData"), dbFileName)
    : process.platform === "win32"
    ? path.join(app.getPath("userData"), "..", dbFileName)
    : path.join(app.getPath("userData"), dbFileName);

  try {
    if (fs.existsSync(dbPath)) {
      console.log("✅ Database file found:", dbPath);
      return { fullPath: path.resolve(dbPath), dbFile: dbFileName };
    } else {
      console.warn("⚠️ Database file does not exist at:", dbPath);
      return null;
    }
  } catch (error) {
    console.error("❌ Error checking for database file:", error);
    return null;
  }
}

ipcMain.on("asynchronous-message", async (event, arg) => {
  let labDB = await new LabDB();
  switch (arg.query) {
    case "getPatients": {
      try {
        const resp = await labDB.getPatients({
          q: arg?.q || "",
          limit: arg?.limit || 10,
          skip: arg?.skip || 0,
        });
        event.reply("asynchronous-reply", resp);
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "addPatient": {
      try {
        const resp = await labDB.addPatient(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "deletePatient": {
      try {
        const resp = await labDB.deletePatient(arg.id);
        event.reply("asynchronous-reply", { success: true, data: resp });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "updatePatient": {
      try {
        const resp = await labDB.updatePatient(arg.id, arg.data);
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        console.error("Error updating patient:", error); // Add this line
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "addTest": {
      try {
        // console.log("Received data for adding test:", arg.data);
        const resp = await labDB.addTest(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        console.error("Error adding test:", error);
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "deleteTest": {
      try {
        const resp = await labDB.deleteTest(arg.id);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "editTest": {
      try {
        const resp = await labDB.editTest(arg.id, arg.data);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "getTests": {
      try {
        const resp = await labDB.getTests(arg.data);
        // console.log("Received data for getting tests:", arg.data);
        event.reply("asynchronous-reply", resp);
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "addPackage": {
      try {
        const resp = await labDB.addPackage(arg.data);
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        console.error("Error adding package:", error);
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "deletePackage": {
      try {
        const resp = await labDB.deletePackage(arg.id);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "editPackage": {
      try {
        // console.log("Received data for editing package:", arg.data);
        const resp = await labDB.editPackage(arg.id, arg.data);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        console.error("Error updating package:", error);
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "getPackages": {
      try {
        const resp = await labDB.getPackages(arg.data);
        event.reply("asynchronous-reply", resp);
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "addVisit": {
      try {
        const resp = await labDB.addVisit(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        console.error("Error adding visit:", error.message);
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }
    case "deleteVisit": {
      try {
        const resp = await labDB.deleteVisit(arg.id);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "getVisits": {
      const { q, skip, limit, startDate, endDate } = arg.data;
      try {
        const resp = await labDB.getVisits({
          q,
          skip,
          limit,
          startDate,
          endDate,
        });
        event.reply("asynchronous-reply", resp);
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }
    case "getTotalVisits": {
      const { startDate, endDate } = arg.data;
      try {
        const resp = await labDB.getTotalVisits({
          startDate,
          endDate,
        });
        event.reply("asynchronous-reply", resp);
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "updateVisit": {
      try {
        // console.log(arg.id, arg.data, 'arg.id, arg.update');
        const resp = await labDB.updateVisit(arg.id, arg.data);
        event.reply("asynchronous-reply", {
          success: resp.success,
          newTests: resp?.newTests,
        });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "getVisitByPatient": {
      try {
        const { patientId } = arg;
        if (!patientId)
          throw new Error("Patient ID is required to get visits by patient.");
        const resp = await labDB.getVisitByPatient(patientId);
        event.reply("asynchronous-reply", resp);
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "saveHeadImage": {
      try {
        const { file } = arg;
        fs.copyFile(file, app.getPath("userData") + "/head.png", (err) => {
          if (err) {
            event.reply("asynchronous-reply", { success: false, err });
          } else {
            event.reply("asynchronous-reply", { success: true });
          }
        });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "initHeadImage": {
      try {
        const destPath = path.join(app.getPath("userData"), "head.png");

        fs.copyFile(image, destPath, (err) => {
          if (err) {
            event.reply("asynchronous-reply", { success: false, err });
          } else {
            event.reply("asynchronous-reply", { success: true });
          }
        });
      } catch (error) {
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;
    }

    case "checkInitHeadImage": {
      const destPath = path.join(app.getPath("userData"), "head.png");

      if (!destPath) {
        event.reply("asynchronous-reply", { success: false, err });
      }

      return event.reply("asynchronous-reply", { success: true });
    }

    case "insert": // { doc: "patients", data : {}, query: "insert" }
      db[arg.doc].insert(arg.data, (err, rows) => {
        event.reply("asynchronous-reply", { err, rows });
      });
      break;

    case "update": // { doc: "patients", data : {}, query: "insert" }
      db[arg.doc].update(arg.condition, arg.data, {}, (err) => {
        if (err) return;
        db[arg.doc].find(arg.condition, function (err, docs) {
          event.reply("asynchronous-reply", { err, row: docs[0] });
        });
      });
      break;

    case "remove": // { doc: "patients", data : {}, query: "insert" }
      db[arg.doc].remove(arg.condition, {}, (err, numRemoved) => {
        event.reply("asynchronous-reply", { err, numRemoved });
      });
      break;

    case "find":
      db[arg.doc]
        .find(arg?.search)
        .skip(arg?.skip || 0)
        .limit(arg?.limit || 100)
        .sort({ createdAt: -1 })
        .exec((err, rows) => {
          event.reply("asynchronous-reply", { err, rows });
        });
      break;

    case "count": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }
      db[arg.doc].count(arg.search, (err, count) => {
        event.reply("asynchronous-reply", { err, count });
      });
      break;
    case "print": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }'
      createPDF(arg.data, arg?.isView, (err, res, file) => {
        // console.log(err, res, file, "this is the error, response and file");
        event.reply("asynchronous-reply", { err, res, file });
      });
      break;

    case "printReport": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }
      printReport(arg.data, (err, res) => {
        // console.log(res, "this is the response");
        return event.reply("asynchronous-reply", { err, res });
      });
      break;

    // case "getUUID":
    //   try {
    //     const UUID = machineIdSync(true);
    //     console.log("Retrieved UUID:", UUID);
    //     event.reply("asynchronous-reply", { UUID });
    //   } catch (error) {
    //     console.error("Error retrieving UUID:", error);
    //     event.reply("asynchronous-reply", { error: "Failed to retrieve UUID" });
    //   }
    //   break;

    case "getUUID":
      let UUID = await machineIdSync(true);
      event.reply("asynchronous-reply", { UUID });
      break;

    case "printParcode":
      // console.log("Received data for printing barcode:", arg.data);
      const padding = 20;

      try {
        let visitNumber = await labDB.addUniqueVisitNumber(arg?.data?.id);
        if (!visitNumber) {
          // console.log("Failed to generate visit number");
          event.reply("asynchronous-reply", {
            success: false,
            error: "Failed to generate visit number",
          });
          return;
        }
        // console.log("Generated visit number:", visitNumber);

        // Fetch the visit object
        const visit = await labDB.getVisitDetails(arg.data.id);
        // console.log("Fetched visit:", JSON.stringify(visit, null, 2));

        bwipjs.toBuffer(
          {
            bcid: "code128",
            text: String(visitNumber),
            scale: 4,
            height: 5,
            includetext: false,
          },
          function (err, png) {
            if (err) {
              console.error(err);
              event.reply("asynchronous-reply", {
                success: false,
                error: "Failed to generate barcode",
              });
            } else {
              sharp(png)
                .metadata()
                .then((metadata) => {
                  const barcodeWidth = metadata.width;
                  const barcodeHeight = metadata.height;

                  const textSvg = Buffer.from(`
                  <svg width="${barcodeWidth}" height="60">
                    <text x="50%" y="50%" font-size="35" text-anchor="middle" fill="black" dominant-baseline="middle">${
                      visit ? visit.patient.name : arg.data.name
                    }</text>
                  </svg>
                `);

                  const totalWidth = barcodeWidth + 2 * padding;
                  const totalHeight = barcodeHeight + 30 + padding + padding;

                  sharp({
                    create: {
                      width: totalWidth,
                      height: totalHeight,
                      channels: 4,
                      background: { r: 255, g: 255, b: 255, alpha: 1 },
                    },
                  })
                    .composite([
                      { input: png, top: padding, left: padding },
                      {
                        input: textSvg,
                        top: barcodeHeight + padding,
                        left: padding,
                      },
                    ])
                    .png()
                    .toBuffer((err, outputBuffer) => {
                      if (err) {
                        console.error(err);
                        event.reply("asynchronous-reply", {
                          success: false,
                          error: "Failed to generate barcode image",
                        });
                      } else {
                        const base64Image = outputBuffer.toString("base64");

                        const printWin = new BrowserWindow({
                          width: 162,
                          height: 76,
                          show: false,
                          webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,
                          },
                        });

                        const htmlContent = `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <style>
                                body { margin: 0; padding-left: 5px; padding-top: 2px; }
                                img { width: 100%; height: 100%; object-fit: cover; }
                              </style>
                            </head>
                            <body>
                              <img src="data:image/png;base64,${base64Image}" alt="Barcode">
                            </body>
                          </html>
                        `;

                        printWin.loadURL(
                          `data:text/html;charset=utf-8,${encodeURIComponent(
                            htmlContent
                          )}`
                        );

                        printWin.webContents.on("did-finish-load", () => {
                          printWin.webContents.print(
                            {
                              silent: true,
                              printBackground: true,
                              deviceName: arg.selectedPrinter,
                              margins: {
                                marginType: "none",
                              },
                              pageSize: {
                                width: 35400,
                                height: 17700,
                              },
                            },
                            (success, failureReason) => {
                              if (!success) {
                                console.error(
                                  `Printing failed: ${failureReason}`
                                );
                                event.reply("asynchronous-reply", {
                                  success: false,
                                  error: failureReason,
                                });
                              } else {
                                console.log("Printing successful");
                                event.reply("asynchronous-reply", {
                                  success: true,
                                });
                              }
                              printWin.close();
                            }
                          );
                        });
                      }
                    });
                })
                .catch((error) => {
                  console.error("Error processing image:", error);
                  event.reply("asynchronous-reply", {
                    success: false,
                    error: "Error processing image",
                  });
                });
            }
          }
        );
      } catch (error) {
        console.error("Error in printParcode:", error);
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message,
        });
      }
      break;

    case "exportDatabaseFile": {
      try {
        await labDB.executeMaintenance();
        const dbTarget = findDatabaseFileInUserData();
        if (!dbTarget) {
          console.error("❌ No database file found to export.");
          event.reply("asynchronous-reply", {
            success: false,
            message: "لم يتم العثور على قاعدة بيانات للتصدير.",
          });
          return;
        }

        await labDB.syncToDisk();

        const { fullPath: dbPath, dbFile } = dbTarget;

        const defaultPath = path.join(app.getPath("desktop"), dbFile);

        const { filePath, canceled } = await dialog.showSaveDialog({
          title: "Export Database",
          defaultPath: defaultPath,
          filters: [{ name: "Database Files", extensions: ["db"] }],
        });

        if (canceled || !filePath) {
          // console.log("🚫 Export canceled.");
          return event.reply("asynchronous-reply", {
            success: false,
            message: "Export canceled.",
          });
        }

        await labDB.closeConnection();
        await new Promise((resolve) => setTimeout(resolve, 100));

        fs.copyFile(dbPath, filePath, async (error) => {
          if (error) {
            console.error("❌ Error exporting database:", error);
            event.reply("asynchronous-reply", {
              success: false,
              message: "فشل في تصدير قاعدة البيانات.",
            });
          } else {
            console.log("✅ Database exported to:", filePath);
            event.reply("asynchronous-reply", {
              success: true,
              message: "تم تصدير قاعدة البيانات بنجاح.",
            });
          }
        });
      } catch (error) {
        console.error("❌ Unexpected error in ExportDatabaseFile:", error);
        event.reply("asynchronous-reply", {
          success: false,
          message: "حدث خطأ غير متوقع أثناء التصدير.",
        });
      }
      break;
    }

    case "ImportDatabaseFile": {
      try {
        await labDB.closeConnection();
        const { filePaths, canceled } = await dialog.showOpenDialog({
          title: "Import Database",
          properties: ["openFile"],
          filters: [{ name: "Database Files", extensions: ["db"] }],
        });

        if (canceled || !filePaths || filePaths.length === 0) {
          return event.reply("asynchronous-reply", {
            success: false,
            message: "🚫 Import canceled or no file selected.",
          });
        }

        const newDbPath = filePaths[0];

        const dbTarget = findDatabaseFileInUserData();
        if (!dbTarget) {
          console.error("❌ No existing database found to replace.");
          return event.reply("asynchronous-reply", {
            success: false,
            message: "لم يتم العثور على قاعدة بيانات حالية.",
          });
        }

        const defaultPathDB = dbTarget.fullPath;

        fs.unlinkSync(defaultPathDB);
        await labDB.reconncet();
        await labDB.closeConnection();
        // 🛡️ Backup before replacing
        const backupPath = defaultPathDB + ".backup";
        fs.copyFileSync(defaultPathDB, backupPath);
        // 📥 Replace with new file
        fs.copyFile(newDbPath, defaultPathDB, async (copyError) => {
          if (copyError) {
            console.error("❌ Error replacing DB:", copyError);
            event.reply("asynchronous-reply", {
              success: false,
              message: "فشل في استيراد قاعدة البيانات.",
            });
          } else {
            await labDB.reconncet();
            console.log("✅ DB replaced with:", newDbPath);
            event.reply("asynchronous-reply", {
              success: true,
              message: "تم استيراد قاعدة البيانات بنجاح.",
            });
          }
        });
      } catch (error) {
        console.error("❌ Error in ImportDatabaseFile:", error);
        event.reply("asynchronous-reply", {
          success: false,
          message: "حدث خطأ أثناء الاستيراد.",
        });
      }
      break;
    }

    default:
      event.reply("asynchronous-reply", { err: "Unknown query", res: null });
      break;
  }
});

ipcMain.handle("get-printers", async (event) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) {
    throw new Error("No active window");
  }
  const printers = await win.webContents.getPrintersAsync();
  return printers.map((printer) => printer.name);
});
