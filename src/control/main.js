const { ipcMain } = require("electron");
var { createPDF, printReport } = require("../../initPDF");
const { machineIdSync } = require("node-machine-id");
const sql = require("better-sqlite3")("foobar.db");
sql.pragma("journal_mode = WAL");

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
      // arg should be { skip, limit, query: "get-patients" }
      const resp = await labDB.getPatients({
        limit: arg?.limit || 10,
        skip: arg?.skip || 0,
      });

      event.reply("asynchronous-reply", resp);
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
