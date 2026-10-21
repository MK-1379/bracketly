import { queryOptions } from "@tanstack/react-query";
import { ApiError, apiFetch } from "../api/client";

export interface User {
    id: number;
    email: string;
    displayName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData extends LoginData {
    displayName: string;
}

export function meQuery() {
    return queryOptions({
        queryKey: ["me"],
        queryFn: async () => {
            try {
                const data = await apiFetch<{ user: User }>("/auth/me");
                return data.user;
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    return null;
                }
                throw error;
            }
        },
        staleTime: Number.POSITIVE_INFINITY,
    });
}

export async function login(data: LoginData) {
    const response = await apiFetch<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(data) });
    return response.user;
}

export async function register(data: RegisterData) {
    const response = await apiFetch<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(data) });
    return response.user;
}

export function logout() {
    return apiFetch<void>("/auth/logout", { method: "POST" });
}