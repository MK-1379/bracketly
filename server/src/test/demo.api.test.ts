import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { DEMO_DOMAIN } from "../demo/demoAccounts.js";
import { resetDemo } from "../demo/resetDemo.js";
import { app, resetDatabase, signUp } from "./helpers.js";

const demoGames = ["valorant", "rocket-league", "league-of-legends", "counter-strike-2"];

async function seedGames() {
    for (const slug of demoGames) {
        await prisma.game.upsert({ where: { slug }, update: {}, create: { slug, name: slug } });
    }
}

beforeAll(async () => {
    await resetDatabase();
    await seedGames();
    await resetDemo();
});
afterEach(() => {
    env.DEMO_MODE = true;
});
afterAll(() => prisma.$disconnect());

describe("datos demo", () => {
    it("crea los torneos con equipos completos", async () => {
        const tournaments = await prisma.tournament.findMany({ select: { slug: true, status: true } });
        const members = await prisma.teamMember.count({ where: { team: { tag: "NEB" } } });

        expect(tournaments).toHaveLength(4);
        expect(tournaments.map((tournament) => tournament.status).sort()).toEqual([
            "FINISHED",
            "IN_PROGRESS",
            "REGISTRATION",
            "REGISTRATION",
        ]);
        expect(members).toBe(5);
    });

    it("deja un partido para el capitán demo y otro pendiente de validar", async () => {
        const open = await prisma.match.findMany({
            where: { tournament: { slug: "liga-universitaria-de-otono" }, status: { in: ["READY", "REPORTED"] } },
            include: { teamA: true, teamB: true },
        });

        const ready = open.find((match) => match.status === "READY");
        const reported = open.find((match) => match.status === "REPORTED");
        expect([ready?.teamA?.tag, ready?.teamB?.tag]).toContain("NEB");
        expect(reported?.reportedById).toBe(reported?.teamA?.captainId);
    });

    it("al reiniciar borra lo que hayan cambiado las cuentas demo y respeta a los demás usuarios", async () => {
        const { user } = await signUp("ana");
        const organizer = await prisma.user.findUniqueOrThrow({ where: { email: `organizador${DEMO_DOMAIN}` } });
        await prisma.tournament.update({ where: { slug: "open-de-invierno" }, data: { name: "Nombre cambiado" } });
        await prisma.tournament.create({
            data: {
                slug: "torneo-de-un-visitante",
                name: "Torneo de un visitante",
                gameId: (await prisma.game.findUniqueOrThrow({ where: { slug: "valorant" } })).id,
                startsAt: new Date(),
                maxTeams: 8,
                teamSize: 5,
                bestOf: 1,
                organizerId: organizer.id,
            },
        });

        await resetDemo();

        const slugs = (await prisma.tournament.findMany({ select: { slug: true } })).map((t) => t.slug);
        const winter = await prisma.tournament.findUniqueOrThrow({ where: { slug: "open-de-invierno" } });
        expect(slugs).not.toContain("torneo-de-un-visitante");
        expect(winter.name).toBe("Open de Invierno");
        expect(await prisma.user.findUnique({ where: { id: user.id } })).not.toBeNull();
    });
});

describe("login demo", () => {
    it("dice si el modo demo está activo", async () => {
        const response = await request(app).get("/api/auth/demo");

        expect(response.body).toEqual({ enabled: true });
    });

    it("entra como organizador sin contraseña", async () => {
        const agent = request.agent(app);
        const response = await agent.post("/api/auth/demo").send({ role: "organizer" });
        const me = await agent.get("/api/auth/me");

        expect(response.status).toBe(200);
        expect(me.body.user.email).toBe(`organizador${DEMO_DOMAIN}`);
    });

    it("entra como capitán", async () => {
        const response = await request(app).post("/api/auth/demo").send({ role: "captain" });

        expect(response.body.user.email).toBe(`capitan.neb${DEMO_DOMAIN}`);
        expect(response.headers["set-cookie"][0]).toMatch(/^session=.+HttpOnly/);
    });

    it("rechaza un rol que no existe", async () => {
        const response = await request(app).post("/api/auth/demo").send({ role: "admin" });

        expect(response.status).toBe(400);
    });

    it("no existe si el modo demo está apagado", async () => {
        env.DEMO_MODE = false;
        const status = await request(app).get("/api/auth/demo");
        const login = await request(app).post("/api/auth/demo").send({ role: "organizer" });

        expect(status.body).toEqual({ enabled: false });
        expect(login.status).toBe(404);
    });

    it("avisa si los datos demo no están cargados", async () => {
        await prisma.user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });
        const response = await request(app).post("/api/auth/demo").send({ role: "captain" });

        expect(response.status).toBe(503);
    });
});
