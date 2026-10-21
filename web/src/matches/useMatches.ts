import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myMatchesQuery, reportMatch } from "./matches.api";

export function useMyMatches() {
    return useQuery(myMatchesQuery());
}

export function useMyMatch(matchId: number) {
    return useQuery({
        ...myMatchesQuery(),
        select: (data) => data.matches.find((match) => match.id === matchId) ?? null,
    });
}

export function useReportMatch(tournamentSlug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reportMatch,
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: myMatchesQuery().queryKey }),
                queryClient.invalidateQueries({ queryKey: ["tournament", tournamentSlug] }),
            ]),
    });
}
