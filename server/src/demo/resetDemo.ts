import { randomBytes } from "node:crypto";
import { hashPassword } from "../auth/password.js";
import { prisma } from "../db/prisma.js";
import { confirmMatch, startTournament } from "../matches/matches.service.js";
import { DEMO_DOMAIN } from "./demoAccounts.js";

const DAY = 24 * 60 * 60 * 1000;
const PLAYERS_PER_TEAM = 5;

const teams = [
    { name: "Nébula Esports", tag: "NEB" },
    { name: "Vortex", tag: "VTX" },
    { name: "Kraken Rioja", tag: "KRK" },
    { name: "Pixel Pirates", tag: "PXP" },
    { name: "Lobos del Ebro", tag: "LDE" },
    { name: "Furia Norte", tag: "FUR" },
    { name: "Zero Ping", tag: "ZPG" },
    { name: "Atlas Gaming", tag: "ATL" },
];

const tournaments = [
    {
        slug: "liga-universitaria-de-otono",
        name: "Liga Universitaria de Otoño",
        game: "valorant",
        startsInDays: -3,
        maxTeams: 8,
        teamSize: 5,
        bestOf: 3,
        skipTeams: 0,
        teams: 8,
        rounds: 1,
        leaveReported: true,
    },
    {
        slug: "copa-rocket-iberica",
        name: "Copa Rocket Ibérica",
        game: "rocket-league",
        startsInDays: -10,
        maxTeams: 8,
        teamSize: 3,
        bestOf: 5,
        skipTeams: 0,
        teams: 5,
        rounds: 99,
        leaveReported: false,
    },
    {
        slug: "open-de-invierno",
        name: "Open de Invierno",
        game: "league-of-legends",
        startsInDays: 12,
        maxTeams: 16,
        teamSize: 5,
        bestOf: 1,
        skipTeams: 0,
        teams: 3,
        rounds: 0,
        leaveReported: false,
    },
    {
        slug: "torneo-relampago-cs2",
        name: "Torneo Relámpago CS2",
        game: "counter-strike-2",
        startsInDays: 5,
        maxTeams: 8,
        teamSize: 5,
        bestOf: 3,
        skipTeams: 2,
        teams: 6,
        rounds: 0,
        leaveReported: false,
    },
];

function createUser(handle: string, displayName: string, passwordHash: string) {
    return prisma.user.create({ data: { email: `${handle}${DEMO_DOMAIN}`, passwordHash, displayName } });
}

function demoScore(bestOf: number, teamAWins: boolean, index: number) {
    const winsNeeded = Math.ceil(bestOf / 2);
    const loserScore = index % winsNeeded;
    return teamAWins ? [winsNeeded, loserScore] : [loserScore, winsNeeded];
}

async function playRounds(tournamentId: number, bestOf: number, rounds: number, favoriteTeamId: number) {
    for (let round = 0; round < rounds; round++) {
        const ready = await prisma.match.findMany({ where: { tournamentId, status: "READY" } });
        if (ready.length === 0) {
            return;
        }
        for (const [index, match] of ready.entries()) {
            const favoriteIsA = match.teamAId === favoriteTeamId;
            const favoriteIsB = match.teamBId === favoriteTeamId;
            const teamAWins = favoriteIsA || (!favoriteIsB && (match.id + round) % 3 !== 0);
            const [scoreA, scoreB] = demoScore(bestOf, teamAWins, index);
            await confirmMatch(match.id, scoreA, scoreB);
        }
    }
}

async function reportOneMatch(tournamentId: number, bestOf: number, favoriteTeamId: number) {
    const match = await prisma.match.findFirst({
        where: {
            tournamentId,
            status: "READY",
            NOT: [{ teamAId: favoriteTeamId }, { teamBId: favoriteTeamId }],
        },
        include: { teamA: true },
    });
    if (!match?.teamA) {
        return;
    }
    const [scoreA, scoreB] = demoScore(bestOf, true, 1);
    await prisma.match.update({
        where: { id: match.id },
        data: { scoreA, scoreB, status: "REPORTED", reportedById: match.teamA.captainId },
    });
}

export async function resetDemo() {
    await prisma.user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });

    const passwordHash = await hashPassword(randomBytes(16).toString("hex"));
    const organizer = await createUser("organizador", "Club Esports UR", passwordHash);

    const createdTeams = [];
    for (const team of teams) {
        const tag = team.tag.toLowerCase();
        const captain = await createUser(`capitan.${tag}`, `Capitán ${team.tag}`, passwordHash);
        const players = [];
        for (let number = 2; number <= PLAYERS_PER_TEAM; number++) {
            players.push(await createUser(`jugador${number}.${tag}`, `${team.tag} Jugador ${number}`, passwordHash));
        }
        createdTeams.push(
            await prisma.team.create({
                data: {
                    ...team,
                    captainId: captain.id,
                    inviteCode: randomBytes(9).toString("base64url"),
                    members: { create: [captain, ...players].map((user) => ({ userId: user.id })) },
                },
            }),
        );
    }

    const favoriteTeamId = createdTeams[0].id;

    for (const data of tournaments) {
        const game = await prisma.game.findUniqueOrThrow({ where: { slug: data.game } });
        const tournament = await prisma.tournament.create({
            data: {
                slug: data.slug,
                name: data.name,
                gameId: game.id,
                startsAt: new Date(Date.now() + data.startsInDays * DAY),
                maxTeams: data.maxTeams,
                teamSize: data.teamSize,
                bestOf: data.bestOf,
                description: `Torneo de demostración de ${game.name}.`,
                rules: "Eliminación directa. Uno de los capitanes reporta el resultado y el organizador lo confirma.",
                status: "REGISTRATION",
                organizerId: organizer.id,
            },
        });

        for (const team of createdTeams.slice(data.skipTeams, data.skipTeams + data.teams)) {
            await prisma.registration.create({
                data: { tournamentId: tournament.id, teamId: team.id, status: "ACCEPTED" },
            });
        }

        if (data.rounds > 0) {
            await startTournament(tournament.id);
            await playRounds(tournament.id, data.bestOf, data.rounds, favoriteTeamId);
        }
        if (data.leaveReported) {
            await reportOneMatch(tournament.id, data.bestOf, favoriteTeamId);
        }
    }

    return { tournaments: tournaments.length };
}
