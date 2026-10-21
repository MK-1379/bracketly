import type { NextFunction, Request, Response } from "express";
import { readSession, SESSION_COOKIE } from "../auth/session.js";
import { HttpError } from "../errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const userId = readSession(req.cookies?.[SESSION_COOKIE]);
    if (userId === null) {
        throw new HttpError(401, "Not authenticated");
    }
    req.userId = userId;
    next();
}

export function currentUserId(req: Request): number {
    if (req.userId === undefined) {
        throw new HttpError(401, "Not authenticated");
    }
    return req.userId;
}
