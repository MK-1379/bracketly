import express, { type NextFunction, type Request, type Response } from "express";
import { prisma } from "./db/prisma.js";

export function createApp() {
    const app = express();

    app.use(express.json());

    app.get("/api/health", async (_req, res) => {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok" });
    });

    app.use((_req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    });

    return app;
}