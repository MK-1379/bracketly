export type FieldErrors = Record<string, string[] | undefined>;

export class ApiError extends Error {
    readonly status: number;
    readonly fields: FieldErrors;

    constructor(status: number, message: string, fields: FieldErrors = {}) {
        super(message);
        this.status = status;
        this.fields = fields;
    }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`/api${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new ApiError(response.status, body?.error ?? response.statusText, body?.fields);
    }

    if (response.status === 204) {
        return undefined as T;
    }
    return response.json();
}