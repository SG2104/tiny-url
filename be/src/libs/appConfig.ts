import dotenv from "dotenv";

dotenv.config();

export const SERVER_CONFIG = {
    port: process.env.PORT || 8000,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

export const DB_CONFIG = {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    port: parseInt(process.env.DB_PORT || "5432"),
};

export const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};
