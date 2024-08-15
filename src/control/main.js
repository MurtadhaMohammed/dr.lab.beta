const { ipcMain } = require("electron");
var { createPDF, printReport, createPDFBlob } = require("../../initPDF");
const { machineIdSync } = require("node-machine-id");
const { LabDB } = require("./db");
const { app } = require("electron");
const fs = require("fs");
const path = require('path');
const image = path.join(__dirname, '../../defaultHeader.jpg');

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
    case "addMultiplePatients": {
      try {
        // Function to generate dummy patient data
        function generatePatient(index) {
          return {
            name: `Patient ${index}`,
            gender: index % 2 === 0 ? 'Male' : 'Female',
            email: `patient${index}@example.com`,
            phone: `123-456-789${index % 10}`,
            birth: `1990-01-${String(index % 28 + 1).padStart(2, '0')}`, // Random day in January
          };
        }

        // Function to add multiple patients
        async function addMultiplePatients() {
          for (let i = 0; i < 100000; i++) {
            const patient = generatePatient(i);
            await labDB.addPatient(patient); // You can handle individual errors here if needed
          }
        }

        await addMultiplePatients();
        event.reply("asynchronous-reply", { success: true, message: "100,000 patients added successfully" });
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
        const resp = await labDB.updateVisit(arg.id, arg.data);
        event.reply("asynchronous-reply", { success: resp.success });
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
        event.reply("asynchronous-reply", { err, res });
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

    default:
      break;
  }
});
