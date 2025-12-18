// src/modules/auth/route.ts
import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
}

function createToken(userId: number): string {
    const payload = { userId };
    const expiresIn: any = process.env.JWT_EXPIRES_IN || "7d";

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// POST /api/auth/register
router.post(
    "/register",
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password } = req.body as {
                name?: string;
                email?: string;
                password?: string;
            };

            if (!name || !email || !password) {
                res.status(400).json({ message: "All fields are required" });
                return;
            }

            const existing = await prisma.user.findUnique({
                where: { email },
            });

            if (existing) {
                res.status(409).json({ message: "Email already in use" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            });

            const token = createToken(user.id);

            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // set true in prod with HTTPS
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(201).json({
                message: "Account created successfully",
                user,
            });
        } catch (err) {
            console.error("Register error:", err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
);

// POST /api/auth/login
router.post(
    "/login",
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body as {
                email?: string;
                password?: string;
            };

            if (!email || !password) {
                res
                    .status(400)
                    .json({ message: "Email and password are required" });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            const token = createToken(user.id);

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                message: "Logged in successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
);

// POST /api/auth/logout
router.post(
    "/logout",
    (req: Request, res: Response): void => {
        res.clearCookie("token");
        res.json({ message: "Logged out" });
    }
);

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

export default router;
