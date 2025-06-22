import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .url({ message: "Invalid URL format" }),
  expire_at: z
    .string()
    .datetime({ message: "Invalid date format" })
    .optional(),
});

export const redirectSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Short code is required" }),
});
