import { Router } from "express";
import { prisma } from "../db/prisma.js";

export const gamesRouter = Router();

gamesRouter.get("/", async (_req, res) => {
    const games = await prisma.game.findMany({
        select: { id: true, slug: true, name: true, logoUrl: true },
        orderBy: { name: "asc" },
    });
    res.json({ games });
});
