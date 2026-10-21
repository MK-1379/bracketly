import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { findTeamAsCaptain } from "../teams/teams.access.js";
import { findTournament, findTournamentToManage } from "../tournaments/tournaments.access.js";
import { slugParamsSchema } from "../tournaments/tournaments.schemas.js";
import { registrationBodySchema, registrationParamsSchema, reviewRegistrationSchema } from "./registrations.schemas.js";

function assertRegistrationOpen(status: string) {
    if (status !== "REGISTRATION") {
        throw new HttpError(409, "Registration is not open");
    }
}

export const registrationsRouter = Router({ mergeParams: true });

registrationsRouter.get("/", requireAuth, async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const tournament = await findTournamentToManage(slug, req.userId);

    const registrations = await prisma.registration.findMany({
        where: { tournamentId: tournament.id },
        select: {
            status: true,
            seed: true,
            createdAt: true,
            team: {
                select: {
                    id: true,
                    name: true,
                    tag: true,
                    captain: { select: { displayName: true } },
                    _count: { select: { members: true } },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    res.json({ registrations });
});

registrationsRouter.post("/", requireAuth, async (req, res) => {
    const { slug } = slugParamsSchema.parse(req.params);
    const { teamId } = registrationBodySchema.parse(req.body);

    const tournament = await findTournament(slug);
    assertRegistrationOpen(tournament.status);
    await findTeamAsCaptain(teamId, req.userId);

    const memberCount = await prisma.teamMember.count({ where: { teamId } });
    if (memberCount < tournament.teamSize) {
        throw new HttpError(409, `The team needs at least ${tournament.teamSize} players`);
    }

    const existing = await prisma.registration.findUnique({
        where: { tournamentId_teamId: { tournamentId: tournament.id, teamId } },
    });
    if (existing) {
        throw new HttpError(409, "The team is already registered");
    }

    const registration = await prisma.registration.create({
        data: { tournamentId: tournament.id, teamId },
        select: { status: true, createdAt: true, team: { select: { id: true, name: true, tag: true } } },
    });

    res.status(201).json({ registration });
});

registrationsRouter.patch("/:teamId", requireAuth, async (req, res) => {
    const { slug, teamId } = registrationParamsSchema.parse(req.params);
    const { status } = reviewRegistrationSchema.parse(req.body);

    const tournament = await findTournamentToManage(slug, req.userId);
    assertRegistrationOpen(tournament.status);
    const where = { tournamentId_teamId: { tournamentId: tournament.id, teamId } };

    const registration = await prisma.$transaction(async (tx) => {
        const current = await tx.registration.findUnique({ where });
        if (!current) {
            throw new HttpError(404, "Registration not found");
        }

        if (status === "ACCEPTED" && current.status !== "ACCEPTED") {
            const accepted = await tx.registration.count({
                where: { tournamentId: tournament.id, status: "ACCEPTED" },
            });
            if (accepted >= tournament.maxTeams) {
                throw new HttpError(409, "The tournament is full");
            }
        }

        return tx.registration.update({
            where,
            data: { status },
            select: { status: true, team: { select: { id: true, name: true, tag: true } } },
        });
    });

    res.json({ registration });
});

registrationsRouter.delete("/:teamId", requireAuth, async (req, res) => {
    const { slug, teamId } = registrationParamsSchema.parse(req.params);

    const tournament = await findTournament(slug);
    assertRegistrationOpen(tournament.status);
    await findTeamAsCaptain(teamId, req.userId);

    const { count } = await prisma.registration.deleteMany({
        where: { tournamentId: tournament.id, teamId },
    });
    if (count === 0) {
        throw new HttpError(404, "Registration not found");
    }

    res.status(204).end();
});
