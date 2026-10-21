import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db/prisma.js";
import { app, gameId, resetDatabase, signUp } from "./helpers.js";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function startedFinal() {
    const organizer = await signUp("organizer");
    const created = await organizer.agent.post("/api/tournaments").send({
        name: "Final Directa",
        gameId: await gameId(),
        startsAt: "2030-01-01T18:00:00Z",
        maxTeams: 2,
        teamSize: 1,
        bestOf: 3,
    });
    const slug: string = created.body.tournament.slug;
    await organizer.agent.post(`/api/tournaments/${slug}/open`);

    const captains = [];
    for (const name of ["alpha", "bravo"]) {
        const captain = await signUp(name);
        const team = await captain.agent.post("/api/teams").send({ name, tag: name.slice(0, 3) });
        await captain.agent.post(`/api/tournaments/${slug}/registrations`).send({ teamId: team.body.team.id });
        await organizer.agent
            .patch(`/api/tournaments/${slug}/registrations/${team.body.team.id}`)
            .send({ status: "ACCEPTED" });
        captains.push({ ...captain, inviteCode: team.body.team.inviteCode as string });
    }
    await organizer.agent.post(`/api/tournaments/${slug}/start`);
    return { organizer, slug, alpha: captains[0], bravo: captains[1] };
}

describe("mis partidos", () => {
    it("el capitán ve su partido y puede reportarlo", async () => {
        const { slug, alpha } = await startedFinal();

        const { body } = await alpha.agent.get("/api/matches/mine");

        expect(body.matches).toHaveLength(1);
        expect(body.matches[0]).toMatchObject({
            status: "READY",
            round: 1,
            canReport: true,
            reportedBy: null,
            tournament: { slug, name: "Final Directa", bestOf: 3, _count: { matches: 1 } },
        });
    });

    it("un jugador que no es capitán lo ve, pero no puede reportarlo", async () => {
        const { alpha } = await startedFinal();
        const player = await signUp("player");
        await player.agent.post(`/api/join/${alpha.inviteCode}`);

        const { body } = await player.agent.get("/api/matches/mine");

        expect(body.matches).toHaveLength(1);
        expect(body.matches[0].canReport).toBe(false);
    });

    it("muestra quién reportó y desaparece al confirmarse", async () => {
        const { organizer, slug, alpha, bravo } = await startedFinal();
        const stranger = await signUp("stranger");
        const [match] = (await alpha.agent.get("/api/matches/mine")).body.matches;

        await bravo.agent.post(`/api/matches/${match.id}/report`).send({ scoreA: 2, scoreB: 1 });
        const reported = await alpha.agent.get("/api/matches/mine");
        expect(reported.body.matches[0]).toMatchObject({
            status: "REPORTED",
            scoreA: 2,
            scoreB: 1,
            reportedBy: { displayName: "bravo" },
        });

        const publicMatches = await request(app).get(`/api/tournaments/${slug}/matches`);
        expect(publicMatches.body.matches[0].reportedBy).toEqual({ displayName: "bravo" });

        expect((await stranger.agent.get("/api/matches/mine")).body.matches).toEqual([]);

        await organizer.agent.post(`/api/matches/${match.id}/confirm`);
        expect((await alpha.agent.get("/api/matches/mine")).body.matches).toEqual([]);
    });
});
