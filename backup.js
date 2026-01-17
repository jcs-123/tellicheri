// backup.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // Load variables from .env

const MONGO_URI = process.env.MONGO_URI;

async function backupDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    const conn = await mongoose.connect(MONGO_URI);
    const db = conn.connection.db;

    console.log(`✅ Connected to database: ${db.databaseName}`);

    // 🕒 Format current date and time
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

    // 📁 Define backup directory paths
    const mainBackupDir = path.join("C:\\", "backup");
    const subFolder = `Thellicheri_Database_${date}_${time}`;
    const backupDir = path.join(mainBackupDir, subFolder);

    // 📂 Create folders if missing
    if (!fs.existsSync(mainBackupDir)) fs.mkdirSync(mainBackupDir, { recursive: true });
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    console.log(`📁 Backup folder created at: ${backupDir}`);

    // 🔁 Fetch all collections
    const collections = await db.listCollections().toArray();

    // 🧩 Export each collection to a JSON file
    for (const coll of collections) {
      const name = coll.name;
      console.log(`📦 Exporting collection: ${name}`);

      const data = await db.collection(name).find({}).toArray();
      const filePath = path.join(backupDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      console.log(`✅ Saved ${data.length} records → ${filePath}`);
    }

    console.log(`\n🎉 Backup complete! All data saved in folder: ${backupDir}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Backup failed:", err.message);
    process.exit(1);
  }
}

backupDatabase();
