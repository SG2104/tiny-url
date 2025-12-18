import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(10, "Password must be at least 10 characters"),
});

export const signupSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(10, "Password must be at least 10 characters")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Must contain at least one symbol"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
