import { generateBracket, type PlannedMatch } from "../bracket/bracket.js";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../errors.js";

function initialStatus(match: PlannedMatch) {
    if (match.isBye) {
        return "CONFIRMED";
    }
    return match.teamA !== null && match.teamB !== null ? "READY" : "PENDING";
}

function matchKey(round: number, position: number) {
    return `${round}-${position}`;
}

export async function startTournament(tournamentId: number) {
    const registrations = await prisma.registration.findMany({
        where: { tournamentId, status: "ACCEPTED" },
        orderBy: { createdAt: "asc" },
    });
    if (registrations.length < 2) {
        throw new HttpError(409, "At least 2 accepted teams are needed");
    }

    const plannedMatches = generateBracket(registrations.map((registration) => registration.teamId));

    await prisma.$transaction(async (tx) => {
        for (const [index, registration] of registrations.entries()) {
            await tx.registration.update({
                where: { tournamentId_teamId: { tournamentId, teamId: registration.teamId } },
                data: { seed: index + 1 },
            });
        }

        const matchIds = new Map<string, number>();
        for (const match of plannedMatches) {
            const created = await tx.match.create({
                data: {
                    tournamentId,
                    round: match.round,
                    position: match.position,
                    teamAId: match.teamA,
                    teamBId: match.teamB,
                    winnerTeamId: match.winner,
                    status: initialStatus(match),
                },
            });
            matchIds.set(matchKey(match.round, match.position), created.id);
        }

        for (const match of plannedMatches) {
            if (match.next) {
                await tx.match.update({
                    where: { id: matchIds.get(matchKey(match.round, match.position)) },
                    data: {
                        nextMatchId: matchIds.get(matchKey(match.next.round, match.next.position)),
                        nextSlot: match.next.slot,
                    },
                });
            }
        }

        await tx.tournament.update({ where: { id: tournamentId }, data: { status: "IN_PROGRESS" } });
    });
}

export async function confirmMatch(matchId: number, scoreA: number, scoreB: number) {
    await prisma.$transaction(async (tx) => {
        const match = await tx.match.findUniqueOrThrow({ where: { id: matchId } });
        const winnerTeamId = scoreA > scoreB ? match.teamAId : match.teamBId;

        await tx.match.update({
            where: { id: matchId },
            data: { scoreA, scoreB, winnerTeamId, status: "CONFIRMED" },
        });

        if (match.nextMatchId === null || match.nextSlot === null) {
            await tx.tournament.update({
                where: { id: match.tournamentId },
                data: { status: "FINISHED", winnerTeamId },
            });
            return;
        }

        const nextMatch = await tx.match.update({
            where: { id: match.nextMatchId },
            data: match.nextSlot === "A" ? { teamAId: winnerTeamId } : { teamBId: winnerTeamId },
        });

        if (nextMatch.teamAId !== null && nextMatch.teamBId !== null) {
            await tx.match.update({ where: { id: nextMatch.id }, data: { status: "READY" } });
        }
    });
}
