import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Match } from "../api/types";

export interface MyMatch extends Match {
    canReport: boolean;
    tournament: { slug: string; name: string; bestOf: number; _count: { matches: number } };
}

export interface ReportData {
    scoreA: number;
    scoreB: number;
    proofUrl?: string;
}

export function myMatchesQuery() {
    return queryOptions({
        queryKey: ["matches", "mine"],
        queryFn: () => apiFetch<{ matches: MyMatch[] }>("/matches/mine"),
        select: (data) => data.matches,
    });
}

export function reportMatch({ matchId, data }: { matchId: number; data: ReportData }) {
    return apiFetch<{ match: Match }>(`/matches/${matchId}/report`, { method: "POST", body: JSON.stringify(data) });
}

export function totalRounds(match: MyMatch) {
    return Math.log2(match.tournament._count.matches + 1);
}
