import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demoQuery, login, loginAsDemo, logout, meQuery, register } from "./auth.api";

export function useCurrentUser() {
    return useQuery(meQuery());
}

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: login,
        onSuccess: (user) => queryClient.setQueryData(meQuery().queryKey, user),
    });
}

export function useDemoEnabled() {
    return useQuery(demoQuery());
}

export function useDemoLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loginAsDemo,
        onSuccess: (user) => queryClient.setQueryData(meQuery().queryKey, user),
    });
}

export function useRegister() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: register,
        onSuccess: (user) => queryClient.setQueryData(meQuery().queryKey, user),
    });
}

export function useLogout() {
    return useMutation({
        mutationFn: logout,
        onSuccess: () => window.location.assign("/"),
    });
}
