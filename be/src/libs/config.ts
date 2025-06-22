import dotenv from "dotenv";

dotenv.config();

export const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  FRONTEND_URL,
  PORT = "3000"
} = process.env;