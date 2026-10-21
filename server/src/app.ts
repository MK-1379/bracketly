import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import { z, ZodError } from "zod";
import { authRouter } from "./auth/auth.routes.js";
import { prisma } from "./db/prisma.js";
import { HttpError } from "./errors.js";
import { gamesRouter } from "./games/games.routes.js";
import { tournamentsRouter } from "./tournaments/tournaments.routes.js";
import { registrationsRouter } from "./registrations/registrations.routes.js";
import { joinRouter, teamsRouter } from "./teams/teams.routes.js";
import { matchesRouter } from "./matches/matches.routes.js";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    app.get("/api/health", async (_req, res) => {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok" });
    });

    app.use("/api/auth", authRouter);
    app.use("/api/games", gamesRouter);
    app.use("/api/tournaments/:slug/registrations", registrationsRouter);
    app.use("/api/tournaments", tournamentsRouter);
    app.use("/api/teams", teamsRouter);
    app.use("/api/join", joinRouter);
    app.use("/api/matches", matchesRouter);

    app.use((_req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof ZodError) {
            res.status(400).json({ error: "Invalid data", fields: z.flattenError(err).fieldErrors });
            return;
        }
        if (err instanceof HttpError) {
            res.status(err.status).json({ error: err.message });
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    });

    return app;
}
