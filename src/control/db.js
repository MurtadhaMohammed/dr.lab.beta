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
      this.initializeDatabase();
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
        options TEXT,
        isSelected BOOLEAN,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS packages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(100),
        customePrice INTEGER,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  async getPatients({ q = "", skip = 0, limit = 10 }) {
    const stmt = await this.db.prepare(`
      SELECT * FROM patients
     WHERE name LIKE ?
      LIMIT ? OFFSET ? 
    `);
    const patients = stmt.all(`%${q}%`, limit, skip);
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
  DELETE FROM patients WHERE id =? `);

    const info = stmt.run(id);
    return { data: info.data };
  }
  async updatePatient(id, updates) {
    const { name, gender, email, phone, birth } = updates;
    const stmt = await this.db.prepare(`
    UPDATE patients
    SET 
    name = COALESCE(?,name),
    gender = COALESCE(?, gender),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        birth = COALESCE(?, birth),
        updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    const info = stmt.run(name, gender, email, phone, birth ? new Date(birth).toISOString() : null, id)
    return { data: info.changes > 0 };
  }

  async searchPatient(name) {
    const stmt = await this.db.prepare(`
    SELECT * FROM patients
    WHERE name LIKE ?
    `);
    const patient = stmt.all(`%${name}%`)
    return { data: patient }
  }

  async addTest(test) {
    const stmt = await this.db.prepare(`
      INSERT INTO tests (name, price, normal, result, options, isSelected)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(test.name, test.price, test.normal, test.result, JSON.stringify(test.options), test.isSelected);
    return { id: info.lastInsertRowid };
  }

  async deleteTest(id) {
    const stmt = await this.db.prepare(`
      DELETE FROM tests WHERE id = ?
    `);
    const info = stmt.run(id);
    return { success: info.changes > 0 };
  }

  async editTest(id, updates) {
    const { name, price, normal, result, options, isSelected } = updates;

    const stmt = await this.db.prepare(`
      UPDATE tests
      SET 
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        normal = COALESCE(?, normal),
        options = COALESCE(?, options), 
        isSelected = COALESCE(?, isSelected),
        updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `);


    const info = stmt.run(
      name,
      price,
      normal,
      options ? JSON.stringify(options) : "",
      isSelected !== undefined ? (isSelected ? 1 : 0) : null,
      id
    );
    return { success: info.changes > 0 };
  }

  async getTests({ q = "", skip = 0, limit = 10 }) {
    const stmt = await this.db.prepare(`
      SELECT * FROM tests
      WHERE name LIKE ?
      LIMIT ? OFFSET ? 
    `);
    const tests = stmt.all(`%${q}%`, limit, skip);
    return { data: tests };
  }

  // async addPackage(packageData) {
  //   const { title, customePrice, testIDs } = packageData;
  //   const transaction = this.db.transaction(() => {
  //     const insertPackageStmt = this.db.prepare(`
  //       INSERT INTO packages (title, customePrice)
  //       VALUES (?, ?)
  //     `);
  //     const packageInfo = insertPackageStmt.run(title, customePrice);
  //     const packageID = packageInfo.lastInsertRowid;
      


  //   })
  // }

}

module.exports = { LabDB };

