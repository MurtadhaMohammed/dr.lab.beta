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

    case "getPatients": {
      try {
        const resp = await labDB.getPatients({
          q: arg?.q || "",
          limit: arg?.limit || 10,
          skip: arg?.skip || 0,
        });
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "addPatient": {
      try {
        const resp = await labDB.addPatient(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "deletePatient": {
      try {
        const resp = await labDB.deletePatient(arg.id);
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "updatePatient": {
      try {
        const resp = await labDB.updatePatient(arg.id, arg.data);
        event.reply("asynchronous-reply", { success: true, data: resp.data })
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "searchPatient": {
      try {
        const resp = await labDB.searchPatient(arg.name);
        event.reply("asynchronous-reply", { success: true, data: resp.data })
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "addTest": {
      try {
        const resp = await labDB.addTest(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }


    case "deleteTest": {
      try {
        const resp = await labDB.deleteTest(arg.id);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "editTest": {
      try {
        const resp = await labDB.editTest(arg.id, arg.data);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "getTests": {
      try {
        const resp = await labDB.getTests(arg);
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "addPackage": {
      try {
        const resp = await labDB.addPackage(arg);
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "deletePackage": {
      try {
        const resp = await labDB.deletePackage(arg.data);
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "editPackage": {
      try {
        const resp = await labDB.editPackage(arg.data);  // Pass arg.data to editPackage
        event.reply("asynchronous-reply", { success: resp.success });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }

    case "getPackages": {
      try {
        const resp = await labDB.getPackages(arg.data);
        event.reply("asynchronous-reply", { success: true, data: resp.data });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
    }


    case "addVisit": {
      try {
        const resp = await labDB.addVisit(arg.data);
        event.reply("asynchronous-reply", { success: true, id: resp.id });
      } catch (error) {
        event.reply("asynchronous-reply", { success: false, error: error.message });
      }
      break;
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
