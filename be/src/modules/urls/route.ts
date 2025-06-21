import express from "express";
import { createMillionFakeUrls, createTinyUrl, redirectTinyUrl } from "./controller";

const urlRouter = express.Router();

urlRouter.get("/redirect/:id", redirectTinyUrl);

urlRouter.post("/create", createTinyUrl);

urlRouter.post("/fake-seeder", createMillionFakeUrls);

export default urlRouter;