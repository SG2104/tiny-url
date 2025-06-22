import express from "express";
import { createMillionFakeUrls, createTinyUrl, redirectTinyUrl } from "./controller";
import { createUrlLimiter, redirectLimiter, seederLimiter } from "../../middlewares/rateLimiter.middleware";
import validationMiddleware from "../../middlewares/validation.middleware";
import { createUrlSchema, redirectSchema } from "./url.schema";

const urlRouter = express.Router();

urlRouter.get("/redirect/:id", redirectLimiter, validationMiddleware(redirectSchema, "params"), redirectTinyUrl);

urlRouter.post("/create", createUrlLimiter, validationMiddleware(createUrlSchema), createTinyUrl);

urlRouter.post("/fake-seeder",seederLimiter, createMillionFakeUrls);

export default urlRouter;