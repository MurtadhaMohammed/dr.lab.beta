const path = require("path");
const fs = require("fs");
const { app, dialog } = require("electron");
const Database = require("better-sqlite3");
const dayjs = require("dayjs");

class LabDB {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath("userData"), "drlab.db");
    this.init();
  }

  async init() {
    // const isMac = os.platform() === "darwin";
    // const dbPath = app.getPath("userData") + "drlab.db";
    // const dbPath = path.join(app.getPath("userData"), "drlab.db");
    try {
      await this.handlePendingImport();
      this.db = new Database(this.dbPath, {
        // verbose: console.log,
      });
      this.db.pragma("journal_mode = WAL");
      console.log("Database opened successfully");
      this.initializeDatabase();
      this.initTestsFromJSON();
      this.checkAndAddVisitNumberColumn();
      this.migrateVisitsTableWithDoctorForeignKey();
      console.log(
        "LabDB initialized, db object:",
        this.db ? "exists" : "does not exist"
      );
      if (this.db) {
        console.log("Available collections:", Object.keys(this.db));
      }
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

      CREATE TABLE IF NOT EXISTS doctors(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        type TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientID INTEGER,
        doctorID INTEGER,
        visitNumber VARCHAR(6),
        status TEXT DEFAULT "PENDING" NOT NULL,
        testType VARCHAR(50),
        tests TEXT,
        discount INTEGER,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patientID) REFERENCES patients(id)
        FOREIGN KEY(doctorID) REFERENCES doctors(id)
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

  async checkAndAddVisitNumberColumn() {
    try {
      // Check if the visits table has the visitNumber column
      const columnCheckStmt = this.db.prepare(`
        PRAGMA table_info(visits)
      `);
      const columns = columnCheckStmt.all();

      const hasVisitNumberColumn = columns.some(
        (column) => column.name === "visitNumber"
      );

      if (!hasVisitNumberColumn) {
        // Alter the table to add the visitNumber column if it doesn't exist
        this.db.exec(`
          ALTER TABLE visits ADD COLUMN visitNumber VARCHAR(6)
        `);
        console.log("visitNumber column added successfully");
      } else {
        console.log("visitNumber column already exists");
      }
    } catch (error) {
      console.error("Error checking or adding visitNumber column:", error);
    }
  }

  async migrateVisitsTableWithDoctorForeignKey() {
    try {
      // Step 1: Enable foreign keys
      this.db.prepare(`PRAGMA foreign_keys = ON;`).run();

      // Step 2: Check if doctorID column already exists
      const columns = this.db.prepare(`PRAGMA table_info(visits);`).all();
      const hasDoctorID = columns.some((col) => col.name === "doctorID");

      if (hasDoctorID) {
        console.log("✅ doctorID column already exists, skipping migration.");
        return;
      }

      this.db.transaction(() => {
        // Step 3: Rename the existing table
        this.db.prepare(`ALTER TABLE visits RENAME TO visits_old;`).run();

        // Step 4: Create the new table with foreign key constraint
        this.db
          .prepare(
            `
            CREATE TABLE visits (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              patientID INTEGER,
              doctorID INTEGER,
              visitNumber VARCHAR(6),
              status TEXT DEFAULT "PENDING" NOT NULL,
              testType VARCHAR(50),
              tests TEXT,
              discount INTEGER,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(patientID) REFERENCES patients(id),
              FOREIGN KEY(doctorID) REFERENCES doctors(id)
            );
        `
          )
          .run();

        // Step 5: Copy data from the old table
        const oldColumns = columns.map((col) => col.name).join(", ");
        const newColumns = oldColumns + ", NULL"; // doctorID is not in the old table

        this.db
          .prepare(
            `
          INSERT INTO visits (
            id, patientID, doctorID, visitNumber, status, testType, tests, discount, updatedAt, createdAt
          )
          SELECT
            id, patientID, NULL, visitNumber, status, testType, tests, discount, updatedAt, createdAt
          FROM visits_old;
        `
          )
          .run();

        // Step 6: Drop old table
        this.db.prepare(`DROP TABLE visits_old;`).run();

        console.log("✅ visits table migrated with doctorID foreign key.");
      })();
    } catch (err) {
      console.error("❌ Migration failed:", err.message);
    }
  }

  async initTestsFromJSON() {
    try {
      const testCountStet = this.db.prepare(`
        SELECT COUNT(*) as total FROM tests
      `);
      const { total } = testCountStet.get();

      if (total === 0) {
        const jsonPath = path.join(__dirname, "tests.json");
        const jsonGroupPath = path.join(__dirname, "groups.json");

        if (!fs.existsSync(jsonPath) || !fs.existsSync(jsonGroupPath)) {
          throw new Error("One or both JSON files are missing");
        }

        const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        const jsonGroupData = JSON.parse(
          fs.readFileSync(jsonGroupPath, "utf-8")
        );

        const insertStmt = this.db.prepare(`
          INSERT INTO tests (id, name, price, normal, options, isSelecte)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const insertTransaction = this.db.transaction((data) => {
          for (const item of data) {
            const normalValue = item.normal
              ? item.normal.replace(/\\n/g, "\n")
              : null;
            insertStmt.run(
              Number(item.id),
              item.name,
              Number(item.price),
              normalValue,
              item.options,
              Number(item.isSelected)
            );
          }
        });

        insertTransaction(jsonData);

        for (const item of jsonGroupData) {
          await this.addPackage({
            title: item?.groupname,
            customePrice: 0,
            tests: item?.testIds?.map((id) => ({ id })),
          });
        }

        console.log("Tests imported from tests.json");
      } else {
        console.log("Tests table is not empty, skipping import");
      }
    } catch (error) {
      console.error("Error importing tests from JSON:", error);
    }
  }
  async addUniqueVisitNumber(visitId) {
    try {
      // First, check if the visitNumber already exists for the given visitId
      const selectStmt = this.db.prepare(`
        SELECT visitNumber FROM visits WHERE id = ?
      `);
      const result = selectStmt.get(visitId);

      // If visitNumber exists, return it
      if (result && result.visitNumber) {
        return result.visitNumber;
      }

      // If visitNumber doesn't exist, generate a unique 6-digit number
      const visitNumber = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Update the visit record with the generated visitNumber
      const updateStmt = this.db.prepare(`
        UPDATE visits
        SET visitNumber = ?
        WHERE id = ?
      `);
      updateStmt.run(visitNumber, visitId);

      return visitNumber;
    } catch (error) {
      console.error("Error updating visit with visitNumber:", error);
      return null;
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
    const checkVisitsStmt = await this.db.prepare(`
      DELETE FROM visits WHERE patientID = ?
    `);
    const visits = await checkVisitsStmt.run(id);

    const deletePatientStmt = await this.db.prepare(`
      DELETE FROM patients WHERE id = ?
    `);

    const info = await deletePatientStmt.run(id);

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

  async getDoctors({ q = "", skip = 0, limit = 10 }) {
    try {
      // Prepare the query to count the total number of doctors
      const countStmt = await this.db.prepare(`
      SELECT COUNT(*) as total
      FROM doctors
      WHERE name LIKE ?
    `);

      const countResult = countStmt.get(`%${q}%`);
      const total = countResult?.total || 0;

      const stmt = await this.db.prepare(`
      SELECT * FROM doctors
      WHERE name LIKE ?
      ORDER BY doctors.id DESC
      LIMIT ? OFFSET ?
    `);

      const doctors = stmt.all(`%${q}%`, limit, skip);

      return { success: true, total, data: doctors };
    } catch (error) {
      console.log(error);
    }
  }

  async addDoctor(doctors) {
    try {
      const stmt = await this.db.prepare(`
        INSERT INTO doctors (name, gender, email, phone, address, type)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        doctors.name,
        doctors.gender,
        doctors.email,
        doctors.phone,
        doctors.address,
        doctors.type
      );
      return { id: info.lastInsertRowid };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteDoctor(id) {
    const deleteDoctorStmt = await this.db.prepare(`
      DELETE FROM doctors WHERE id = ?
    `);

    const info = await deleteDoctorStmt.run(id);

    return { success: info.changes > 0, rowsDeleted: info.changes };
  }

  async updateDoctor(id, updates) {
    const { name, gender, email, phone, address, type } = updates;
    const stmt = await this.db.prepare(`
    UPDATE doctors
    SET 
    name = COALESCE(?,name),
    gender = COALESCE(?, gender),
    email = COALESCE(?, email),
    phone = COALESCE(?, phone),
    address = COALESCE(?, address),
    type = COALESCE(?, type),
    updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
    `);
    const info = stmt.run(name, gender, email, phone, address, type, id);

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
      ORDER BY createdAt DESC
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
      ORDER BY createdAt DESC
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
    const { patientID, doctorID, status, testType, tests, discount } = data;
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
        INSERT INTO visits (patientID, doctorID, status, testType, tests, discount)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = insertStmt.run(
        patientID,
        doctorID,
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

  async getVisits({
    q = "",
    skip = 0,
    limit = 10,
    startDate,
    endDate,
    status,
  }) {
    const whereClauses = [
      `(p.name LIKE ? OR v.visitNumber LIKE ?)`,
      startDate
        ? `DATE(v.createdAt) >= '${dayjs(startDate)
            .startOf("day")
            .toISOString()}'`
        : "",
      endDate
        ? `DATE(v.createdAt) <= '${dayjs(endDate).endOf("day").toISOString()}'`
        : "",
      status && `v.status = '${status}'`,
    ]
      .filter(Boolean)
      .join(" AND ");

    const countStmt = await this.db.prepare(`
      SELECT COUNT(*) as total
      FROM visits v
      JOIN patients p ON v.patientID = p.id
      WHERE ${whereClauses}
    `);

    const countResult = countStmt.get(`%${q}%`, `%${q}%`);
    const total = countResult?.total || 0;

    const stmt = await this.db.prepare(`
      SELECT 
        v.*, 
        p.name as patientName, 
        p.gender as patientGender, 
        p.phone as patientPhone, 
        p.email as patientEmail, 
        p.birth as patientBirth,
        d.id as doctorID,
        d.name as doctorName, 
        d.gender as doctorGender, 
        d.phone as doctorPhone, 
        d.email as doctorEmail, 
        d.address as doctorAddress, 
        d.type as doctorType
      FROM visits v
      JOIN patients p ON v.patientID = p.id
      LEFT JOIN doctors d ON v.doctorID = d.id
      WHERE ${whereClauses}
      ORDER BY v.createdAt DESC
      LIMIT ${limit} OFFSET ${skip}
    `);

    const visits = stmt.all(`%${q}%`, `%${q}%`);

    const results = visits?.map((el) => {
      const doctorData = el?.doctorID
        ? {
            id: el?.doctorID,
            name: el?.doctorName,
            gender: el?.doctorGender,
            phone: el?.doctorPhone,
            email: el?.doctorEmail,
            address: el?.doctorAddress,
            type: el?.doctorType,
          }
        : null;

      return {
        id: el?.id,
        tests: JSON.parse(el?.tests) || [],
        testType: el?.testType,
        status: el?.status,
        discount: el?.discount,
        createdAt: el?.createdAt,
        updatedAt: el?.updatedAt,
        visitNumber: el?.visitNumber,
        patient: {
          id: el?.patientID,
          name: el?.patientName,
          gender: el?.patientGender,
          phone: el?.patientPhone,
          email: el?.patientEmail,
          birth: el?.patientBirth,
        },
        doctor: doctorData,
      };
    });

    return { success: true, total, data: results };
  }

  async getTestNormalValues(testType, testsFromVisit) {
    let testIds =
      testType === "PACKAGE"
        ? testsFromVisit.map((pkg) => pkg.tests.map((test) => test.id)).flat()
        : testsFromVisit.map((el) => el.id);

    const placeholders = testIds.map(() => "?").join(",");
    const stmtTests = await this.db.prepare(`
          SELECT t.*
          FROM tests t
          WHERE t.id IN (${placeholders})
        `);

    const tests = stmtTests.all(...testIds);
    let newTests = testsFromVisit.map((el) => {
      if (testType === "PACKAGE") {
        el.tests = el.tests.map((pkg) => {
          pkg.normal = tests.find((t) => t.id === pkg.id)?.normal;
          return pkg;
        });
      } else {
        el.normal = tests.find((t) => t.id === el.id)?.normal;
      }
      return el;
    });

    return newTests;
  }

  async getTotalVisits({ startDate, endDate }) {
    const whereClauses = [
      startDate
        ? `DATE(v.createdAt) >= '${dayjs(startDate)
            .startOf("day")
            .toISOString()}'`
        : "",
      endDate
        ? `DATE(v.createdAt) <= '${dayjs(endDate)
            .startOf("day")
            .toISOString()}'`
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

    const countResult = countStmt.get();
    const total = countResult?.total || 0;

    return { success: true, total };
  }

  async getVisitByPatient(patientId) {
    const stmt = await this.db.prepare(`
      SELECT 
        v.*, 
        p.name as patientName, 
        p.gender as patientGender, 
        p.phone as patientPhone, 
        p.email as patientEmail,  
        p.birth as patientBirth,
        d.id as doctorID,
        d.name as doctorName, 
        d.gender as doctorGender, 
        d.phone as doctorPhone, 
        d.email as doctorEmail, 
        d.address as doctorAddress, 
        d.type as doctorType
      FROM visits v
      JOIN patients p ON v.patientID = p.id
      LEFT JOIN doctors d ON v.doctorID = d.id
      WHERE v.patientID = ?
      ORDER BY v.createdAt DESC
    `);

    const visits = stmt.all(patientId);

    const results = visits?.map((el) => {
      const doctorData = el?.doctorID
        ? {
            id: el?.doctorID,
            name: el?.doctorName,
            gender: el?.doctorGender,
            phone: el?.doctorPhone,
            email: el?.doctorEmail,
            address: el?.doctorAddress,
            type: el?.doctorType,
          }
        : null;

      return {
        id: el?.id,
        tests: JSON.parse(el?.tests) || [],
        testType: el?.testType,
        status: el?.status,
        discount: el?.discount,
        createdAt: el?.createdAt,
        updatedAt: el?.updatedAt,
        visitNumber: el?.visitNumber,
        patient: {
          id: el?.patientID,
          name: el?.patientName,
          gender: el?.patientGender,
          phone: el?.patientPhone,
          email: el?.patientEmail,
          birth: el?.patientBirth,
        },
        doctor: doctorData,
      };
    });

    return { success: true, data: results };
  }

  async getVisitByDoctor(doctorId, startDate = null, endDate = null) {
    const whereClauses = [
      `v.doctorID = ?`, // always filter by doctorId
      startDate
        ? `DATE(v.createdAt) >= '${dayjs(startDate)
            .startOf("day")
            .toISOString()}'`
        : "",
      endDate
        ? `DATE(v.createdAt) <= '${dayjs(endDate)
            .endOf("day")
            .toISOString()}'`
        : "",
    ]
      .filter(Boolean)
      .join(" AND ");

    const stmt = await this.db.prepare(`
    SELECT 
      v.*, 
      p.name as patientName, 
      p.gender as patientGender, 
      p.phone as patientPhone, 
      p.email as patientEmail,  
      p.birth as patientBirth,
      d.id as doctorID,
      d.name as doctorName, 
      d.gender as doctorGender, 
      d.phone as doctorPhone, 
      d.email as doctorEmail, 
      d.address as doctorAddress, 
      d.type as doctorType
    FROM visits v
    JOIN patients p ON v.patientID = p.id
    LEFT JOIN doctors d ON v.doctorID = d.id
    WHERE ${whereClauses}
    ORDER BY v.createdAt DESC
  `);

    const visits = stmt.all(doctorId);

    const results = visits?.map((el) => {
      const doctorData = el?.doctorID
        ? {
            id: el?.doctorID,
            name: el?.doctorName,
            gender: el?.doctorGender,
            phone: el?.doctorPhone,
            email: el?.doctorEmail,
            address: el?.doctorAddress,
            type: el?.doctorType,
          }
        : null;

      return {
        id: el?.id,
        tests: JSON.parse(el?.tests) || [],
        testType: el?.testType,
        status: el?.status,
        discount: el?.discount,
        createdAt: el?.createdAt,
        updatedAt: el?.updatedAt,
        visitNumber: el?.visitNumber,
        patient: {
          id: el?.patientID,
          name: el?.patientName,
          gender: el?.patientGender,
          phone: el?.patientPhone,
          email: el?.patientEmail,
          birth: el?.patientBirth,
        },
        doctor: doctorData,
      };
    });

    return { success: true, data: results };
  }

  async updateVisit(id, data) {
    const { patientID, doctorID, status, testType, tests, discount } = data;

    let newTests = await this.getTestNormalValues(testType, tests);

    const testsStr = JSON.stringify(newTests);

    const stmt = this.db.prepare(`
      UPDATE visits
      SET 
        patientID = COALESCE(?, patientID),
        doctorID = COALESCE(?, doctorID),
        status = COALESCE(?, status),
        testType = COALESCE(?, testType),
        tests = COALESCE(?, tests),
        discount = COALESCE(?, discount),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(
      patientID,
      doctorID,
      status,
      testType,
      testsStr,
      discount,
      id
    );

    return { success: info.changes > 0, newTests };
  }

  async getVisitDetails(visitId) {
    try {
      if (!this.db) {
        console.error("Database not initialized");
        return null;
      }
      console.log(`Attempting to fetch visit with id: ${visitId}`);

      const stmt = await this.db.prepare(`
        SELECT v.*, p.name as patientName
        FROM visits v
        JOIN patients p ON v.patientID = p.id
        WHERE v.id = ?
      `);

      const visit = stmt.get(visitId);
      console.log("Raw visit data:", JSON.stringify(visit, null, 2));

      if (visit) {
        return {
          id: visit.id,
          visitNumber: visit.visitNumber,
          patient: {
            name: visit.patientName,
          },
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching visit details:", error);
      return null;
    }
  }

  async exportAllData() {
    try {
      const patients = await this.getPatients({ q: "", skip: 0, limit: 1000 });
      const visits = await this.getVisits({ q: "", skip: 0, limit: 1000 });
      const tests = await this.getTests({ q: "", skip: 0, limit: 1000 });
      const packages = await this.getPackages({ q: "", skip: 0, limit: 1000 });

      return {
        patients: patients,
        visits: visits,
        tests: tests,
        packages: packages,
      };
    } catch (error) {
      console.error("Error exporting all data:", error);
      throw error;
    }
  }

  async exportDatabase() {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Export SQLite Database",
      defaultPath: "drlab-backup.sql",
      filters: [{ name: "SQLite Database", extensions: ["sqlite3", "db"] }],
    });

    if (canceled || !filePath) {
      return {
        success: false,
        message: "Export canceled.",
      };
    }
    try {
      await this.db.backup(filePath);

      return {
        success: true,
        message: "Database exported.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Export failed !.",
      };
    }
  }

  async importDatabase() {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: "Import SQLite Database",
      properties: ["openFile"],
      filters: [{ name: "SQLite Database", extensions: ["sqlite3", "db"] }],
    });

    if (canceled || !filePaths) {
      return {
        success: false,
        message: "Export canceled.",
      };
    }

    const { response } = await dialog.showMessageBox({
      type: "question",
      buttons: ["Restart Now", "Cancel"],
      defaultId: 0,
      cancelId: 1,
      title: "Restart Required",
      message:
        "To complete the import, the app needs to restart.\nDo you want to restart now?",
    });

    if (response !== 0) {
      return { success: false, message: "Restart canceled by user." };
    }
    const pendingPath = path.join(
      path.dirname(this.dbPath),
      "drlab.import-pending.db"
    );
    try {
      const importPath = filePaths[0];
      fs.copyFileSync(importPath, pendingPath);
      app.relaunch();
      app.exit(0);
      return;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Import failed !.",
      };
    }
  }

  async handlePendingImport() {
    const dir = path.dirname(this.dbPath);
    const pendingPath = path.join(dir, "drlab.import-pending.db");

    try {
      fs.accessSync(pendingPath);
      fs.copyFileSync(pendingPath, this.dbPath);
      fs.unlinkSync(pendingPath);

      console.log("✅ Imported pending database on startup.");
      return true;
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error("❌ Failed to apply pending import:", err);
      }
      return false;
    }
  }
}

module.exports = { LabDB };
