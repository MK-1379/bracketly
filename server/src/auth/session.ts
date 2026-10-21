import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "session";

const SESSION_DAYS = 7;

const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
};

export function startSession(res: Response, userId: number) {
    const token = jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 });
}

export function endSession(res: Response) {
    res.clearCookie(SESSION_COOKIE, cookieOptions);
}

export function readSession(token: unknown): number | null {
    if (typeof token !== "string") {
        return null;
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        const userId = Number(typeof payload === "object" ? payload.sub : undefined);
        return Number.isInteger(userId) ? userId : null;
    } catch {
        return null;
    }
}
