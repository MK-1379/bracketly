import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTournament,
    deleteTournament,
    myTournamentsQuery,
    openTournament,
    registrationsQuery,
    reviewRegistration,
    startTournament,
} from "./organizer.api";

export function useMyTournaments() {
    return useQuery(myTournamentsQuery());
}

export function useRegistrations(slug: string, enabled: boolean) {
    return useQuery({ ...registrationsQuery(slug), enabled });
}

function useTournamentMutation<TVariables, TData>(slug: string, mutationFn: (variables: TVariables) => Promise<TData>) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["tournament", slug] }),
                queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
            ]),
    });
}

export function useCreateTournament() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTournament,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
    });
}

export function useOpenTournament(slug: string) {
    return useTournamentMutation(slug, openTournament);
}

export function useStartTournament(slug: string) {
    return useTournamentMutation(slug, startTournament);
}

export function useReviewRegistration(slug: string) {
    return useTournamentMutation(slug, reviewRegistration);
}

export function useDeleteTournament() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTournament,
        onSuccess: (_data, slug) => {
            queryClient.removeQueries({ queryKey: ["tournament", slug] });
            return queryClient.invalidateQueries({ queryKey: ["tournaments"] });
        },
    });
}
