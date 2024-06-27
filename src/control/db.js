const path = require("path");
const os = require("os");
const { app } = require("electron");
const Database = require("better-sqlite3");
const { log } = require("console");

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
        FOREIGN KEY (packageID) REFERENCES packages(id) ON DELETE CASCADE,
        FOREIGN KEY (testID) REFERENCES tests(id) ON DELETE CASCADE
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
      INSERT INTO tests (name, price, normal, options, isSelected)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(test.name, test.price, test.normal, JSON.stringify(test.options), test.isSelected);
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
    const { name, price, normal, options, isSelected } = updates;

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

  async addPackage(arg) {
    if (!Array.isArray(arg.data.testIDs)) {
      throw new TypeError('testIDs is not iterable');
    }
    const { title, customePrice, testIDs } = arg.data;

    const packageStmt = this.db.prepare(`
      INSERT INTO packages (title, customePrice)
      VALUES (?, ?)
    `);
    const packageInfo = packageStmt.run(title, customePrice);
    const packageID = packageInfo.lastInsertRowid;

    const testToPackageStmt = this.db.prepare(`
      INSERT INTO test_to_packages (packageID, testID)
      VALUES (?, ?)
    `);
    const testToPackageTransaction = this.db.transaction((testIDs) => {
      for (const testID of testIDs) {
        testToPackageStmt.run(packageID, testID);
      }
    });
    testToPackageTransaction(testIDs);

    return { data: packageID };
  }

  async deletePackage(packageID) {
    const deletePackageStmt = await this.db.prepare(`
      DELETE FROM packages
      WHERE id = ?
    `);
    const info = deletePackageStmt.run(packageID);
    if (info.changes > 0) {
      const deleteTestToPackage = await this.db.prepare(`
         DELETE FROM test_to_packages WHERE packageID = ?
        `)

      deleteTestToPackage.run(packageID);

      return { success: true, message: `Package with ID ${packageID} deleted successfully.` };
    } else {
      throw new Error(`Package with ID ${packageID} not found.`);
    }
  }

  async editPackage(arg) {
    const { id, title, customePrice, testIDs } = arg;

    if (!Array.isArray(testIDs)) {
      throw new TypeError('testIDs is not iterable');
    }

    const transaction = this.db.transaction(() => {
      // Update the package details
      const packageStmt = this.db.prepare(`
        UPDATE packages
        SET title = ?, customePrice = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      packageStmt.run(title, customePrice, id);

      // Delete existing test associations for the package
      const deleteTestToPackage = this.db.prepare(`
        DELETE FROM test_to_packages WHERE packageID = ?
      `);
      deleteTestToPackage.run(id);

      // Insert new test associations
      const testToPackage = this.db.prepare(`
        INSERT INTO test_to_packages (packageID, testID)
        VALUES (?, ?)
      `);
      for (const testID of testIDs) {
        testToPackage.run(id, testID);
      }
    });

    try {
      transaction();
      return { success: true, message: `Package with ID ${id} updated successfully.` };
    } catch (error) {
      throw new Error(`Failed to update package with ID ${id}: ${error.message}`);
    }
  }

  async getPackages({ q = "", skip = 0, limit = 10 }) {
    const stmt = await this.db.prepare(`
      SELECT * FROM packages
      WHERE title LIKE ?
      LIMIT ? OFFSET ?
      `);
    const packages = stmt.all(`%${q}%`, limit, skip);
    const packagesWithTests = packages.map(pkg => {
      const testStmt = this.db.prepare(`
          SELECT t.*
          FROM tests t
          INNER JOIN test_to_packages tp ON t.id = tp.testID
          WHERE tp.packageID = ?
          `);
      const tests = testStmt.all(pkg.id);
      return { ...pkg, tests }
    })
    return { data: packagesWithTests };
  }


  addVisit(data) {
    try {
      const { patientID, status, testType, tests, discount } = data;
      const testsStr = JSON.stringify(tests);
      const stmt = this.db.prepare(`
        INSERT INTO visits (patientID, status, testType, tests, discount)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(patientID, status, testType, testsStr, discount);
      return { id: info.lastInsertRowid };
    } catch (error) {
      this.handleDatabaseError(error, 'addVisit');
    }
  }

  async deleteVisit(id) {
    const stmt = await this.db.prepare(`
      DELETE FROM visits WHERE id = ?
    `);

    const info = stmt.run(id);
    return { success: info.changes > 0 };
  }

  async getVisits({ q = "", skip = 0, limit = 10 }) {
    const stmt = await this.db.prepare(`
      SELECT v.*, p.name as patientName
      FROM visits v
      JOIN patients p ON v.patientID = p.id
      WHERE p.name LIKE ?
      LIMIT ? OFFSET ?
    `);
    const visits = stmt.all(`%${q}%`, limit, skip);
    return { data: visits };
  }

  async updateVisit(id, update) {
    const { patientID, status, testType, tests, discount } = update;

    const stmt = await this.db.prepare(`
    UPDATE visits
    SET 
    patientID = COALESCE(?, patientID),
      status = COALESCE(?, status),
      testType = COALESCE(?, testType),
      tests = COALESCE(?, tests),
      discount = COALESCE(?, discount),
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
    `);
    const info = stmt.run(patientID, status, testType, tests, discount, id);
    return { success: info.changes > 0 }
  }

}




module.exports = { LabDB };

