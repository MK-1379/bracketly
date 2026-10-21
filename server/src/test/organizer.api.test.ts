import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db/prisma.js";
import { app, gameId, resetDatabase, signUp } from "./helpers.js";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function createDraft(organizer: Awaited<ReturnType<typeof signUp>>, name: string) {
    const response = await organizer.agent.post("/api/tournaments").send({
        name,
        gameId: await gameId(),
        startsAt: "2030-01-01T18:00:00Z",
        maxTeams: 8,
        teamSize: 1,
        bestOf: 1,
    });
    return response.body.tournament.slug as string;
}

describe("panel del organizador", () => {
    it("mis torneos incluye los borradores, pero solo los míos", async () => {
        const organizer = await signUp("organizer");
        const other = await signUp("other");
        const draft = await createDraft(organizer, "Borrador Secreto");
        await createDraft(other, "Torneo Ajeno");

        const mine = await organizer.agent.get("/api/tournaments/mine");
        expect(mine.body.tournaments).toHaveLength(1);
        expect(mine.body.tournaments[0]).toMatchObject({ slug: draft, status: "DRAFT" });

        const publicList = await request(app).get("/api/tournaments");
        expect(publicList.body.tournaments).toEqual([]);
    });

    it("las inscripciones muestran el capitán y el número de jugadores", async () => {
        const organizer = await signUp("organizer");
        const captain = await signUp("captain");
        const slug = await createDraft(organizer, "Copa Abierta");
        await organizer.agent.post(`/api/tournaments/${slug}/open`);
        const team = await captain.agent.post("/api/teams").send({ name: "Atlas", tag: "ATL" });
        await captain.agent.post(`/api/tournaments/${slug}/registrations`).send({ teamId: team.body.team.id });

        const { body } = await organizer.agent.get(`/api/tournaments/${slug}/registrations`);

        expect(body.registrations[0]).toMatchObject({
            status: "PENDING",
            team: { name: "Atlas", captain: { displayName: "captain" }, _count: { members: 1 } },
        });
    });
});

describe("editar torneo", () => {
    it("no deja bajar el máximo de equipos por debajo de los aceptados", async () => {
        const organizer = await signUp("organizer");
        const slug = await createDraft(organizer, "Copa Editable");
        await organizer.agent.post(`/api/tournaments/${slug}/open`);
        for (const name of ["alpha", "bravo", "charlie"]) {
            const captain = await signUp(name);
            const team = await captain.agent.post("/api/teams").send({ name, tag: name.slice(0, 3) });
            await captain.agent.post(`/api/tournaments/${slug}/registrations`).send({ teamId: team.body.team.id });
            await organizer.agent
                .patch(`/api/tournaments/${slug}/registrations/${team.body.team.id}`)
                .send({ status: "ACCEPTED" });
        }

        const tooSmall = await organizer.agent.patch(`/api/tournaments/${slug}`).send({ maxTeams: 2 });
        expect(tooSmall.status).toBe(409);

        const renamed = await organizer.agent
            .patch(`/api/tournaments/${slug}`)
            .send({ name: "Copa Editada", maxTeams: 4, rules: "Sin trampas" });
        expect(renamed.body.tournament).toMatchObject({
            slug,
            name: "Copa Editada",
            maxTeams: 4,
            rules: "Sin trampas",
        });
    });
});
