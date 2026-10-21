import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";

export async function findTeamAsCaptain(teamId: number, userId: number | undefined) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
        throw new HttpError(404, "Team not found");
    }
    if (team.captainId !== userId) {
        throw new HttpError(403, "Only the captain can do this");
    }
    return team;
}
