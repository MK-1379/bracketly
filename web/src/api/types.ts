export type TournamentStatus = "DRAFT" | "REGISTRATION" | "IN_PROGRESS" | "FINISHED";

export interface Game {
    id: number;
    slug: string;
    name: string;
    logoUrl: string | null;
}

export interface TournamentSummary {
    id: number;
    slug: string;
    name: string;
    startsAt: string;
    maxTeams: number;
    teamSize: number;
    bestOf: number;
    status: TournamentStatus;
    game: Pick<Game, "slug" | "name" | "logoUrl">;
    organizer: { id: number; displayName: string };
    _count: { registrations: number };
}

export interface TournamentFilters {
    game?: string;
    status?: TournamentStatus;
}