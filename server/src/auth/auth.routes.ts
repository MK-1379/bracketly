import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { DEMO_ACCOUNTS } from "../demo/demoAccounts.js";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { hashPassword, verifyPassword } from "./password.js";
import { endSession, startSession } from "./session.js";

const publicUser = { id: true, email: true, displayName: true } as const;

const registerSchema = z.object({
    email: z
        .email()
        .max(255)
        .transform((email) => email.toLowerCase()),
    password: z.string().min(8).max(72),
    displayName: z.string().trim().min(3).max(40),
});

const loginSchema = z.object({
    email: z.email().transform((email) => email.toLowerCase()),
    password: z.string().min(1).max(72),
});

const demoLoginSchema = z.object({
    role: z.enum(["organizer", "captain"]),
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many attempts, try again later" },
    skip: () => env.NODE_ENV === "test",
});

export const authRouter = Router();

authRouter.post("/register", authLimiter, async (req, res) => {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new HttpError(409, "Email already registered");
    }

    const user = await prisma.user.create({
        data: {
            email: data.email,
            displayName: data.displayName,
            passwordHash: await hashPassword(data.password),
        },
        select: publicUser,
    });

    startSession(res, user.id);
    res.status(201).json({ user });
});

authRouter.post("/login", authLimiter, async (req, res) => {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
        throw new HttpError(401, "Invalid email or password");
    }

    startSession(res, user.id);
    res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
});
authRouter.get("/demo", (_req, res) => {
    res.json({ enabled: env.DEMO_MODE });
});

authRouter.post("/demo", authLimiter, async (req, res) => {
    if (!env.DEMO_MODE) {
        throw new HttpError(404, "Not found");
    }
    const { role } = demoLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: DEMO_ACCOUNTS[role] }, select: publicUser });
    if (!user) {
        throw new HttpError(503, "Demo data is not loaded");
    }

    startSession(res, user.id);
    res.json({ user });
});

authRouter.post("/logout", (_req, res) => {
    endSession(res);
    res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: publicUser });
    if (!user) {
        throw new HttpError(401, "Not authenticated");
    }
    res.json({ user });
});
