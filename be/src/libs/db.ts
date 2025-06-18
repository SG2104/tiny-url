import { Client } from "pg";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from "./config";
import { Pool } from "pg";

const client = new Client({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});
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


const db = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

export default db;