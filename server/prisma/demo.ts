import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/auth/password.js";
import { prisma } from "../src/db/prisma.js";
import { confirmMatch, startTournament } from "../src/matches/matches.service.js";

const DEMO_DOMAIN = "@demo.bracketly.dev";
const DAY = 24 * 60 * 60 * 1000;

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
        teams: 8,
        rounds: 1,
    },
    {
        slug: "copa-rocket-iberica",
        name: "Copa Rocket Ibérica",
        game: "rocket-league",
        startsInDays: -10,
        maxTeams: 8,
        teamSize: 3,
        bestOf: 5,
        teams: 5,
        rounds: 99,
    },
    {
        slug: "open-de-invierno",
        name: "Open de Invierno",
        game: "league-of-legends",
        startsInDays: 12,
        maxTeams: 16,
        teamSize: 5,
        bestOf: 1,
        teams: 3,
        rounds: 0,
    },
    {
        slug: "torneo-relampago-cs2",
        name: "Torneo Relámpago CS2",
        game: "counter-strike-2",
        startsInDays: 5,
        maxTeams: 8,
        teamSize: 5,
        bestOf: 3,
        teams: 6,
        rounds: 0,
    },
];

async function createUser(handle: string, displayName: string) {
    const passwordHash = await hashPassword(randomBytes(16).toString("hex"));
    return prisma.user.create({ data: { email: `${handle}${DEMO_DOMAIN}`, passwordHash, displayName } });
}

async function playRounds(tournamentId: number, bestOf: number, rounds: number) {
    const winsNeeded = Math.ceil(bestOf / 2);
    for (let round = 0; round < rounds; round++) {
        const ready = await prisma.match.findMany({ where: { tournamentId, status: "READY" } });
        if (ready.length === 0) {
            return;
        }
        for (const [index, match] of ready.entries()) {
            const loserScore = index % winsNeeded;
            const teamAWins = (match.id + round) % 3 !== 0;
            await confirmMatch(match.id, teamAWins ? winsNeeded : loserScore, teamAWins ? loserScore : winsNeeded);
        }
    }
}

await prisma.user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });

const organizer = await createUser("organizador", "Club Esports UR");

const createdTeams = [];
for (const team of teams) {
    const captain = await createUser(`capitan.${team.tag.toLowerCase()}`, `Capitán ${team.tag}`);
    createdTeams.push(
        await prisma.team.create({
            data: {
                ...team,
                captainId: captain.id,
                inviteCode: randomBytes(9).toString("base64url"),
                members: { create: { userId: captain.id } },
            },
        }),
    );
}

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

    for (const team of createdTeams.slice(0, data.teams)) {
        await prisma.registration.create({
            data: { tournamentId: tournament.id, teamId: team.id, status: "ACCEPTED" },
        });
    }

    if (data.rounds > 0) {
        await startTournament(tournament.id);
        await playRounds(tournament.id, data.bestOf, data.rounds);
    }
}

console.log(`${tournaments.length} torneos de demostración creados`);
await prisma.$disconnect();
