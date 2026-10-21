import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db/prisma.js";
import { app, gameId, resetDatabase, signUp } from "./helpers.js";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function createOpenTournament(organizer: Awaited<ReturnType<typeof signUp>>) {
    const created = await organizer.agent.post("/api/tournaments").send({
        name: "Copa de Prueba",
        gameId: await gameId(),
        startsAt: "2030-01-01T18:00:00Z",
        maxTeams: 8,
        teamSize: 1,
        bestOf: 3,
    });
    const slug: string = created.body.tournament.slug;
    await organizer.agent.post(`/api/tournaments/${slug}/open`);
    return slug;
}

async function registerTeam(slug: string, captainName: string, organizer: Awaited<ReturnType<typeof signUp>>) {
    const captain = await signUp(captainName);
    const team = await captain.agent.post("/api/teams").send({ name: captainName, tag: captainName.slice(0, 3) });
    const teamId: number = team.body.team.id;
    await captain.agent.post(`/api/tournaments/${slug}/registrations`).send({ teamId });
    await organizer.agent.patch(`/api/tournaments/${slug}/registrations/${teamId}`).send({ status: "ACCEPTED" });
    return { ...captain, teamId };
}

describe("torneo completo", () => {
    it("solo el organizador puede editar su torneo", async () => {
        const organizer = await signUp("organizer");
        const stranger = await signUp("stranger");
        const slug = await createOpenTournament(organizer);

        const response = await stranger.agent.patch(`/api/tournaments/${slug}`).send({ maxTeams: 16 });

        expect(response.status).toBe(403);
    });

    it("se juega de principio a fin y corona al campeón", async () => {
        const organizer = await signUp("organizer");
        const slug = await createOpenTournament(organizer);
        const first = await registerTeam(slug, "alpha", organizer);
        const second = await registerTeam(slug, "bravo", organizer);
        const third = await registerTeam(slug, "charlie", organizer);

        expect((await organizer.agent.post(`/api/tournaments/${slug}/start`)).status).toBe(200);

        const { body } = await request(app).get(`/api/tournaments/${slug}/matches`);
        const [byeMatch, semifinal, final] = body.matches;
        expect(body.matches).toHaveLength(3);
        expect(byeMatch).toMatchObject({ status: "CONFIRMED", teamA: { id: first.teamId }, teamB: null });
        expect(semifinal).toMatchObject({ status: "READY", teamA: { id: second.teamId }, teamB: { id: third.teamId } });
        expect(final).toMatchObject({ status: "PENDING", teamA: { id: first.teamId }, teamB: null });

        const strangerReport = await first.agent
            .post(`/api/matches/${semifinal.id}/report`)
            .send({ scoreA: 2, scoreB: 0 });
        expect(strangerReport.status).toBe(403);

        const invalidScore = await third.agent
            .post(`/api/matches/${semifinal.id}/report`)
            .send({ scoreA: 3, scoreB: 0 });
        expect(invalidScore.status).toBe(400);

        const report = await third.agent.post(`/api/matches/${semifinal.id}/report`).send({ scoreA: 1, scoreB: 2 });
        expect(report.body.match.status).toBe("REPORTED");

        expect((await third.agent.post(`/api/matches/${semifinal.id}/confirm`)).status).toBe(403);
        expect((await organizer.agent.post(`/api/matches/${semifinal.id}/confirm`)).status).toBe(200);

        const finalMatch = await request(app).get(`/api/tournaments/${slug}/matches`);
        expect(finalMatch.body.matches[2]).toMatchObject({ status: "READY", teamB: { id: third.teamId } });

        await organizer.agent.post(`/api/matches/${final.id}/confirm`).send({ scoreA: 2, scoreB: 1 });

        const tournament = await request(app).get(`/api/tournaments/${slug}`);
        expect(tournament.body.tournament).toMatchObject({ status: "FINISHED", winnerTeam: { id: first.teamId } });
    });
});
