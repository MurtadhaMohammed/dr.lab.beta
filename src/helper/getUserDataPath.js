function getUserDataPath(fileName = "drlab.db") {
  const fileName = "drlab.db";
  const dbPath = path.join(app.getPath("userData"), fileName);

  try {
    if (fs.existsSync(dbPath)) return path.resolve(dbPath);
    else return null;
  } catch (error) {
    console.error("❌ Error checking for database file:", error);
    return null;
  }
}

module.exports = { getUserDataPath };
