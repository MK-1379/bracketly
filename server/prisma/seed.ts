import { prisma } from "../src/db/prisma.js";

const games = [
    { slug: "league-of-legends", name: "League of Legends" },
    { slug: "valorant", name: "Valorant" },
    { slug: "counter-strike-2", name: "Counter-Strike 2" },
    { slug: "rocket-league", name: "Rocket League" },
    { slug: "dota-2", name: "Dota 2" },
    { slug: "ea-sports-fc", name: "EA Sports FC" },
];

for (const game of games) {
    await prisma.game.upsert({
        where: { slug: game.slug },
        update: { name: game.name },
        create: game,
    });
}

console.log(`${games.length} juegos cargados`);
await prisma.$disconnect();
