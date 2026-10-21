import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";

export const EDITABLE_STATUSES = ["DRAFT", "REGISTRATION"];

export async function findTournament(slug: string) {
    const tournament = await prisma.tournament.findUnique({ where: { slug } });
    if (!tournament) {
        throw new HttpError(404, "Tournament not found");
    }
    return tournament;
}

export async function findTournamentToManage(slug: string, userId: number | undefined) {
    const tournament = await findTournament(slug);
    if (tournament.organizerId !== userId) {
        throw new HttpError(403, "Only the organizer can do this");
    }
    return tournament;
}
