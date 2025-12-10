import express, { Request, Response } from "express";
import { connectToDB } from "./libs/db";
import urlRouter from "./modules/urls/route";
import { redisClient } from "./libs/redis";
import { SERVER_CONFIG } from "./libs/appConfig";
import cors from "cors";

const app = express();
const port = SERVER_CONFIG.port;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use(cors({
    origin: SERVER_CONFIG.frontendUrl,
    credentials: true,
}));
app.use(express.json());
app.use(urlRouter);

connectToDB();
redisClient
    .connect()
    .then(() => {
        console.log("Connected to Redis");
    })
    .catch((error) => {
        console.error("Error connecting to Redis:", error);
    });

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
