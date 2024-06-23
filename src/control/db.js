const path = require("path");
const os = require("os");
const { app } = require("electron");
const Database = require("better-sqlite3");

class LabDB {
  constructor() {
    const isMac = os.platform() === "darwin";
    const dbPath = !app.isPackaged
      ? "database.sql"
      : path.join(
          app.getAppPath(),
          isMac ? "../../../../database.sql" : "../../database.sql"
        );

    try {
      this.db = new Database(dbPath, {
        verbose: console.log,
      });
      this.db.pragma("journal_mode = WAL");
      console.log("Database opened successfully");
      //this.initializeDatabase()
    } catch (err) {
      console.error("Error opening database", err);
    }
  }

  initializeDatabase() {
    this.db.exec(`
          CREATE TABLE IF NOT EXISTS foo (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ...
        );
      
        CREATE TABLE IF NOT EXISTS bar (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ....
        `);
  }

  async getPatients({ skip, limit }) {
    return { data: "All Data" };
  }
}

module.exports = { LabDB };
