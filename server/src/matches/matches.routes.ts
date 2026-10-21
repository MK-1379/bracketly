import { Router } from "express";
import { isValidScore } from "../bracket/score.js";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";
import { requireAuth, currentUserId } from "../middleware/requireAuth.js";
import { confirmMatchSchema, matchParamsSchema, reportMatchSchema } from "./matches.schemas.js";
import { matchSelect } from "./matches.select.js";
import { confirmMatch } from "./matches.service.js";

const OPEN_STATUSES = ["READY", "REPORTED"];

async function findPlayableMatch(id: number) {
    const match = await prisma.match.findUnique({
        where: { id },
        include: {
            tournament: true,
            teamA: { select: { captainId: true } },
            teamB: { select: { captainId: true } },
        },
    });
    if (!match) {
        throw new HttpError(404, "Match not found");
    }
    if (match.tournament.status !== "IN_PROGRESS" || !OPEN_STATUSES.includes(match.status)) {
        throw new HttpError(409, "This match cannot be played now");
    }
    return match;
}

function assertValidScore(bestOf: number, scoreA: number, scoreB: number) {
    if (!isValidScore(bestOf, scoreA, scoreB)) {
        throw new HttpError(400, `Invalid score for a best of ${bestOf}`);
    }
}

export const matchesRouter = Router();

const teamWithCaptain = { select: { id: true, name: true, tag: true, captainId: true } } as const;

matchesRouter.get("/mine", requireAuth, async (req, res) => {
    const userId = currentUserId(req);
    const myTeam = { members: { some: { userId } } };

    const matches = await prisma.match.findMany({
        where: {
            status: { in: ["READY", "REPORTED"] },
            tournament: { status: "IN_PROGRESS" },
            OR: [{ teamA: myTeam }, { teamB: myTeam }],
        },
        select: {
            ...matchSelect,
            teamA: teamWithCaptain,
            teamB: teamWithCaptain,
            reportedBy: { select: { displayName: true } },
            tournament: {
                select: { slug: true, name: true, bestOf: true, _count: { select: { matches: true } } },
            },
        },
        orderBy: [{ tournament: { startsAt: "asc" } }, { round: "asc" }, { position: "asc" }],
    });

    res.json({
        matches: matches.map((match) => ({
            ...match,
            canReport: match.teamA?.captainId === userId || match.teamB?.captainId === userId,
        })),
    });
});

matchesRouter.post("/:id/report", requireAuth, async (req, res) => {
    const { id } = matchParamsSchema.parse(req.params);
    const data = reportMatchSchema.parse(req.body);
    const match = await findPlayableMatch(id);

    const captains = [match.teamA?.captainId, match.teamB?.captainId];
    if (!captains.includes(req.userId)) {
        throw new HttpError(403, "Only the captains of this match can report it");
    }
    assertValidScore(match.tournament.bestOf, data.scoreA, data.scoreB);

    const reported = await prisma.match.update({
        where: { id },
        data: { ...data, status: "REPORTED", reportedById: req.userId },
        select: matchSelect,
    });

    res.json({ match: reported });
});

matchesRouter.post("/:id/confirm", requireAuth, async (req, res) => {
    const { id } = matchParamsSchema.parse(req.params);
    const data = confirmMatchSchema.parse(req.body ?? {});
    const match = await findPlayableMatch(id);

    if (match.tournament.organizerId !== req.userId) {
        throw new HttpError(403, "Only the organizer can confirm results");
    }

    const scoreA = data.scoreA ?? match.scoreA;
    const scoreB = data.scoreB ?? match.scoreB;
    if (scoreA === null || scoreB === null) {
        throw new HttpError(400, "Nothing reported yet: send scoreA and scoreB");
    }
    assertValidScore(match.tournament.bestOf, scoreA, scoreB);

    await confirmMatch(id, scoreA, scoreB);

    const confirmed = await prisma.match.findUniqueOrThrow({ where: { id }, select: matchSelect });
    res.json({ match: confirmed });
});
