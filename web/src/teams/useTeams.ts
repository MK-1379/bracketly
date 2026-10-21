import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cancelRegistration,
    createTeam,
    joinTeam,
    myTeamsQuery,
    regenerateInviteCode,
    registerTeam,
    removeMember,
} from "./teams.api";

export function useMyTeams() {
    return useQuery(myTeamsQuery());
}

export function useMyTeam(teamId: number) {
    return useQuery({
        ...myTeamsQuery(),
        select: (data) => data.teams.find((team) => team.id === teamId) ?? null,
    });
}

function useTeamMutation<TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: myTeamsQuery().queryKey }),
    });
}

export function useCreateTeam() {
    return useTeamMutation(createTeam);
}

export function useJoinTeam() {
    return useTeamMutation(joinTeam);
}

export function useRegenerateInviteCode() {
    return useTeamMutation(regenerateInviteCode);
}

export function useRemoveMember() {
    return useTeamMutation(removeMember);
}

export function useRegisterTeam() {
    return useTeamMutation(registerTeam);
}

export function useCancelRegistration() {
    return useTeamMutation(cancelRegistration);
}
