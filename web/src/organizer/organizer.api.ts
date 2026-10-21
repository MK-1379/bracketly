import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { TeamSummary, TournamentDetail, TournamentSummary } from "../api/types";
import type { RegistrationStatus } from "../teams/teams.api";

export interface TournamentData {
    name: string;
    gameId: number;
    startsAt: string;
    maxTeams: number;
    teamSize: number;
    bestOf: number;
    description?: string;
    rules?: string;
}

export interface ManagedRegistration {
    status: RegistrationStatus;
    createdAt: string;
    team: TeamSummary & { captain: { displayName: string }; _count: { members: number } };
}

const slugPath = (slug: string) => `/tournaments/${encodeURIComponent(slug)}`;

export function myTournamentsQuery() {
    return queryOptions({
        queryKey: ["tournaments", "mine"],
        queryFn: () => apiFetch<{ tournaments: TournamentSummary[] }>("/tournaments/mine"),
        select: (data) => data.tournaments,
    });
}

export function registrationsQuery(slug: string) {
    return queryOptions({
        queryKey: ["tournament", slug, "registrations"],
        queryFn: () => apiFetch<{ registrations: ManagedRegistration[] }>(`${slugPath(slug)}/registrations`),
        select: (data) => data.registrations,
    });
}

export async function createTournament({ data, openNow }: { data: TournamentData; openNow: boolean }) {
    const { tournament } = await apiFetch<{ tournament: TournamentDetail }>("/tournaments", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (openNow) {
        await openTournament(tournament.slug);
    }
    return tournament;
}

export function openTournament(slug: string) {
    return apiFetch(`${slugPath(slug)}/open`, { method: "POST" });
}

export function startTournament(slug: string) {
    return apiFetch(`${slugPath(slug)}/start`, { method: "POST" });
}

export function deleteTournament(slug: string) {
    return apiFetch<void>(slugPath(slug), { method: "DELETE" });
}

export function reviewRegistration({
    slug,
    teamId,
    status,
}: {
    slug: string;
    teamId: number;
    status: "ACCEPTED" | "REJECTED";
}) {
    return apiFetch(`${slugPath(slug)}/registrations/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export async function updateTournament({ slug, data }: { slug: string; data: Partial<TournamentData> }) {
    const { tournament } = await apiFetch<{ tournament: TournamentDetail }>(slugPath(slug), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return tournament;
}

export function confirmMatch({ matchId, scoreA, scoreB }: { matchId: number; scoreA?: number; scoreB?: number }) {
    return apiFetch(`/matches/${matchId}/confirm`, { method: "POST", body: JSON.stringify({ scoreA, scoreB }) });
}
