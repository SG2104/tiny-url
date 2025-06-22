import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .url({ message: "Invalid URL format" }),
  expire_at: z
  .string()
  .refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
    { message: "Invalid date format" }
  )
  .optional(),

});

export const redirectSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Short code is required" }),
});
