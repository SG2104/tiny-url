import { connectToDB } from "./libs/db";
import db from "./libs/db";
import fs from "fs";
import path from "path";

const runMigration = async () => {
    try {
        await connectToDB();
        const sqlPath = path.join(__dirname, "../sql/migration.sql");
        const sql = fs.readFileSync(sqlPath, "utf-8");

        console.log("Running migration...");
        await db.query(sql);
        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

runMigration();
