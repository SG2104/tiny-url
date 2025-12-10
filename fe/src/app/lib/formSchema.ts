import { z } from "zod";

export const formSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "URL is required")
    .url("Must be a valid URL"),
  expire_at: z
    .date()
    .nullable()
    .optional(),
});

export type FormData = z.infer<typeof formSchema>;