const path = require('path');
const os = require('os');
const fs = require('fs');
const { app } = require('electron');
const Database = require('better-sqlite3');

class LabDB {
  constructor() {
    const isMac = os.platform() === "darwin";
    const dbPath = !app.isPackaged
      ? "database.db"
      : path.join(
        app.getAppPath(),
        isMac ? "../../../../database.db" : "../../database.db"
      );
    try {
      this.db = new Database(dbPath, {
        // verbose: console.log,
      });
      this.db.pragma("journal_mode = WAL");
      console.log("Database opened successfully");
      this.initializeDatabase();
      this.initTestsFromCSV();
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
        email TEXT,
        phone TEXT NOT NULL,
        birth DATE NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

        CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientID INTEGER,
        status TEXT DEFAULT "PENDING" NOT NULL,
        testType VARCHAR(50),
        tests TEXT,
        discount INTEGER,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patientID) REFERENCES patients(id)
);

      CREATE TABLE IF NOT EXISTS tests(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50),
      price INTEGER, 
      normal TEXT,
      options TEXT,
      isSelecte INTEGER DEFAULT 0,
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
  async initTestsFromCSV() {
    try {
      const testCountStet = this.db.prepare(`
      SELECT COUNT(*) as total FROM tests
      `);
      const { total } = testCountStet.get();
      if (total === 0) {
        const csvPath = path.join(__dirname, 'tests.csv');
        const csvData = fs.readFileSync(csvPath, 'utf-8').trim().split('\n');

        const insertStmt = this.db.prepare(`
          INSERT INTO tests (name, price, normal, options, isSelecte)
          VALUES (?, ?, ?, ?, ?)
        `);

        const insertTransaction = this.db.transaction((lines) => {
          for (const line of lines) {
            const [name, price, normal, options, isSelecte] = line.split(',');
            insertStmt.run(name, Number(price), normal, options, Number(isSelecte));
          }
        });

        insertTransaction(csvData);

        console.log('Tests imported from tests.csv');
      } else {
        console.log('Tests table is not empty, skipping import');
      }
    } catch (error) {
      console.error('Error importing tests from CSV:', error);
    }
  }

  async getPatients({ q = "", skip = 0, limit = 10 }) {
    // Prepare the query to count the total number of patients
    const countStmt = await this.db.prepare(`
      SELECT COUNT(*) as total
      FROM patients
      WHERE name LIKE ?
    `);

    const countResult = countStmt.get(`%${q}%`);
    const total = countResult?.total || 0;

    const stmt = await this.db.prepare(`
      SELECT * FROM patients
      WHERE name LIKE ?
      ORDER BY patients.id DESC
      LIMIT ? OFFSET ?
    `);

    const patients = stmt.all(`%${q}%`, limit, skip);

    return { success: true, total, data: patients };
  }

