const { ipcMain } = require("electron");
var { createPDF, printReport } = require("../../initPDF");
const { machineIdSync } = require("node-machine-id");

var Datastore = require("nedb");
const { LabDB } = require("./db");
var db = {};

db.patients = new Datastore({ filename: "database/patients.db" });
db.tests = new Datastore({ filename: "database/tests.db" });
db.packages = new Datastore({ filename: "database/packages.db" });
db.visits = new Datastore({ filename: "database/visits.db" });

db.patients.loadDatabase();
db.tests.loadDatabase();
db.packages.loadDatabase();
db.visits.loadDatabase();

let labDB = new LabDB();

ipcMain.on("asynchronous-message", async (event, arg) => {
  switch (arg.query) {
    case "get-patients": {
      try {
        const resp = await labDB.getPatients({
          limit: arg?.limit || 10,
          skip: arg?.skip || 0,
        });
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "add-patient": {
      try {
        const resp = await labDB.addPatient(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "delete-patient": {
      try {
        const resp = await labDB.deletePatient(arg.id);
        event.reply("asynchronous-reply", { success: true, changes: resp.changes });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }
    // case "update": // { doc: "patients", data : {}, query: "insert" }
    //   db[arg.doc].update(arg.condition, arg.data, {}, (err) => {
    //     if (err) return;
    //     db[arg.doc].find(arg.condition, function (err, docs) {
    //       event.reply("asynchronous-reply", { err, row: docs[0] });
    //     });
    //   });
    //   break;

    case "find": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }
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
        event.reply("asynchronous-reply", { err, res });
      });
      break;
    case "getUUID": // { doc: "patients", search : {}, query: "find", skip: 0, limit: 100 }
      let UUID = machineIdSync(true);
      event.reply("asynchronous-reply", { UUID });
      break;
    default:
      break;
  }
});
