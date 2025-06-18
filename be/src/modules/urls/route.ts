import express from "express";
import { createTinyUrl, redirectTinyUrl } from "./controller";

const urlRouter = express.Router();

urlRouter.get("/redirect/:id", redirectTinyUrl);

urlRouter.post("/create", createTinyUrl);

export default urlRouter;