import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db/prisma.js";

export const app = createApp();

export async function resetDatabase() {
    await prisma.match.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();
    await prisma.game.upsert({
        where: { slug: "valorant" },
        update: {},
        create: { slug: "valorant", name: "Valorant" },
    });
}

export async function gameId() {
    const game = await prisma.game.findUniqueOrThrow({ where: { slug: "valorant" } });
    return game.id;
}

export async function signUp(name: string) {
    const agent = request.agent(app);
    const response = await agent
        .post("/api/auth/register")
        .send({ email: `${name}@test.com`, password: "supersecreta", displayName: name });
    return { agent, user: response.body.user as { id: number } };
}
