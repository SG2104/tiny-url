import { Client } from "pg";
import { DB_CONFIG } from "./appConfig";
import { Pool } from "pg";

const client = new Client(DB_CONFIG);

export const connectToDB = async () => {
  try {
    // Connect to the PostgreSQL database
    await client.connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
  } finally {
    await client.end();
  }
};

const db = new Pool(DB_CONFIG);

export default db;