import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Game, Match, TournamentDetail, TournamentFilters, TournamentSummary } from "./types";

export function gamesQuery() {
    return queryOptions({
        queryKey: ["games"],
        queryFn: () => apiFetch<{ games: Game[] }>("/games"),
        select: (data) => data.games,
        staleTime: Number.POSITIVE_INFINITY,
    });
}

export function tournamentsQuery(filters: TournamentFilters) {
    const params = new URLSearchParams();
    if (filters.game) {
        params.set("game", filters.game);
    }
    if (filters.status) {
        params.set("status", filters.status);
    }

    return queryOptions({
        queryKey: ["tournaments", filters],
        queryFn: () => apiFetch<{ tournaments: TournamentSummary[] }>(`/tournaments?${params}`),
        select: (data) => data.tournaments,
    });
}

export function tournamentQuery(slug: string) {
    return queryOptions({
        queryKey: ["tournament", slug],
        queryFn: () => apiFetch<{ tournament: TournamentDetail }>(`/tournaments/${encodeURIComponent(slug)}`),
        select: (data) => data.tournament,
    });
}

export function matchesQuery(slug: string) {
    return queryOptions({
        queryKey: ["tournament", slug, "matches"],
        queryFn: () => apiFetch<{ matches: Match[] }>(`/tournaments/${encodeURIComponent(slug)}/matches`),
        select: (data) => data.matches,
    });
}
