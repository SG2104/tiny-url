import express from "express";
import { createMillionFakeUrls, createTinyUrl, redirectTinyUrl, getAllUrls } from "./controller";
import validationMiddleware from "../../middlewares/validation.middleware";
import { createUrlSchema, redirectSchema } from "./url.schema";

const urlRouter = express.Router();

urlRouter.get("/redirect/:id", validationMiddleware(redirectSchema, "params"), redirectTinyUrl);

urlRouter.post("/create", validationMiddleware(createUrlSchema), createTinyUrl);

urlRouter.post("/fake-seeder", createMillionFakeUrls);

urlRouter.get("/urls", getAllUrls);

export default urlRouter;