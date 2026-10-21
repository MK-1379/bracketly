import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { uniqueSlug } from "../utils/slug.js";
import {
    createTournamentSchema,
    listTournamentsSchema,
    slugParamsSchema,
    updateTournamentSchema,
} from "./tournaments.schemas.js";

const tournamentSummary = {
    id: true,
    slug: true,
    name: true,
    startsAt: true,
    maxTeams: true,
    teamSize: true,
    bestOf: true,
    status: true,
    game: { select: { slug: true, name: true, logoUrl: true } },
    organizer: { select: { id: true, displayName: true } },
    _count: { select: { registrations: { where: { status: "ACCEPTED" } } } },
} as const;

const tournamentDetail = {
    ...tournamentSummary,
    description: true,
    rules: true,
    createdAt: true,
    winnerTeam: { select: { id: true, name: true, tag: true } },
} as const;

const EDITABLE_STATUSES = ["DRAFT", "REGISTRATION"];

async function findTournamentToManage(slug: string, userId: number | undefined) {
    const tournament = await prisma.tournament.findUnique({ where: { slug } });
    if (!tournament) {
        throw new HttpError(404, "Tournament not found");
    }
    if (tournament.organizerId !== userId) {
        throw new HttpError(403, "Only the organizer can do this");
    }
    return tournament;
}

async function assertGameExists(gameId: number) {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
        throw new HttpError(400, "Unknown game");
    }
}

export const tournamentsRouter = Router();

tournamentsRouter.get("/", async (req, res) => {
    const filters = listTournamentsSchema.parse(req.query);

    const tournaments = await prisma.tournament.findMany({
        where: {
            status: filters.status ?? { not: "DRAFT" },
            game: filters.game ? { slug: filters.game } : undefined,
        },
        select: tournamentSummary,
        orderBy: { startsAt: "asc" },
    });

    res.json({ tournaments });
});

tournamentsRouter.get("/:slug", async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const tournament = await prisma.tournament.findUnique({
        where: { slug },
        select: tournamentDetail,
    });
    if (!tournament) {
        throw new HttpError(404, "Tournament not found");
    }
    res.json({ tournament });
});

tournamentsRouter.post("/", requireAuth, async (req, res) => {
    const data = createTournamentSchema.parse(req.body);
    await assertGameExists(data.gameId);

    const tournament = await prisma.tournament.create({
        data: { ...data, slug: uniqueSlug(data.name), organizerId: req.userId! },
        select: tournamentDetail,
    });

    res.status(201).json({ tournament });
});

tournamentsRouter.patch("/:slug", requireAuth, async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const current = await findTournamentToManage(slug, req.userId);
    if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new HttpError(409, "The tournament has already started");
    }

    const data = updateTournamentSchema.parse(req.body);
    if (data.gameId !== undefined) {
        await assertGameExists(data.gameId);
    }

    const tournament = await prisma.tournament.update({
        where: { id: current.id },
        data,
        select: tournamentDetail,
    });

    res.json({ tournament });
});

tournamentsRouter.post("/:slug/open", requireAuth, async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const current = await findTournamentToManage(slug, req.userId);
    if (current.status !== "DRAFT") {
        throw new HttpError(409, "Only a draft can open registration");
    }

    const tournament = await prisma.tournament.update({
        where: { id: current.id },
        data: { status: "REGISTRATION" },
        select: tournamentDetail,
    });

    res.json({ tournament });
});

tournamentsRouter.delete("/:slug", requireAuth, async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const current = await findTournamentToManage(slug, req.userId);
    if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new HttpError(409, "The tournament has already started");
    }

    await prisma.tournament.delete({ where: { id: current.id } });
    res.status(204).end();
});
