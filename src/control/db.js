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
        // verbose: console.log,
      });
      this.db.pragma("journal_mode = WAL");
      console.log("Database opened successfully");
      // this.initializeDatabase();
    } catch (err) {
      console.error("Error opening database", err);
    }
  }

  initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS patients(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        birth DATE NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS visits(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientID INTEGER,
        status TEXT DEFAULT "PENDING" NOT NULL,
        testType VARCHAR(50),
        tests TEXT,
        discount INTEGER,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientID) REFERENCES patients(id)
      );
      CREATE TABLE IF NOT EXISTS tests(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50),
        price INTEGER, 
        normal TEXT,
        result VARCHAR(100),
        options TEXT,
        isSelected BOOLEAN,
        createdAt TIMESTAMP,
        updatedAt TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS packages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(100),
        customePrice INTEGER,
        createdAt TIMESTAMP,
        updatedAt TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS test_to_packages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        packageID INTEGER,
        testID INTEGER,
        FOREIGN KEY (packageID) REFERENCES packages(id),
        FOREIGN KEY (testID) REFERENCES tests(id)
      );
    `);
  }

  async getPatients({ skip, limit }) {
    const stmt = await this.db.prepare(`
      SELECT * FROM patients
      LIMIT ? OFFSET ?
    `);
    const patients = stmt.all(limit, skip);
    return { data: patients };
  }

  async addPatient(patient) {
    const stmt = await this.db.prepare(`
      INSERT INTO patients (name, gender, email, phone, birth)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(patient.name, patient.gender, patient.email, patient.phone, new Date(patient.birth).toISOString());
    return { id: info.lastInsertRowid };
  }

  async deletePatient(id) {
    const stmt = await this.db.prepare(`
  DELETE FROM patients WHERE id=1`);

    const info = stmt.run(id);
    return { changes: info.changes };
  }
}

module.exports = { LabDB };

