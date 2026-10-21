import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { TeamSummary, TournamentStatus } from "../api/types";

export type RegistrationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface TeamMember {
    joinedAt: string;
    user: { id: number; displayName: string };
}

export interface TeamRegistration {
    status: RegistrationStatus;
    tournament: { slug: string; name: string; status: TournamentStatus; startsAt: string; teamSize: number };
}

export interface MyTeam extends TeamSummary {
    captain: { id: number; displayName: string };
    members: TeamMember[];
    registrations: TeamRegistration[];
    isCaptain: boolean;
    inviteCode?: string;
}

export interface TeamData {
    name: string;
    tag: string;
}

export function myTeamsQuery() {
    return queryOptions({
        queryKey: ["teams", "mine"],
        queryFn: () => apiFetch<{ teams: MyTeam[] }>("/teams/mine"),
        select: (data) => data.teams,
    });
}

export async function createTeam(data: TeamData) {
    const response = await apiFetch<{ team: MyTeam }>("/teams", { method: "POST", body: JSON.stringify(data) });
    return response.team;
}

export function regenerateInviteCode(teamId: number) {
    return apiFetch<{ inviteCode: string }>(`/teams/${teamId}/invite-code`, { method: "POST" });
}

export function removeMember({ teamId, userId }: { teamId: number; userId: number }) {
    return apiFetch<void>(`/teams/${teamId}/members/${userId}`, { method: "DELETE" });
}

export async function joinTeam(code: string) {
    const response = await apiFetch<{ team: TeamSummary }>(`/join/${encodeURIComponent(code)}`, { method: "POST" });
    return response.team;
}

export function registerTeam({ slug, teamId }: { slug: string; teamId: number }) {
    return apiFetch(`/tournaments/${encodeURIComponent(slug)}/registrations`, {
        method: "POST",
        body: JSON.stringify({ teamId }),
    });
}

export function cancelRegistration({ slug, teamId }: { slug: string; teamId: number }) {
    return apiFetch<void>(`/tournaments/${encodeURIComponent(slug)}/registrations/${teamId}`, { method: "DELETE" });
}

export function inviteUrl(code: string) {
    return `${window.location.origin}/unirse/${code}`;
}