  async addPatient(patient) {
    const stmt = await this.db.prepare(`
      INSERT INTO patients (name, gender, email, phone, birth)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      patient.name,
      patient.gender,
      patient.email,
      patient.phone,
      new Date(patient.birth).toISOString()
    );
    return { id: info.lastInsertRowid };
  }

  async deletePatient(id) {
    const stmt = await this.db.prepare(`
      DELETE FROM patients WHERE id = ?
    `);
    const info = stmt.run(id);
    return { success: info.changes > 0, rowsDeleted: info.changes };
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
    const info = stmt.run(
      name,
      gender,
      email,
      phone,
      birth ? new Date(birth).toISOString() : null,
      id
    );
    return { data: info.changes > 0 };
  }

  async addTest(test) {
    const { name, price, normal, options, isSelecte } = test;
    const stmt = this.db.prepare(`
      INSERT INTO tests (name, price, normal, options, isSelecte)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      name,
      price,
      normal,
      JSON.stringify(options),
      isSelecte ? 1 : 0
    );
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
    const { name, price, normal, options, isSelecte } = updates;

    const stmt = await this.db.prepare(`
      UPDATE tests
      SET 
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        normal = COALESCE(?, normal),
        options = COALESCE(?, options), 
        isSelecte = COALESCE(?, isSelecte),
        updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    const info = stmt.run(
      name,
      price,
      normal,
      options ? JSON.stringify(options) : "",
      isSelecte !== undefined ? (isSelecte ? 1 : 0) : null,
      id
    );
    return { success: info.changes > 0 };
  }

  async getTests({ q = "", skip = 0, limit = 10 }) {
    // Prepare the query to count the total number of tests
    const countStmt = await this.db.prepare(`
      SELECT COUNT(*) as total
      FROM tests
      WHERE name LIKE ?
    `);

    const countResult = countStmt.get(`%${q}%`);
    const total = countResult?.total || 0;

    // Prepare the query to get the paginated results
    const stmt = await this.db.prepare(`
      SELECT * FROM tests
      WHERE name LIKE ?
      LIMIT ? OFFSET ?
    `);

    const tests = stmt.all(`%${q}%`, limit, skip);

    return { success: true, total, data: tests };
  }

  async addPackage(data) {
    const { title, customePrice, tests } = data;

    if (!Array.isArray(tests)) {
      console.error("tests is not iterable:", tests);
      throw new TypeError("tests is not iterable");
    }

    const testIDs = tests.map((test) => test.id);

    const validTestIDs = [];
    for (const testID of testIDs) {
      const testExistsStmt = this.db.prepare(`
        SELECT id FROM tests WHERE id = ?
      `);
      const test = testExistsStmt.get(testID);
      if (test) {
        validTestIDs.push(testID);
      } else {
        console.warn(`Test ID ${testID} does not exist in the tests table.`);
      }
    }

    if (validTestIDs.length === 0) {
      throw new Error("No valid test IDs provided.");
    }

    const packageStmt = this.db.prepare(`
      INSERT INTO packages (title, customePrice)
      VALUES (?, ?)
    `);
    const packageInfo = packageStmt.run(title, customePrice);
    const packageID = packageInfo.lastInsertRowid;

    console.log(`Package added with ID: ${packageID}`);

    const testToPackageStmt = this.db.prepare(`
      INSERT INTO test_to_packages (packageID, testID)
      VALUES (?, ?)
    `);
    const testToPackageTransaction = this.db.transaction(() => {
      for (const testID of validTestIDs) {
        console.log(
          `Associating package ID ${packageID} with test ID ${testID}`
        );
        testToPackageStmt.run(packageID, testID);
      }
    });
    testToPackageTransaction();

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
        `);

      deleteTestToPackage.run(packageID);

      return {
        success: true,
        message: `Package with ID ${packageID} deleted successfully.`,
      };
    } else {
      throw new Error(`Package with ID ${packageID} not found.`);
    }
  }

  async editPackage(id, data) {
    try {
      const { title, customePrice } = data;
      const tests = data.tests.map((test) => test.id);

      const transaction = this.db.transaction(() => {
        const packageStmt = this.db.prepare(`
          UPDATE packages
          SET title = COALESCE(?, title), customePrice = COALESCE(?, customePrice), updatedAt = CURRENT_TIMESTAMP
          WHERE id = ? 
        `);

        // Ensure tests is an array, if it's empty then it should be null
        const testToPackage = this.db.prepare(`
          INSERT INTO test_to_packages (packageID, testID)
          VALUES (?, ?)
        `);

        packageStmt.run(title, customePrice, id);

        // Delete existing associations in 'test_to_packages' table for the package
        const deleteTestToPackage = this.db.prepare(
          "DELETE FROM test_to_packages WHERE packageID = ?"
        );
        deleteTestToPackage.run(id);

        // Insert new associations into 'test_to_packages' table
        for (const testID of tests) {
          testToPackage.run(id, testID);
        }
      });

      transaction();

      return {
        success: true,
        message: `Package with ID ${id} updated successfully.`,
      };
    } catch (error) {
      throw new Error(
        `Failed to update package with ID ${id}: ${error.message}`
      );
    }
  }

  async getPackages({ q = "", skip = 0, limit = 10 }) {
    // Prepare the query to count the total number of packages
    const countStmt = await this.db.prepare(`
      SELECT COUNT(*) as total
      FROM packages
      WHERE title LIKE ?
    `);

    const countResult = countStmt.get(`%${q}%`);
    const total = countResult?.total || 0;

    // Prepare the query to get the paginated results
    const stmt = await this.db.prepare(`
      SELECT * FROM packages
      WHERE title LIKE ?
      LIMIT ? OFFSET ?
    `);

    const packages = stmt.all(`%${q}%`, limit, skip);
    const packagesWithTests = packages.map((pkg) => {
      const testStmt = this.db.prepare(`
        SELECT t.*
        FROM tests t
        INNER JOIN test_to_packages tp ON t.id = tp.testID
        WHERE tp.packageID = ?
      `);
      const tests = testStmt.all(pkg.id);
      return { ...pkg, tests };
    });

    return { success: true, total, data: packagesWithTests };
  }

  async addVisit(data) {
    const { patientID, status, testType, tests, discount } = data;
    const testTypeStr = testType;
    const testsStr = JSON.stringify(tests);

    try {
      const patientCheckStmt = this.db.prepare(`
        SELECT id FROM patients WHERE id = ?
      `);
      const patientExists = patientCheckStmt.get(patientID);

      if (!patientExists) {
        throw new Error(`Patient with ID ${patientID} does not exist.`);
      }

      const insertStmt = this.db.prepare(`
        INSERT INTO visits (patientID, status, testType, tests, discount)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = insertStmt.run(
        patientID,
        status,
        testTypeStr,
        testsStr,
        discount
      );

      return { id: info.lastInsertRowid };
    } catch (error) {
      console.error("Error in addVisit:", error);
      throw new Error("Error adding visit");
    }
  }

  async deleteVisit(id) {
    const stmt = await this.db.prepare(`
      DELETE FROM visits WHERE id = ?
    `);

    const info = stmt.run(id);
    return { success: info.changes > 0 };
  }

  async getVisits({ q = "", skip = 0, limit = 10, startDate, endDate }) {
    const whereClauses = [
      `p.name LIKE ?`,
      startDate
        ? `DATE(v.createdAt) >= '${new Date(startDate).toISOString().split("T")[0]
        }'`
        : "",
      endDate
        ? `DATE(v.createdAt) <= '${new Date(endDate).toISOString().split("T")[0]
        }'`
        : "",
    ]
      .filter(Boolean)
      .join(" AND ");

    const countStmt = await this.db.prepare(`
      SELECT COUNT(*) as total
      FROM visits v
      JOIN patients p ON v.patientID = p.id
      WHERE ${whereClauses}
    `);

    const countResult = countStmt.get(`%${q}%`);
    const total = countResult?.total || 0;

    const stmt = await this.db.prepare(`
      SELECT v.*, p.name as patientName, p.gender as patientGender, p.phone as patientPhone, p.email as patientEmail, p.birth as patientBirth
      FROM visits v
      JOIN patients p ON v.patientID = p.id
      WHERE ${whereClauses}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `);

    const visits = stmt.all(`%${q}%`, limit, skip);
    const results = visits?.map((el) => ({
      id: el?.id,
      tests: JSON.parse(el?.tests) || [],
      testType: el?.testType,
      status: el?.status,
      discount: el?.discount,
      createdAt: el?.createdAt,
      updatedAt: el?.updatedAt,
      patient: {
        id: el?.patientID,
        name: el?.patientName,
        gender: el?.patientGender,
        phone: el?.patientPhone,
        email: el?.patientEmail,
        birth: el?.patientBirth,
      },
    }));

    return { success: true, total, data: results };
  }

  async getVisitByPatient(patientId) {
    const stmt = await this.db.prepare(`
      SELECT v.*, p.name as patientName, p.gender as patientGender, p.phone as patientPhone, p.email as patientEmail,  p.birth as patientBirth
      FROM visits v
      JOIN patients p ON v.patientId = p.id
      WHERE v.patientId = ?
      ORDER BY v.createdAt DESC
      `);

    const visits = stmt.all(patientId);
    const results = visits?.map((el) => ({
      id: el?.id,
      tests: JSON.parse(el?.tests) || [],
      testType: el?.testType,
      status: el?.status,
      discount: el?.discount,
      createdAt: el?.createdAt,
      updatedAt: el?.updatedAt,
      patient: {
        id: el?.patientID,
        name: el?.patientName,
        gender: el?.patientGender,
        phone: el?.patientPhone,
        email: el?.patientEmail,
        birth: el?.patientBirth,
      },
    }));

    return { success: true, data: results };
  }


  async updateVisit(id, update) {
    const { patientID, status, testType, tests, discount } = update;
    const testsStr = JSON.stringify(tests);

    const stmt = this.db.prepare(`
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
    const info = stmt.run(patientID, status, testType, testsStr, discount, id);
    return { success: info.changes > 0 };
  }

}

module.exports = { LabDB };
