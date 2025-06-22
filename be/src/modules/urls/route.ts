import express from "express";
import { createMillionFakeUrls, createTinyUrl, redirectTinyUrl } from "./controller";
import { createUrlLimiter, redirectLimiter, seederLimiter } from "../../middlewares/rateLimiter";

const urlRouter = express.Router();

urlRouter.get("/redirect/:id", redirectLimiter, redirectTinyUrl);

urlRouter.post("/create", createUrlLimiter, createTinyUrl);

urlRouter.post("/fake-seeder",seederLimiter, createMillionFakeUrls);

export default urlRouter;