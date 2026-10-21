import { randomBytes } from "node:crypto";
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { findTeamAsCaptain } from "./teams.access.js";
import { createTeamSchema, inviteParamsSchema, memberParamsSchema, teamParamsSchema } from "./teams.schemas.js";

const teamPublic = {
    id: true,
    name: true,
    tag: true,
    captain: { select: { id: true, displayName: true } },
    members: {
        select: { joinedAt: true, user: { select: { id: true, displayName: true } } },
        orderBy: { joinedAt: "asc" },
    },
} as const;

function newInviteCode() {
    return randomBytes(9).toString("base64url");
}

export const teamsRouter = Router();

teamsRouter.get("/mine", requireAuth, async (req, res) => {
    const teams = await prisma.team.findMany({
        where: { members: { some: { userId: req.userId } } },
        select: { ...teamPublic, captainId: true, inviteCode: true },
        orderBy: { createdAt: "asc" },
    });

    res.json({
        teams: teams.map(({ captainId, inviteCode, ...team }) => ({
            ...team,
            isCaptain: captainId === req.userId,
            inviteCode: captainId === req.userId ? inviteCode : undefined,
        })),
    });
});

teamsRouter.get("/:id", async (req, res) => {
    const { id } = teamParamsSchema.parse(req.params);
    const team = await prisma.team.findUnique({ where: { id }, select: teamPublic });
    if (!team) {
        throw new HttpError(404, "Team not found");
    }
    res.json({ team });
});

teamsRouter.post("/", requireAuth, async (req, res) => {
    const data = createTeamSchema.parse(req.body);
    const userId = req.userId!;

    const team = await prisma.team.create({
        data: {
            ...data,
            inviteCode: newInviteCode(),
            captainId: userId,
            members: { create: { userId } },
        },
        select: { ...teamPublic, inviteCode: true },
    });

    res.status(201).json({ team });
});

teamsRouter.post("/:id/invite-code", requireAuth, async (req, res) => {
    const { id } = teamParamsSchema.parse(req.params);
    await findTeamAsCaptain(id, req.userId);

    const team = await prisma.team.update({
        where: { id },
        data: { inviteCode: newInviteCode() },
        select: { inviteCode: true },
    });

    res.json(team);
});

teamsRouter.delete("/:id/members/:userId", requireAuth, async (req, res) => {
    const { id, userId } = memberParamsSchema.parse(req.params);
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
        throw new HttpError(404, "Team not found");
    }

    const isCaptain = team.captainId === req.userId;
    const isLeavingHimself = userId === req.userId;
    if (!isCaptain && !isLeavingHimself) {
        throw new HttpError(403, "Only the captain can remove other members");
    }
    if (userId === team.captainId) {
        throw new HttpError(409, "The captain cannot leave the team");
    }

    const { count } = await prisma.teamMember.deleteMany({ where: { teamId: id, userId } });
    if (count === 0) {
        throw new HttpError(404, "Member not found");
    }
    res.status(204).end();
});

export const joinRouter = Router();

joinRouter.post("/:code", requireAuth, async (req, res) => {
    const { code } = inviteParamsSchema.parse(req.params);
    const userId = req.userId!;

    const team = await prisma.team.findUnique({ where: { inviteCode: code } });
    if (!team) {
        throw new HttpError(404, "Invalid invite code");
    }

    const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: team.id, userId } },
    });
    if (membership) {
        throw new HttpError(409, "You are already in this team");
    }

    await prisma.teamMember.create({ data: { teamId: team.id, userId } });
    res.status(201).json({ team: { id: team.id, name: team.name, tag: team.tag } });
});