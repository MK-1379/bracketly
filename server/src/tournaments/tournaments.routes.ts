import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";
import { matchSelect } from "../matches/matches.select.js";
import { startTournament } from "../matches/matches.service.js";
import { currentUserId, requireAuth } from "../middleware/requireAuth.js";
import { uniqueSlug } from "../utils/slug.js";
import { EDITABLE_STATUSES, findTournament, findTournamentToManage } from "./tournaments.access.js";
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
    registrations: {
        where: { status: "ACCEPTED" },
        select: { seed: true, team: { select: { id: true, name: true, tag: true } } },
        orderBy: { createdAt: "asc" },
    },
} as const;

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

tournamentsRouter.get("/mine", requireAuth, async (req, res) => {
    const tournaments = await prisma.tournament.findMany({
        where: { organizerId: currentUserId(req) },
        select: tournamentSummary,
        orderBy: { createdAt: "desc" },
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
        data: { ...data, slug: uniqueSlug(data.name), organizerId: currentUserId(req) },
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

    if (data.maxTeams !== undefined) {
        const accepted = await prisma.registration.count({
            where: { tournamentId: current.id, status: "ACCEPTED" },
        });
        if (data.maxTeams < accepted) {
            throw new HttpError(409, `There are already ${accepted} accepted teams`);
        }
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

tournamentsRouter.post("/:slug/start", requireAuth, async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const tournament = await findTournamentToManage(slug, req.userId);
    if (tournament.status !== "REGISTRATION") {
        throw new HttpError(409, "Only a tournament with open registration can start");
    }

    await startTournament(tournament.id);
    res.json({ status: "IN_PROGRESS" });
});

tournamentsRouter.get("/:slug/matches", async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const tournament = await findTournament(slug);

    const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id },
        select: matchSelect,
        orderBy: [{ round: "asc" }, { position: "asc" }],
    });

    res.json({ matches });
});
