import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db/prisma.js";
import { gameId, resetDatabase, signUp } from "./helpers.js";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("mis equipos", () => {
    it("el código de invitación solo lo ve el capitán", async () => {
        const captain = await signUp("captain");
        const player = await signUp("player");
        const created = await captain.agent.post("/api/teams").send({ name: "Zero Ping", tag: "zpg" });
        expect(created.body.team.tag).toBe("ZPG");

        const joined = await player.agent.post(`/api/join/${created.body.team.inviteCode}`);
        expect(joined.status).toBe(201);

        const captainView = await captain.agent.get("/api/teams/mine");
        expect(captainView.body.teams[0]).toMatchObject({ isCaptain: true, inviteCode: created.body.team.inviteCode });
        expect(captainView.body.teams[0].members).toHaveLength(2);

        const playerView = await player.agent.get("/api/teams/mine");
        expect(playerView.body.teams[0].isCaptain).toBe(false);
        expect(playerView.body.teams[0].inviteCode).toBeUndefined();
    });

    it("al regenerar el código, el anterior deja de funcionar", async () => {
        const captain = await signUp("captain");
        const late = await signUp("late");
        const created = await captain.agent.post("/api/teams").send({ name: "Vortex", tag: "VTX" });
        const oldCode: string = created.body.team.inviteCode;

        const regenerated = await captain.agent.post(`/api/teams/${created.body.team.id}/invite-code`);
        expect(regenerated.body.inviteCode).not.toBe(oldCode);

        expect((await late.agent.post(`/api/join/${oldCode}`)).status).toBe(404);
        expect((await late.agent.post(`/api/join/${regenerated.body.inviteCode}`)).status).toBe(201);
    });

    it("incluye las inscripciones del equipo con su torneo", async () => {
        const organizer = await signUp("organizer");
        const captain = await signUp("captain");
        const tournament = await organizer.agent.post("/api/tournaments").send({
            name: "Copa de Equipos",
            gameId: await gameId(),
            startsAt: "2030-01-01T18:00:00Z",
            maxTeams: 8,
            teamSize: 1,
            bestOf: 1,
        });
        const slug: string = tournament.body.tournament.slug;
        await organizer.agent.post(`/api/tournaments/${slug}/open`);
        const team = await captain.agent.post("/api/teams").send({ name: "Atlas", tag: "ATL" });
        await captain.agent.post(`/api/tournaments/${slug}/registrations`).send({ teamId: team.body.team.id });

        const { body } = await captain.agent.get("/api/teams/mine");

        expect(body.teams[0].registrations).toEqual([
            {
                status: "PENDING",
                tournament: {
                    slug,
                    name: "Copa de Equipos",
                    status: "REGISTRATION",
                    startsAt: "2030-01-01T18:00:00.000Z",
                    teamSize: 1,
                },
            },
        ]);
    });
});
