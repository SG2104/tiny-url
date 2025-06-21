import express, { Request, Response } from "express";
import { connectToDB } from "./libs/db";
import urlRouter from "./modules/urls/route";
import { redisClient } from "./libs/redis";

const app = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

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