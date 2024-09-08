const { ipcMain, shell, app, BrowserWindow } = require("electron");
var { createPDF, printReport, createPDFBlob } = require("../../initPDF");
const { machineIdSync } = require("node-machine-id");
const { LabDB } = require("./db");
const fs = require("fs");
const path = require("path");
const image = path.join(__dirname, "../../defaultHeader.jpg");
const bwipjs = require("bwip-js");
const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

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
        console.log("Received data for adding test:", arg.data);
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
        console.log("Received data for getting tests:", arg.data);
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
        console.log("Received data for editing package:", arg.data);
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
    case "print": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }
      createPDF(arg.data, arg?.isView, (err, res, file) => {
        event.reply("asynchronous-reply", { err, res, file });
      });
      break;

    case "printReport": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }
      printReport(arg.data, (err, res) => {
        console.log(res, "this is the response");
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
      const padding = 20;

      let visitNumber = await labDB.addUniqueVisitNumber(arg?.data?.id);
      if (!visitNumber) {
        event.reply("asynchronous-reply", { success: false });
        return;
      }

      bwipjs.toBuffer(
        {
          bcid: "code128",
          text: String(visitNumber),
          scale: 4,
          height: 5,
          includetext: false,
        },
        async function (err, png) {
          if (err) {
            console.error(err);
            event.reply("asynchronous-reply", { success: false });
          } else {
            sharp(png)
              .metadata()
              .then((metadata) => {
                const barcodeWidth = metadata.width;
                const barcodeHeight = metadata.height;

                // Create Arabic text as an SVG with matching width
                const textSvg = Buffer.from(`
                <svg width="${barcodeWidth}" height="60">
                  <text x="50%" y="50%" font-size="35" text-anchor="middle" fill="black" dominant-baseline="middle">${arg.data.name}</text>
                </svg>
              `);

                const totalWidth = barcodeWidth + 2 * padding;
                const totalHeight = barcodeHeight + 30 + padding + padding;

                // Composite the barcode with the Arabic text
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
                      event.reply("asynchronous-reply", { success: false });
                    } else {
                      const base64Image = outputBuffer.toString('base64');

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
                              body { margin: 0; padding: 0; }
                              img { width: 100%; height: 100%; object-fit: cover; }
                            </style>
                          </head>
                          <body>
                            <img src="data:image/png;base64,${base64Image}" alt="Barcode">
                          </body>
                        </html>
                      `;

                      printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

                      printWin.webContents.on('did-finish-load', () => {
                        printWin.webContents.print({
                          silent: true, // Set to true to bypass the print dialog
                          printBackground: true,
                          deviceName: 'Birch DP-2412BF', // Make sure this exactly matches your printer name
                          margins: {
                            marginType: 'none'
                          },
                          pageSize: {
                            width: 33400,
                            height: 20200,
                          },
                        }, (success, failureReason) => {
                          if (!success) {
                            console.error(`Printing failed: ${failureReason}`);
                            event.reply("asynchronous-reply", { success: false, error: failureReason });
                          } else {
                            console.log('Printing successful');
                            event.reply("asynchronous-reply", { success: true });
                          }
                          printWin.close();
                        });
                      });
                    }
                  });
              });
          }
        }
      );

      break;
    case "exportDatabase": {
      try {
        const desktopPath = app.getPath("desktop");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const exportPath = path.join(desktopPath, `lab_database_export_${timestamp}.json`);

        const data = await labDB.exportAllData();
        fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));

        event.reply("asynchronous-reply", {
          success: true,
          message: "Database exported successfully",
          path: exportPath
        });
      } catch (error) {
        console.error("Error exporting database:", error);
        event.reply("asynchronous-reply", {
          success: false,
          error: error.message
        });
      }
      break;
    }


    default:
      event.reply("asynchronous-reply", { err: "Unknown query", res: null });
      break;
  }
});
