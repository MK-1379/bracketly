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

export interface TeamSummary {
    id: number;
    name: string;
    tag: string;
}

export interface TournamentDetail extends TournamentSummary {
    description: string | null;
    rules: string | null;
    createdAt: string;
    winnerTeam: TeamSummary | null;
    registrations: { seed: number | null; team: TeamSummary }[];
}

export type MatchStatus = "PENDING" | "READY" | "REPORTED" | "CONFIRMED";

export interface Match {
    id: number;
    round: number;
    position: number;
    status: MatchStatus;
    scoreA: number | null;
    scoreB: number | null;
    proofUrl: string | null;
    nextMatchId: number | null;
    nextSlot: "A" | "B" | null;
    winnerTeamId: number | null;
    updatedAt: string;
    teamA: TeamSummary | null;
    teamB: TeamSummary | null;
}