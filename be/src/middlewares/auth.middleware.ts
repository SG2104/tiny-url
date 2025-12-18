import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};
