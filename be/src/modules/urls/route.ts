import express from "express";
import { createMillionFakeUrls, createTinyUrl, redirectTinyUrl, getAllUrls } from "./controller";
import validationMiddleware from "../../middlewares/validation.middleware";
import { createUrlSchema, redirectSchema } from "./url.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

const urlRouter = express.Router();

urlRouter.get("/redirect/:id", validationMiddleware(redirectSchema, "params"), redirectTinyUrl);

urlRouter.post("/create", validationMiddleware(createUrlSchema), createTinyUrl);

urlRouter.post("/fake-seeder", createMillionFakeUrls);

urlRouter.get("/urls", authMiddleware, getAllUrls);

export default urlRouter;